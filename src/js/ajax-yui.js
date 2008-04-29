;(function(){

Jemplate.Ajax = {

    get: function(url, callback) {
        if (typeof callback == "function") {
            callback = { success: callback };
        }
        YAHOO.connect.asyncRequest("GET", url, callback);
    },

    processGet: function(url, processor) {
        this.get(url, function(responseText){
            Jemplate.process(YAHOO.lang.JSON.parse(responseText));
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
