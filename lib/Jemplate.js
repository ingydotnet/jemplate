/*------------------------------------------------------------------------------
Jemplate - Template Toolkit for Javascript

DESCRIPTION - This module provides the runtime Javascript support for
compiled Jemplate templates.

AUTHOR - Ingy döt Net <ingy@cpan.org>

Copyright 2006 Ingy döt Net. All Rights Reserved.

This module is free software; you can redistribute it and/or
modify it under the same terms as Perl itself.
------------------------------------------------------------------------------*/
if (typeof(Jemplate) == 'undefined')
    Jemplate = function() {};

Jemplate.templateMap = {};

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
// Jemplate.Context class
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
// Jemplate.Stash class
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
