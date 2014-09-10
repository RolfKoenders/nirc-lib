var net = require('net');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var parser = require('./messageParser');
var es = require('event-stream');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'nirc-lib'});

function readOptions(options) {
    options.connection = {
        port: options.port,
        host: options.host,
        encoding: 'ascii'
    };
    options.ident = options.ident || 'nirc-lib';
    delete options.port;
    delete options.host;
    return options;
}

function IRCConnection(options) {
    EventEmitter.call(this);

    this.options = readOptions(options);
    this.connected = false;

    log.info('IRCConnection created');
}

util.inherits(IRCConnection, EventEmitter);

IRCConnection.prototype.connect = function() {
    log.info(this.options);
    var _this = this;
    var options = this.options;

    _this.socket = new net.Socket();
    _this.socket.setEncoding('ascii');
    _this.socket.setNoDelay();

    _this.listen.call(_this);

    _this.socket
        .pipe(es.split())
        .pipe(es.map(function(data, cb) {
            var respond = parser.respond(data);
            if(respond) {
                _this.write.call(_this, respond.data);
                cb();
            }
            cb(null, data);
        }))
        .pipe(es.map(function(data, cb) {
            var message = parser.parse(data);
            cb(null, message);
        }))
        .on('data', function(data) {
            log.info(data);
            _this.emit('data', data);
        });

    _this.socket.connect(options.connection.port, options.connection.host,
        function() {
            _this.connected = true;
            _this.write('NICK ' + options.nick);
            _this.write('USER ' + options.ident + ' 0 * :' + options.realname);

            if(arguments[0])
                arguments[0]();

            _this.emit('connected');
            log.info('Connected to ',
                options.connection.host + ':' +
                options.connection.port);

    })
    .on('error', function(err) {
        log.info(options.connection.host + 'Error: ' + err);
    })
    .on('close', function(data) {
        _this.connected = false;
        log.info('Disconnected from ',
            options.connection.host + ':' +
            options.connection.port);
    });
};

IRCConnection.prototype.disconnect = function(message) {
    this.write('QUIT : ' + (message || ''));
};

IRCConnection.prototype.write = function(data) {
    //if(!this.connected) return;
    this.socket.write(data + '\n', 'ascii', function() {
        log.info('SENT - ', data);
    });
};

IRCConnection.prototype.send = function(data) {
    this.write(data);
};

IRCConnection.prototype.listen = function() {
    var _this = this;
    _this.on('cmd', function(data) {
        _this.write(data);
    });
};

module.exports.Connection = IRCConnection;
