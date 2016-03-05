/*jslint node:true*/
'use strict';
var swurl = require('../'),
    request = {
        url: '/user/false',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        query: { test: '123' },
        body: { name: 'John', age: 10 }
    };

function next(req) { console.log(req); }
function close(err) { console.error(err); }
function init() {
    swurl
        .source('./test/swagger.yaml')
        .validate(request)
        .then(next)
        .catch(close);
}
init();
