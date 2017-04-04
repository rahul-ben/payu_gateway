'use strict';
var express = require('express');
var http = require('http');
var app = express();
var config = require('./settings/config');

require('./settings/express').configure(app);
require('./settings/routes').configure(app);

var server = http.createServer(app);
var port = process.env.PORT || config.webServer.port || 3500;
server.listen(port, function () {
    console.log('express ready');
});
console.log('listening a http://localhost:' + port);