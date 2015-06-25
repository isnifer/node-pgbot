var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , request = require('request')
  , qs = require('querystring')
  , Q = require('q');

//request.debug = true;

function Bot(options) {
  this.id = '';
  this.first_name = '';
  this.username = '';
  this.token = options.token;
  this.offset = 0;
  this.interval = options.token ? options.token : 500;
  this.polling = false;
  this.base_url = 'https://api.telegram.org/bot'
}

util.inherits(Bot, EventEmitter);

Bot.prototype._get = function (options, callback) {
  var url = this.base_url + this.token + '/' + options.method;

  if (options.params) {
    url += '?' + qs.stringify(options.params);
  }

  request.get({
    url: url,
    json: true
  }, function (err, res, body) {
    if (err) {
      callback(err);
    } else {
      callback(null, body);
    }
  });

  return this;
};

Bot.prototype._poll = function () {
  var self = this;
  var url = this.base_url + this.token + '/getUpdates?timeout=60&offset=' + this.offset;

  request.get({
    url: url,
    json: true
  }, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      if (body.ok) {
        body.result.forEach(function (msg) {
          if (msg.update_id >= self.offset) {
            self.offset = msg.update_id + 1;
            self.emit('message', msg.message);
          }
        });
      }
    }

    if (self.polling) {
      self._poll();
    }

  });
}

Bot.prototype.start = function () {
  var self = this;

  self._poll();
  self.polling = true;

  console.log('Bot started');

  return self;
};

Bot.prototype.stop = function () {
  var self = this;

  self.polling = false;

  return self;
};

Bot.prototype.getMe = function (callback) {
  var self = this
    , deferred = Q.defer();

  this._get({ method: 'getMe' }, function (err, res) {
    if (err) {
      return deferred.reject(res);
    }

    if (res.ok) {
      self.id = res.result.id;
      self.first_name = res.result.first_name;
      self.username = res.result.username;

      deferred.resolve(res.result);
    } else {
      deferred.reject(res);
    }
  });

  return deferred.promise.nodeify(callback);
};

Bot.prototype.sendMessage = function (options, callback) {
  var self = this
    , deferred = Q.defer();

  this._get({
    method: 'sendMessage',
    params: {
      chat_id: options.chat_id,
      text: options.text
    }
  }, function (err, res) {
    if (err) {
      return deferred.reject(res);
    }

    if (res.ok) {
      deferred.resolve(res.result);
    } else {
      deferred.reject(res);
    }
  });

  return deferred.promise.nodeify(callback);
};

module.exports = Bot;
