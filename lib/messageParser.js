
var Parser = {

    parse: function(data) {
        var obj = {};
        var result = /(?:^:\S*) ((?:\d+)|(?:\w[A-Z]*)) (?:.*)/.exec(data);
        
        // FIXME This is becuase some unicode characters are not picked up by the regex
        if(result === null) {
            obj.message = data;
        } else {
            obj.message = result[0];
            if(isNaN(result[1])) {
                obj.code = false;
                obj.command = result[1];
                obj = this.command(obj);
            } else {
                obj.code = result[1];
                obj.command = false;    
            }
        }
        return obj;
    },

    command: function(data) {
        if(data.command === 'PRIVMSG') {
            data.msg = {};
            var result = /(#[a-zA-Z\#\-\_]+) (.*)/.exec(data.message);
            data.msg.channel = result[1];
            data.msg.message = result[2];
            var user = /^:\w+[a-zA-Z0-9]/.exec(data.message);
            data.msg.from = user[0].substring(1);
            return data;
        }

        if(data.command === 'NOTICE') {
            var notice = /:\*.*/.exec(data.message);
            data.notice = notice[0].substring(1);
            return data;
        }
    },

    ping: function(data) {
        if(/^PING/.test(data.toString())) {
            return {
                data: 'PONG'
            };
        }
        return;
    }

};

module.exports = Parser;
