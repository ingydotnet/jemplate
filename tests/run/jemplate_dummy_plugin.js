if (typeof dummy == 'undefined') {
    dummy = function() {
//        this.context = arguments[0];
    };
}

dummy.prototype.simple = function() {
    return 'This text came from the plugin';
}

dummy.prototype.params = function(one, two) {
    return 'params: '+one+', '+two;
}
