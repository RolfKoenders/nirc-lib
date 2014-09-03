var net = require('net');
var util = require('util');
var events = require('events');
var parser = require('./messageParser');

function readOptions(options) {
    options.connection = {
        port: options.port,
        host: options.host,
        encoding: 'ascii'
    }
    options.ident = options.ident || 'nirc-lib';
    delete options.port;
    delete options.host;
    return options;
}

function IRCConnection(options) {
    events.EventEmitter.call(this);

    this.options = readOptions(options);
    this.connected = false;
    this.socket = new net.Socket();

    console.log('[IRC-Lib] - IRCConnection created');
}

IRCConnection.prototype.connect = function() {
    console.log(this.options);
    var _this = this;
    var options = this.options;

    this.socket.setEncoding(options.connection.encoding);
    this.socket.setNoDelay();

    this.socket.connect(options.connection.port, options.connection.host,
        function() {
            _this.connected = true;
            _this._write('NICK ', options.nick);
            _this._write('USER ', options.ident, ' 0 * :', options.realname);

            if(arguments[0])
                arguments[0]();

            _this.emit('connected');

            console.log('[IRC-Lib] - Connected to ',
                options.connection.host + ':' +
                options.connection.port);

    })
    .on('error', function(err) {
        console.log('[IRC-Lib] - ( ' + options.connection.host + 'Error: ' + err);
    })
    .on('close', function(data) {
        _this.connected = false;
        console.log('[IRC-Lib] - Disconnected from ',
            options.connection.host + ':' +
            options.connection.port);
    });
};

IRCConnection.prototype.onData = function(data) {
    var parsedData = parser.parse(data);

    if(!parsedData) {
        return console.error('Something went wrong while parsing.');
    }
};

IRCConnection.prototype.disconnect = function(message) {
    this._wirte('QUIT : ' + (message || ''));
};

IRCConnection.prototype._write = function(data) {
    if(!this.connected) return;
    this.socket.write(data);
};

IRCConnection.prototype.send = function(data) {
    this._write(data);
}

IRCConnection.prototype.__proto__ = events.EventEmitter.prototype;

module.exports.Connection = IRCConnection;
