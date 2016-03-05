#!/usr/bin/env node
/*jslint node:true*/
(function () {
    'use strict';
    var program = require('commander'),
        pkg = require('./package'),
        url = require('url'),
        run = require('./');

    function collect(val, memo) {
        var k = val.split(/ ?: ?/);
        memo[k[0]] = k[1];
        return memo;
    }
    function normalize(val, memo) {
        try {
            memo = JSON.parse(val);
        } catch (e) { memo = val; }
        return memo;
    }
    function next(req) { console.log(req); }
    function close(err) { console.error(err); }
    function getRequest() {
        var loc = url.parse(program.args[0], true);
        return {
            url: loc.href,
            method: program.method,
            headers: program.headers,
            body: program.body,
            query: loc.query //TODO: process query data types
        };
    }

    program
        .version(pkg.version)
        .option('-X --method [method]', 'Set request method')
        .option('-H --headers [header]', 'Set request header', collect, {})
        .option('-d --body [body]', 'Set request body', normalize, {})
        .option('-s --swagger <file.{json,yaml}>', 'define swagger template')
        .parse(process.argv);

    run
        .source(program.swagger)
        .validate(getRequest())
        .then(next)
        .catch(close);
}());
