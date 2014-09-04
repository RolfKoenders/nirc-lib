
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

