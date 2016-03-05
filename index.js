/*jslint node:true*/
module.exports = (function () {
    var sway = require('sway'),
        api,
        context = { request: null, succeed: null, fail: null},
        promise;

    function fail(status, msg) {
        var types = {
                400: 'BAD REQUEST',
                404: 'NOT FOUND',
                500: 'INTERNAL SERVER ERROR'
            },
            error = {
                code: status,
                error: types[status],
                message: msg.replace(/ {2,}/g, ' ')
            };
        context.fail(error);
    }
    function succeed(req) { context.succeed(req); }

    function validate(req) {
        // Adding temp 'content-type'
        // due to case sensitiveness on sway
        if (req.headers && req.headers['Content-Type']) {
            req.headers['content-type'] = req.headers['Content-Type'];
        }
        var op = api.getOperation(req),
            errors = op && op.validateRequest(req).errors,
            error = errors && errors[0],
            subError = error && error.errors && error.errors[0],
            msg;
        if (!errors) { return fail(404, 'endpoint not found'); }
        if (error) {
            msg = error.message;
            if (subError) {
                msg = error.in
                    + '[' + error.name + ']'
                    + ' : '
                    + subError.message;
            }
            return fail(400, msg);
        }
        req.params = {};
        req.path = api.getPath(req).path;
        op.getParameters().forEach(function (param) {
            req.params[param.name] = param.getValue(req).value;
        });
        // Removing temp 'content-type'
        if (req.headers) { delete req.headers['content-type']; }
        succeed(req);
    }

    function source(definition) {
        sway.create({ definition: definition })
            .then(function ($api) {
                api = $api;
                validate(context.request);
            })
            .catch(function (err) { fail(500, err.message); });
        return promise;
    }

    promise =  {
        source: source,
        validate: function ($request) {
            context.request = $request;
            return promise;
        },
        then: function ($succeed, $error) {
            context.succeed = $succeed;
            if ($error) { context.fail = $error; }
            return promise;
        },
        catch: function ($error) { context.fail = $error; }
    };

    return promise;
}());
