'use strict';
let express = require('express'),
    sequelize = require('./sequelize.js'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    shortid = require('shortid');

let RedisStore = require('connect-redis')(session);

module.exports = function(app, config) {
  app.set('view engine', 'jade');
  app.set('views', config.path + 'server/views/');
  app.use(logger('dev'));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(session({
    proxy: true,
    secret: 'matt is so secretive',
    resave: false,
    saveUninitialized: false,
    genid: function(req) {
      return shortid.generate();
    },
    cookie: {},
    store: new RedisStore({
       host: 'localhost',
       port: 9382      
    })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(config.path + 'public'));

};
