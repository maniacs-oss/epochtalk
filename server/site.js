'use strict';
var express = require('express');
var RedisStore = require('connect-redis')(express);
var config = require('./config');
var app = express();
var engines = require('consolidate');
var db = require('./db');
app.engine('haml', engines.haml);
app.set('view engine', 'haml');
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use('/', express.static(config.root + '/public'));
app.use(express.logger('dev'));
app.use(express.cookieParser('adness'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.session({
  store: new RedisStore({
    host: config.redis.host,
    port: config.redis.port,
  }),
  cookie: {
    secure: false,
    maxAge:86400000
  }
}));

app.get('/', function(req, res){
  return res.render('home', {greeting: 'asdf'});
});

app.get('/api/boards', function(req, res) {
  db.boards.all(function(err, boards) {
    return res.json(boards);
  });
});

app.get('/api/boards/:boardId', function(req, res) {
  db.boards.find(req.params.boardId, function(err, board) {
    return res.json(board);
  });
});

app.get('/api/topics', function(req, res) {
  if (req.query.boardId) {
    db.topics.byBoard(req.query.boardId, req.query.limit, req.query.startkey_docid, function(err, topics) {
      return res.json(topics);
    });
  }
  else {
    db.topics.all(req.query.limit, req.query.startkey, function(err, topics) {
      return res.json(topics);
    });
  }
});

app.get('/api/topics/:topicId', function(req, res) {
  db.topics.find(req.params.topicId, function(err, topic) {
    return res.json(topic);
  });
});

app.get('/api/messages', function(req, res) {
  if (req.query.topicId) {
    console.log('by topic: ' + req.query.topicId);
    db.messages.byTopic(req.query.topicId, req.query.limit, req.query.startkey_docid, function(err, messages) {
      return res.json(messages);
    });
  }
  else {
    db.messages.all(function(err, messages) {
      return res.json(messages);
    });
  }
});

app.get('/api/messages/:messageId', function(req, res) {
  console.log('find message: ' + req.params.messageId);
  db.messages.find(req.params.messageId, function(err, message) {
    return res.json(message);
  });
});




module.exports = app;
