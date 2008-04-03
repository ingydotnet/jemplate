;(function(){

Jemplate.Ajax = {

    get: function(url, callback) {
        jQuery.get(url, null, callback);
    },

    processGet: function(url, processor) {
        jQuery.getJSON(url, null, processor);
    },

    post: function(url, data, callback) {
        jQuery.post(url, data, callback);
    }

};

}());

