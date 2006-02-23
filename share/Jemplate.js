/*------------------------------------------------------------------------------
Jemplate - Template Toolkit for Javascript

DESCRIPTION - This module provides the runtime Javascript support for
compiled Jemplate templates.

AUTHOR - Ingy döt Net <ingy@cpan.org>

Copyright 2006 Ingy döt Net. All Rights Reserved.

This module is free software; you can redistribute it and/or
modify it under the same terms as Perl itself.
------------------------------------------------------------------------------*/

//------------------------------------------------------------------------------
// Main Jemplate class
//------------------------------------------------------------------------------
if (typeof(Jemplate) == 'undefined')
    Jemplate = function() {};

Jemplate.templateMap = {};

Jemplate.process = function(template, data, output) {
    var context = new Jemplate.Context();
    context.stash = new Jemplate.Stash();
    var result;
    try { 
        result = context.process(template, data);
    }
    catch(e) {
        if (! e.toString().match(/Jemplate\.STOP\n/))
            throw(e);
        result = e.toString().replace(/Jemplate\.STOP\n/, '')
    } 

    if (typeof(output) == 'undefined')
        return result;
    else if (typeof(output) == 'function')
        output(result);
    else if (output.match(/^#[\w\-]+$/)) {
        var id = output.replace(/^#/, '');
        var element = document.getElementById(id);
        if (typeof(element) == 'undefined')
            throw('No element found with id="' + id + '"');
        element.innerHTML = result;
    }
    else
        throw("Invalid arguments in call to Jemplate.process");

    return 1;
}

//------------------------------------------------------------------------------
// Jemplate.Context class
//------------------------------------------------------------------------------
if (typeof(Jemplate.Context) == 'undefined')
    Jemplate.Context = function() {};

proto = Jemplate.Context.prototype;

proto.include = function(template, args) {
    return this.process(template, args);
}

proto.process = function(template, args) {
    if (typeof(args) != 'undefined')
        this.stash.add(args);
    var func = Jemplate.templateMap[template];
    if (typeof(func) == 'undefined')
        throw('No Jemplate template named "' + template + '" available');
    return func(this);
}

proto.set_error = function(error, output) {
    this._error = [error, output];
    return error;
}

//------------------------------------------------------------------------------
// Jemplate.Stash class
//------------------------------------------------------------------------------
if (typeof(Jemplate.Stash) == 'undefined') {
    Jemplate.Stash = function() {
        this.data = {};
    };
}

proto = Jemplate.Stash.prototype;

proto.add = function(object) {
    for (var key in object) {
        var value = object[key];
        this.set(key, value);
    }
}

proto.get = function(key) {
    var root = this.data;
    if (key instanceof Array) {
        for (var i = 0; i < key.length; i += 2) {
            var args = key.slice(i, i+2);
            args.unshift(root);
            value = this._dotop.apply(this, args);
            if (typeof(value) == 'undefined')
                break;
            root = value;
        }
    }
    else {
        value = this._dotop(root, key);
    }

    return value;
}

proto.set = function(key, value) {
    this.data[key] = value;
}

proto._dotop = function(root, item, args) {
    if (typeof(item) == 'undefined' || item.match(/^[\._]/))
        return undefined;

    if (typeof root == 'string' && this.string_functions[item])
        return this.string_functions[item](root, args);
    if (root instanceof Array && this.list_functions[item])
        return this.list_functions[item](root, args);
    if (typeof root == 'object' && this.hash_functions[item])
        return this.hash_functions[item](root, args);

    var value = root[item];
    if (typeof(value) == 'function')
        value = value();
    return value;
}

proto.string_functions = {};

proto.list_functions = {};

proto.list_functions.join = function(list, args) {
    return list.join(args[0]);
};

proto.list_functions.push = function(list, args) {
    list.push(args);
    return list;        
}

proto.list_functions.first = function(list) {
    return list[0];        
}

proto.list_functions.last = function(list) {
    return list.slice(-1);        
}

proto.hash_functions = {};

//------------------------------------------------------------------------------
// Jemplate.Iterator class
//------------------------------------------------------------------------------
if (typeof(Jemplate.Iterator) == 'undefined') {
    Jemplate.Iterator = function(object) {
        this.object = object;
    }
}

proto = Jemplate.Iterator.prototype;

proto.get_first = function() {
    this.index = 0;
    return this.get_next();
}

proto.get_next = function() {
    var object = this.object;
    var index = this.index++;
    if (typeof(object) == 'undefined')
        throw('No object to iterate');
    if (index < object.length)
        return [object[index], false];
    else
        return [null, true];
}
