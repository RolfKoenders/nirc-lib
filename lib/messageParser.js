
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
                obj.message = result[0];
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

    code: function(data) {
        switch(data.code) {
            case '353':
                var result = /(#\w*) (:.*)/.exec(data.message);
                var channel = result[1];
                var users = result[2].substring(1).split(' '); 
                data.type = 'NAMES';
                data.channel = {
                    cname: channel,
                    names: users
                };
                break;
            case '366':
                var channel = /(#\w*)/.exec(data.message);
                data.type = 'ENDOFNAMES';
                data.channel = {
                    cname: channel[1]
                };
                break;
            default:
                break;
        }
        return data;
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
