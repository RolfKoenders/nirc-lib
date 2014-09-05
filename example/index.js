
var IRCConnection = require('../index.js').Connection;

var con = new IRCConnection({
    host: 'irc.freenode.net',
    port: '6665',
    nick: 'RolfTest',
    realname: 'Rolf',
    ident: 'rolf'
});

con.connect();
con.on('connected', function(data) {
    console.log('Connected');
});

con.on('data', function(data) {
    console.log('Data received: ', data.toString());
});

