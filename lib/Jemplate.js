if (typeof(Jemplate) == 'undefined')
    Jemplate = function() {};

proto = Jemplate.prototype;

Jemplate.templateMap = {
    // 'hello.html': function() { return 'yay' }
};

Jemplate.process = function(template, data) {
    var context = new Jemplate.Context();
    context.stash = new Jemplate.Stash();
    context.stash.init(data);
    var func = Jemplate.templateMap[template];
    if (typeof(func) == 'undefined')
        throw('No Jemplate template named "' + template + '" available');
    return func(context);
}

//------------------------------------------------------------------------------
if (typeof(Jemplate.Context) == 'undefined')
    Jemplate.Context = function() {};

proto = Jemplate.Context.prototype;

proto.katch = function(error, output) {
    alert(error);
    error.type = 'die';
    return error;
}

//------------------------------------------------------------------------------
if (typeof(Jemplate.Stash) == 'undefined')
    Jemplate.Stash = function() {};

proto = Jemplate.Stash.prototype;

proto.init = function(object) {
    for (var key in object) {
        var value = object[key];
        this.set(key, value);
    }
}

proto.get = function(key) {
    return this[key];
}

proto.set = function(key, value) {
    this[key] = value;
}
