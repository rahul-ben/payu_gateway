var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

module.exports.configure = function (app) {
    app.use(logger('combined'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    var root = path.normalize(__dirname + './../');
    app.set('views', path.join(root, 'views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(root, 'public')));
};

