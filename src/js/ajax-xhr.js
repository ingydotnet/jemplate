;(function(){

Jemplate.Ajax = {

    get: function(url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, Boolean(callback));
        request.setRequestHeader('Accept', 'text/json; text/x-json; application/json');
        return this.request(request, null, callback);
    },

    processGet: function(url, processor) {
        this.get(url, function(responseText){
            process(Jemplate.JSON.parse(responseText));
        });
    },

    post: function(url, data, callback) {
        var request = new XMLHttpRequest();
        request.open('POST', url, Boolean(callback));
        request.setRequestHeader('Accept', 'text/json; text/x-json; application/json');
        request.setRequestHeader(
            'Content-Type', 'application/x-www-form-urlencoded'
        );
        return this.request(request, data, callback);
    },

    request: function(request, data, callback) {
        if (callback) {
            request.onreadystatechange = function() {
                if (request.readyState == 4) {
                    if(request.status == 200)
                        callback(request.responseText);
                }
            };
        }
        request.send(data);
        if (!callback) {
            if (request.status != 200)
                throw('Request for "' + url +
                      '" failed with status: ' + request.status);
            return request.responseText;
        }
        return null;
    }
};

}());
