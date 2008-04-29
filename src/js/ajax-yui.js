;(function(){

Jemplate.Ajax = {

    get: function(url, callback) {
        if (typeof callback == "function") {
            callback = { success: callback };
        }
        YAHOO.connect.asyncRequest("GET", url, callback);
    },

    processGet: function(url, processor) {
        var me = this;
        this.get(url, function(responseText){
            me.process(YAHOO.lang.JSON.parse(responseText));
        });
    },

    post: function(url, data, callback) {
        if (typeof callback == "function") {
            callback = { success: callback };
        }
        YAHOO.connect.asyncRequest("POST", url, callback, data);
    }

};

}());
