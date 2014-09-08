
var Parser = {

    parse: function(data) {
        return data;            
    },

    respond: function(data) {
        var code = data.toString().match(/\d{1,3}/);
        if(!code) {
            if(/^PING/.test(data.toString())) {
                return {
                    data: 'PONG'
                };
            } else {
                return;
            }
            return;
        }
    }

};

module.exports = Parser;
