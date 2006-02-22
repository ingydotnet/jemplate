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
        if (! e.match(/Jemplate\.STOP\n/))
            throw(e);
        result = e.replace(/Jemplate\.STOP\n/, '')
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
if (typeof(Jemplate.Stash) == 'undefined')
    Jemplate.Stash = function() {};

proto = Jemplate.Stash.prototype;

proto.add = function(object) {
    for (var key in object) {
        var value = object[key];
        this.set(key, value);
    }
}

proto.get = function(key) {
    if (! (key instanceof Array)) {
        value = this[key];
        if (typeof(value) == 'function')
            value = value();
    }
    else {
        throw('Jemplate.Stash.get error. Key = ' + key);
    }
    return value;
}

proto.set = function(key, value) {
    this[key] = value;
}

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
