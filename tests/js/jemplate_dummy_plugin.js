if (typeof dummy == 'undefined') {
    dummy = function() {
        this.context = arguments[0];
        this.what = arguments[1];
    };
}

dummy.prototype.simple = function() {
    return 'This text came from the plugin';
}

dummy.prototype.params = function(one, two) {
    return 'params: '+one+', '+two;
}

dummy.prototype.get_what = function() {
    return 'what: ' + this.what;
}
