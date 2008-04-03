;(function(){

Jemplate.JSON = {

    parse: function(encoded) {
        return YAHOO.lang.JSON.parse(encoded);
    },

    stringify: function(decoded) {
        return YAHOO.lang.JSON.stringify(decoded);
    }

};

}());
