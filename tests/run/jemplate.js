/*------------------------------------------------------------------------------
Jemplate - Template Toolkit for JavaScript

DESCRIPTION - This module provides the runtime JavaScript support for
compiled Jemplate templates.

AUTHOR - Ingy döt Net <ingy@cpan.org>

Copyright 2006 Ingy döt Net. All Rights Reserved.

This module is free software; you can redistribute it and/or
modify it under the same terms as Perl itself.
------------------------------------------------------------------------------*/

//------------------------------------------------------------------------------
// Main Jemplate class
//------------------------------------------------------------------------------

if (typeof Jemplate == 'undefined') {
    var Jemplate = function() {
        this.init.apply(this, arguments);
    };
}

Jemplate.process = function() {
    var jemplate = new Jemplate();
    return jemplate.process.apply(jemplate, arguments);
}

;(function(){

if (! Jemplate.templateMap)
    Jemplate.templateMap = {};

var proto = Jemplate.prototype = {};

proto.init = function(config) {
    this.config = config ||
    {
        AUTO_RESET: true,
        BLOCKS: {},
        CONTEXT: null,
        DEBUG_UNDEF: false,
        DEFAULT: null,
        ERROR: null,
        EVAL_JAVASCRIPT: false,
        FILTERS: {},
        INCLUDE_PATH: [''],
        INTERPOLATE: false,
        OUTPUT: null,
        PLUGINS: {},
        POST_PROCESS: [],
        PRE_PROCESS: [],
        PROCESS: null,
        RECURSION: false,
        STASH: null,
        TOLERANT: null,
        VARIABLES: {},
        WRAPPER: []
    };
}

proto.process = function(template, data, output) {
    var context = this.config.CONTEXT || new Jemplate.Context();
    context.config = this.config;

    context.stash = this.config.STASH || new Jemplate.Stash();
    context.stash.__config__ = this.config;

    context.__filter__ = new Jemplate.Filter();
    context.__filter__.config = this.config;

    context.__plugin__ = new Jemplate.Plugin();
    context.__plugin__.config = this.config;

    var result;

    var proc = function(input) {
        try {
            result = context.process(template, input);
        }
        catch(e) {
            if (! String(e).match(/Jemplate\.STOP\n/))
                throw(e);
            result = e.toString().replace(/Jemplate\.STOP\n/, '');
        }

        if (typeof output == 'undefined')
            return result;
        if (typeof output == 'function') {
            output(result);
            return null;
        }
        if (typeof(output) == 'string' || output instanceof String) {
            if (output.match(/^#[\w\-]+$/)) {
                var id = output.replace(/^#/, '');
                var element = document.getElementById(id);
                if (typeof element == 'undefined')
                    throw('No element found with id="' + id + '"');
                element.innerHTML = result;
                return null;
            }
        }
        else {
            output.innerHTML = result;
            return null;
        }

        throw("Invalid arguments in call to Jemplate.process");

        return 1;
    }

    if (typeof data == 'function')
        data = data();
    else if (typeof data == 'string') {
//        Jemplate.Ajax.get(data, function(r) { proc(Jemplate.JSON.parse(r)) });
        var url = data;
        Jemplate.Ajax.processGet(url, function(data) { proc(data) });
        return null;
    }

    return proc(data);
}

//------------------------------------------------------------------------------
// Jemplate.Context class
//------------------------------------------------------------------------------
if (typeof Jemplate.Context == 'undefined')
    Jemplate.Context = function() {};

proto = Jemplate.Context.prototype;

proto.include = function(template, args) {
    return this.process(template, args, true);
}

proto.process = function(template, args, localise) {
    if (localise)
        this.stash.clone(args);
    else
        this.stash.update(args);
    var func = Jemplate.templateMap[template];
    if (typeof func == 'undefined')
        throw('No Jemplate template named "' + template + '" available');
    var output = func(this);
    if (localise)
        this.stash.declone();
    return output;
}

proto.set_error = function(error, output) {
    this._error = [error, output];
    return error;
}

proto.plugin = function(name, args) {
    if (typeof name == 'undefined')
        throw "Unknown plugin name ':" + name + "'";

    // The Context object (this) is passed as the first argument to the plugin.
    return new window[name](this, args);
}

proto.filter = function(text, name, args) {
    if (name == 'null')
        name = "null_filter";
    if (typeof this.__filter__.filters[name] == "function")
        return this.__filter__.filters[name](text, args, this);
    else
        throw "Unknown filter name ':" + name + "'";
}

//------------------------------------------------------------------------------
// Jemplate.Plugin class
//------------------------------------------------------------------------------
if (typeof Jemplate.Plugin == 'undefined') {
    Jemplate.Plugin = function() { };
}

proto = Jemplate.Plugin.prototype;

proto.plugins = {};

//------------------------------------------------------------------------------
// Jemplate.Filter class
//------------------------------------------------------------------------------
if (typeof Jemplate.Filter == 'undefined') {
    Jemplate.Filter = function() { };
}

proto = Jemplate.Filter.prototype;

proto.filters = {};

proto.filters.null_filter = function(text) {
    return '';
}

proto.filters.upper = function(text) {
    return text.toUpperCase();
}

proto.filters.lower = function(text) {
    return text.toLowerCase();
}

proto.filters.ucfirst = function(text) {
    var first = text.charAt(0);
    var rest = text.substr(1);
    return first.toUpperCase() + rest;
}

proto.filters.lcfirst = function(text) {
    var first = text.charAt(0);
    var rest = text.substr(1);
    return first.toLowerCase() + rest;
}

proto.filters.trim = function(text) {
    return text.replace( /^\s+/g, "" ).replace( /\s+$/g, "" );
}

proto.filters.collapse = function(text) {
    return text.replace( /^\s+/g, "" ).replace( /\s+$/g, "" ).replace(/\s+/, " ");
}

proto.filters.html = function(text) {
    text = text.replace(/&/g, '&amp;');
    text = text.replace(/</g, '&lt;');
    text = text.replace(/>/g, '&gt;');
    text = text.replace(/"/g, '&quot;'); // " end quote for emacs
    return text;
}

proto.filters.html_para = function(text) {
    var lines = text.split(/(?:\r?\n){2,}/);
    return "<p>\n" + lines.join("\n</p>\n\n<p>\n") + "</p>\n";
}

proto.filters.html_break = function(text) {
    return text.replace(/(\r?\n){2,}/g, "$1<br />$1<br />$1");
}

proto.filters.html_line_break = function(text) {
    return text.replace(/(\r?\n)/g, "$1<br />$1");
}

proto.filters.uri = function(text) {
    return encodeURI(text);
}

proto.filters.indent = function(text, args) {
    var pad = args[0];
    if (! text) return null;
    if (typeof pad == 'undefined')
        pad = 4;

    var finalpad = '';
    if (typeof pad == 'number' || String(pad).match(/^\d$/)) {
        for (var i = 0; i < pad; i++) {
            finalpad += ' ';
        }
    } else {
        finalpad = pad;
    }
    var output = text.replace(/^/gm, finalpad);
    return output;
}

proto.filters.truncate = function(text, args) {
    var len = args[0];
    if (! text) return null;
    if (! len)
        len = 32;
    // This should probably be <=, but TT just uses <
    if (text.length < len)
        return text;
    var newlen = len - 3;
    return text.substr(0,newlen) + '...';
}

proto.filters.repeat = function(text, iter) {
    if (! text) return null;
    if (! iter || iter == 0)
        iter = 1;
    if (iter == 1) return text

    var output = text;
    for (var i = 1; i < iter; i++) {
        output += text;
    }
    return output;
}

proto.filters.replace = function(text, args) {
    if (! text) return null;
    var re_search = args[0];
    var text_replace = args[1];
    if (! re_search)
        re_search = '';
    if (! text_replace)
        text_replace = '';
    var re = new RegExp(re_search, 'g');
    return text.replace(re, text_replace);
}

//------------------------------------------------------------------------------
// Jemplate.Stash class
//------------------------------------------------------------------------------
if (typeof Jemplate.Stash == 'undefined') {
    Jemplate.Stash = function() {
        this.data = {};
    };
}

proto = Jemplate.Stash.prototype;

proto.clone = function(args) {
    var data = this.data;
    this.data = {};
    this.update(data);
    this.update(args);
    this.data._PARENT = data;
}

proto.declone = function(args) {
    this.data = this.data._PARENT || this.data;
}

proto.update = function(args) {
    if (typeof args == 'undefined') return;
    for (var key in args) {
        var value = args[key];
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
            if (typeof value == 'undefined')
                break;
            root = value;
        }
    }
    else {
        value = this._dotop(root, key);
    }

    if (typeof value == 'undefined') {
        if (this.__config__.DEBUG_UNDEF)
            throw("undefined value found while using DEGUG_UNDEF");
        value = '';
    }

    return value;
}

proto.set = function(key, value, set_default) {
    if (key instanceof Array) {
        var data = this.get(key[0]) || {};
        key = key[2];
    }
    else {
        data = this.data;
    }
    if (! (set_default && (typeof data[key] != 'undefined')))
        data[key] = value;
}

proto._dotop = function(root, item, args) {
    if (typeof item == 'undefined' ||
        typeof item == 'string' && item.match(/^[\._]/)) {
        return undefined;
    }

    if ((! args) &&
        (typeof root == 'object') &&
        (!(root instanceof Array) || (typeof item == 'number')) &&
        (typeof root[item] != 'undefined')) {
        var value = root[item];
        if (typeof value == 'function')
            value = value.apply(root);
        return value;
    }

    if (typeof root == 'string' && this.string_functions[item])
        return this.string_functions[item](root, args);
    if (root instanceof Array && this.list_functions[item])
        return this.list_functions[item](root, args);
    if (typeof root == 'object' && this.hash_functions[item])
        return this.hash_functions[item](root, args);
    if (typeof root[item] == 'function')
        return root[item].apply(root, args);

    return undefined;
}

proto.string_functions = {};

// chunk(size)     negative size chunks from end
proto.string_functions.chunk = function(string, args) {
    var size = args[0];
    var list = new Array();
    if (! size)
        size = 1;
    if (size < 0) {
        size = 0 - size;
        for (i = string.length - size; i >= 0; i = i - size)
            list.unshift(string.substr(i, size));
        if (string.length % size)
            list.unshift(string.substr(0, string.length % size));
    }
    else
        for (i = 0; i < string.length; i = i + size)
            list.push(string.substr(i, size));
    return list;
}

// defined         is value defined?
proto.string_functions.defined = function(string) {
    return 1;
}

// hash            treat as single-element hash with key value
proto.string_functions.hash = function(string) {
    return { 'value': string };
}

// length          length of string representation
proto.string_functions.length = function(string) {
    return string.length;
}

// list            treat as single-item list
proto.string_functions.list = function(string) {
    return [ string ];
}

// match(re)       get list of matches
proto.string_functions.match = function(string, args) {
    var regexp = new RegExp(args[0], 'gm');
    var list = string.match(regexp);
    return list;
}

// repeat(n)       repeated n times
proto.string_functions.repeat = function(string, args) {
    var n = args[0] || 1;
    var output = '';
    for (var i = 0; i < n; i++) {
        output += string;
    }
    return output;
}

// replace(re, sub)    replace instances of re with sub
proto.string_functions.replace = function(string, args) {
    var regexp = new RegExp(args[0], 'gm');
    var sub = args[1];
    if (! sub)
        sub  = '';
    var output = string.replace(regexp, sub);
    return output;
}

// search(re)      true if value matches re
proto.string_functions.search = function(string, args) {
    var regexp = new RegExp(args[0]);
    return (string.search(regexp) >= 0) ? 1 : 0;
}

// size            returns 1, as if a single-item list
proto.string_functions.size = function(string) {
    return 1;
}

// split(re)       split string on re
proto.string_functions.split = function(string, args) {
    var regexp = new RegExp(args[0]);
    var list = string.split(regexp);
    return list;
}



proto.list_functions = {};

proto.list_functions.join = function(list, args) {
    return list.join(args[0]);
};

proto.list_functions.sort = function(list,key) {
    if( typeof(key) != 'undefined' && key != "" ) {
        // we probably have a list of hashes
        // and need to sort based on hash key
        return list.sort(
            function(a,b) {
                if( a[key] == b[key] ) {
                    return 0;
                }
                else if( a[key] > b[key] ) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
        );
    }
    return list.sort();
}

proto.list_functions.nsort = function(list) {
    return list.sort(function(a, b) { return (a-b) });
}

proto.list_functions.grep = function(list, args) {
    var regexp = new RegExp(args[0]);
    var result = [];
    for (var i = 0; i < list.length; i++) {
        if (list[i].match(regexp))
            result.push(list[i]);
    }
    return result;
}

proto.list_functions.unique = function(list) {
    var result = [];
    var seen = {};
    for (var i = 0; i < list.length; i++) {
        var elem = list[i];
        if (! seen[elem])
            result.push(elem);
        seen[elem] = true;
    }
    return result;
}

proto.list_functions.reverse = function(list) {
    var result = [];
    for (var i = list.length - 1; i >= 0; i--) {
        result.push(list[i]);
    }
    return result;
}

proto.list_functions.merge = function(list, args) {
    var result = [];
    var push_all = function(elem) {
        if (elem instanceof Array) {
            for (var j = 0; j < elem.length; j++) {
                result.push(elem[j]);
            }
        }
        else {
            result.push(elem);
        }
    }
    push_all(list);
    for (var i = 0; i < args.length; i++) {
        push_all(args[i]);
    }
    return result;
}

proto.list_functions.slice = function(list, args) {
    return list.slice(args[0], args[1]);
}

proto.list_functions.splice = function(list, args) {
    if (args.length == 1)
        return list.splice(args[0]);
    if (args.length == 2)
        return list.splice(args[0], args[1]);
    if (args.length == 3)
        return list.splice(args[0], args[1], args[2]);
    return null;
}

proto.list_functions.push = function(list, args) {
    list.push(args[0]);
    return list;
}

proto.list_functions.pop = function(list) {
    return list.pop();
}

proto.list_functions.unshift = function(list, args) {
    list.unshift(args[0]);
    return list;
}

proto.list_functions.shift = function(list) {
    return list.shift();
}

proto.list_functions.first = function(list) {
    return list[0];
}

proto.list_functions.size = function(list) {
    return list.length;
}

proto.list_functions.max = function(list) {
    return list.length - 1;
}

proto.list_functions.last = function(list) {
    return list.slice(-1);
}

proto.hash_functions = {};


// each            list of alternating keys/values
proto.hash_functions.each = function(hash) {
    var list = new Array();
    for ( var key in hash )
        list.push(key, hash[key]);
    return list;
}

// exists(key)     does key exist?
proto.hash_functions.exists = function(hash, args) {
    return ( typeof( hash[args[0]] ) == "undefined" ) ? 0 : 1;
}

// FIXME proto.hash_functions.import blows everything up
//
// import(hash2)   import contents of hash2
// import          import into current namespace hash
//proto.hash_functions.import = function(hash, args) {
//    var hash2 = args[0];
//    for ( var key in hash2 )
//        hash[key] = hash2[key];
//    return '';
//}

// keys            list of keys
proto.hash_functions.keys = function(hash) {
    var list = new Array();
    for ( var key in hash )
        list.push(key);
    return list;
}

// list            returns alternating key, value
proto.hash_functions.list = function(hash, args) {
    var what = '';
    if ( args )
        what = args[0];

    var list = new Array();
    var key;
    if (what == 'keys')
        for ( key in hash )
            list.push(key);
    else if (what == 'values')
        for ( key in hash )
            list.push(hash[key]);
    else if (what == 'each')
        for ( key in hash )
            list.push(key, hash[key]);
    else
        for ( key in hash )
            list.push({ 'key': key, 'value': hash[key] });

    return list;
}

// nsort           keys sorted numerically
proto.hash_functions.nsort = function(hash) {
    var list = new Array();
    for (var key in hash)
        list.push(key);
    return list.sort(function(a, b) { return (a-b) });
}

// size            number of pairs
proto.hash_functions.size = function(hash) {
    var size = 0;
    for (var key in hash)
        size++;
    return size;
}


// sort            keys sorted alphabetically
proto.hash_functions.sort = function(hash) {
    var list = new Array();
    for (var key in hash)
        list.push(key);
    return list.sort();
}

// values          list of values
proto.hash_functions.values = function(hash) {
    var list = new Array();
    for ( var key in hash )
        list.push(hash[key]);
    return list;
}

//  delete
proto.hash_functions.remove = function(hash, args) {
    return delete hash[args[0]];
}
proto.hash_functions['delete'] = proto.hash_functions.remove;

//------------------------------------------------------------------------------
// Jemplate.Iterator class
//------------------------------------------------------------------------------
if (typeof Jemplate.Iterator == 'undefined') {
    Jemplate.Iterator = function(object) {
        if( object instanceof Array ) {
            this.object = object;
            this.size = object.length;
            this.max  = this.size -1;
        }
        else if ( object instanceof Object ) {
            this.object = object;
            var object_keys = new Array;
            for( var key in object ) {
                object_keys[object_keys.length] = key;
            }
            this.object_keys = object_keys.sort();
            this.size = object_keys.length;
            this.max  = this.size -1;
        }
    }
}

proto = Jemplate.Iterator.prototype;

proto.get_first = function() {
    this.index = 0;
    this.first = 1;
    this.last  = 0;
    this.count = 1;
    return this.get_next(1);
}

proto.get_next = function(should_init) {
    var object = this.object;
    var index;
    if( typeof(should_init) != 'undefined' && should_init ) {
        index = this.index;
    } else {
        index = ++this.index;
        this.first = 0;
        this.count = this.index + 1;
        if( this.index == this.size -1 ) {
            this.last = 1;
        }
    }
    if (typeof object == 'undefined')
        throw('No object to iterate');
    if( this.object_keys ) {
        if (index < this.object_keys.length) {
            this.prev = index > 0 ? this.object_keys[index - 1] : "";
            this.next = index < this.max ? this.object_keys[index + 1] : "";
            return [this.object_keys[index], false];
        }
    } else {
        if (index < object.length) {
            this.prev = index > 0 ? object[index - 1] : "";
            this.next = index < this.max ? object[index +1] : "";
            return [object[index], false];
        }
    }
    return [null, true];
}

var stubExplanation = "stub that doesn't do anything. Try including the jQuery, YUI, or XHR option when building the runtime";

Jemplate.Ajax = {

    get: function(url, callback) {
        throw("This is a Jemplate.Ajax.get " + stubExplanation);
    },

    processGet: function(url, callback) {
        throw("This is a Jemplate.Ajax.processGet " + stubExplanation);
    },

    post: function(url, callback) {
        throw("This is a Jemplate.Ajax.post " + stubExplanation);
    }

};

Jemplate.JSON = {

    parse: function(decodeValue) {
        throw("This is a Jemplate.JSON.parse " + stubExplanation);
    },

    stringify: function(encodeValue) {
        throw("This is a Jemplate.JSON.stringify " + stubExplanation);
    }

};

}());

/*
    json2.js
    2008-03-24

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing three methods: stringify,
    parse, and quote.


        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects without a toJSON
                        method. It can be a function or an array.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t'), it contains the
                        characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method with be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method will
            be passed the key associated with the value, and this will be bound
            to the object holding the key.

            This is the toJSON method added to Dates:

                function toJSON(key) {
                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                }

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If no replacer parameter is provided, then a default replacer
            will be used:

                function replacer(key, value) {
                    return Object.hasOwnProperty.call(this, key) ?
                        value : undefined;
                }

            The default replacer is passed the key and value for each item in
            the structure. It excludes inherited members.

            If the replacer parameter is an array, then it will be used to
            select the members to be serialized. It filters the results such
            that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representaions, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the value
            that is filled with line breaks and indentation to make it easier to
            read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            then indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values, and
            its return value is used instead of the original value. If it
            returns what it received, then structure is not modified. If it
            returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });


        JSON.quote(text)
            This method wraps a string in quotes, escaping some characters
            as needed.


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD THIRD PARTY
    CODE INTO YOUR PAGES.
*/

/*jslint regexp: true, forin: true, evil: true */

/*global JSON */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, floor, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join, length,
    parse, propertyIsEnumerable, prototype, push, quote, replace, stringify,
    test, toJSON, toString
*/

if (!this.JSON) {

// Create a JSON object only if one does not already exist. We create the
// object in a closure to avoid global variables.

    JSON = function () {

        function f(n) {    // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        Date.prototype.toJSON = function () {

// Eventually, this method will be based on the date.toISOString method.

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };


        var escapeable = /["\\\x00-\x1f\x7f-\x9f]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

            return escapeable.test(string) ?
                '"' + string.replace(escapeable, function (a) {
                    var c = meta[a];
                    if (typeof c === 'string') {
                        return c;
                    }
                    c = a.charCodeAt();
                    return '\\u00' + Math.floor(c / 16).toString(16) +
                                               (c % 16).toString(16);
                }) + '"' :
                '"' + string + '"';
        }


        function str(key, holder) {

// Produce a string from holder[key].

            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === 'object' &&
                    typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

// What happens next depends on the value's type.

            switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// If the object has a dontEnum length property, we'll treat it as an array.

                if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length'))) {

// The object is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap + partial.join(',\n' + gap) +
                                  '\n' + mind + ']' :
                              '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value, rep);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        v = str(k, value, rep);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) +
                              '\n' + mind + '}' :
                          '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }


// Return the JSON object containing the stringify, parse, and quote methods.

        return {
            stringify: function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

                var i;
                gap = '';
                indent = '';
                if (space) {

// If the space parameter is a number, make an indent string containing that
// many spaces.

                    if (typeof space === 'number') {
                        for (i = 0; i < space; i += 1) {
                            indent += ' ';
                        }

// If the space parameter is a string, it will be used as the indent string.

                    } else if (typeof space === 'string') {
                        indent = space;
                    }
                }

// If there is no replacer parameter, use the default replacer.

                if (!replacer) {
                    rep = function (key, value) {
                        if (!Object.hasOwnProperty.call(this, key)) {
                            return undefined;
                        }
                        return value;
                    };

// The replacer can be a function or an array. Otherwise, throw an error.

                } else if (typeof replacer === 'function' ||
                        (typeof replacer === 'object' &&
                         typeof replacer.length === 'number')) {
                    rep = replacer;
                } else {
                    throw new Error('JSON.stringify');
                }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

                return str('', {'': value});
            },


            parse: function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


// Parsing happens in three stages. In the first stage, we run the text against
// regular expressions that look for non-JSON patterns. We are especially
// concerned with '()' and 'new' because they can cause invocation, and '='
// because it can cause mutation. But just to be safe, we want to reject all
// unexpected forms.

// We split the first stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace all backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the second stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                    j = eval('(' + text + ')');

// In the optional third stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                    return typeof reviver === 'function' ?
                        walk({'': j}, '') : j;
                }

// If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('JSON.parse');
            },

            quote: quote
        };
    }();
}

;(function(){

Jemplate.Ajax = {

    get: function(url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, Boolean(callback));
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
        request.setRequestHeader(
            'Content-Type',
            'application/x-www-form-urlencoded'
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
    }
};

}());

;(function(){

Jemplate.JSON = {

    parse: function(encoded) {
        return JSON.parse(encoded);
    },

    stringify: function(decoded) {
        return JSON.stringify(decoded);
    }

};

}());

// Copyright 2007 Sergey Ilinsky (http://www.ilinsky.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function () {

	// Save reference to earlier defined object implementation (if any)
	var oXMLHttpRequest	= window.XMLHttpRequest;

	// Define on browser type
	var bGecko	= !!window.controllers,
		bIE		= window.document.all && !window.opera;

	// Constructor
	function cXMLHttpRequest() {
		this._object	= oXMLHttpRequest ? new oXMLHttpRequest : new window.ActiveXObject('Microsoft.XMLHTTP');
	};

	// BUGFIX: Firefox with Firebug installed would break pages if not executed
	if (bGecko && oXMLHttpRequest.wrapped)
		cXMLHttpRequest.wrapped	= oXMLHttpRequest.wrapped;

	// Constants
	cXMLHttpRequest.UNSENT				= 0;
	cXMLHttpRequest.OPENED				= 1;
	cXMLHttpRequest.HEADERS_RECEIVED	= 2;
	cXMLHttpRequest.LOADING				= 3;
	cXMLHttpRequest.DONE				= 4;

	// Public Properties
	cXMLHttpRequest.prototype.readyState	= cXMLHttpRequest.UNSENT;
	cXMLHttpRequest.prototype.responseText	= "";
	cXMLHttpRequest.prototype.responseXML	= null;
	cXMLHttpRequest.prototype.status		= 0;
	cXMLHttpRequest.prototype.statusText	= "";

	// Instance-level Events Handlers
	cXMLHttpRequest.prototype.onreadystatechange	= null;

	// Class-level Events Handlers
	cXMLHttpRequest.onreadystatechange	= null;
	cXMLHttpRequest.onopen				= null;
	cXMLHttpRequest.onsend				= null;
	cXMLHttpRequest.onabort				= null;

	// Public Methods
	cXMLHttpRequest.prototype.open	= function(sMethod, sUrl, bAsync, sUser, sPassword) {

		// Save async parameter for fixing Gecko bug with missing readystatechange in synchronous requests
		this._async		= bAsync;

		// Set the onreadystatechange handler
		var oRequest	= this,
			nState		= this.readyState;

		// BUGFIX: IE - memory leak on page unload (inter-page leak)
		if (bIE) {
			var fOnUnload	= function() {
				if (oRequest._object.readyState != cXMLHttpRequest.DONE)
					fCleanTransport(oRequest);
			};
			if (bAsync)
				window.attachEvent("onunload", fOnUnload);
		}

		this._object.onreadystatechange	= function() {
			if (bGecko && !bAsync)
				return;

			// Synchronize state
			oRequest.readyState		= oRequest._object.readyState;

			//
			fSynchronizeValues(oRequest);

			// BUGFIX: Firefox fires unneccesary DONE when aborting
			if (oRequest._aborted) {
				// Reset readyState to UNSENT
				oRequest.readyState	= cXMLHttpRequest.UNSENT;

				// Return now
				return;
			}

			if (oRequest.readyState == cXMLHttpRequest.DONE) {
				//
				fCleanTransport(oRequest);
// Uncomment this block if you need a fix for IE cache
/*
				// BUGFIX: IE - cache issue
				if (!oRequest._object.getResponseHeader("Date")) {
					// Save object to cache
					oRequest._cached	= oRequest._object;

					// Instantiate a new transport object
					cXMLHttpRequest.call(oRequest);

					// Re-send request
					oRequest._object.open(sMethod, sUrl, bAsync, sUser, sPassword);
					oRequest._object.setRequestHeader("If-Modified-Since", oRequest._cached.getResponseHeader("Last-Modified") || new window.Date(0));
					// Copy headers set
					if (oRequest._headers)
						for (var sHeader in oRequest._headers)
							if (typeof oRequest._headers[sHeader] == "string")	// Some frameworks prototype objects with functions
								oRequest._object.setRequestHeader(sHeader, oRequest._headers[sHeader]);

					oRequest._object.onreadystatechange	= function() {
						// Synchronize state
						oRequest.readyState		= oRequest._object.readyState;

						if (oRequest._aborted) {
							//
							oRequest.readyState	= cXMLHttpRequest.UNSENT;

							// Return
							return;
						}

						if (oRequest.readyState == cXMLHttpRequest.DONE) {
							// Clean Object
							fCleanTransport(oRequest);

							// get cached request
							if (oRequest.status == 304)
								oRequest._object	= oRequest._cached;

							//
							delete oRequest._cached;

							//
							fSynchronizeValues(oRequest);

							//
							fReadyStateChange(oRequest);

							// BUGFIX: IE - memory leak in interrupted
							if (bIE && bAsync)
								window.detachEvent("onunload", fOnUnload);
						}
					};
					oRequest._object.send(null);

					// Return now - wait untill re-sent request is finished
					return;
				};
*/
				// BUGFIX: IE - memory leak in interrupted
				if (bIE && bAsync)
					window.detachEvent("onunload", fOnUnload);
			}

			// BUGFIX: Some browsers (Internet Explorer, Gecko) fire OPEN readystate twice
			if (nState != oRequest.readyState)
				fReadyStateChange(oRequest);

			nState	= oRequest.readyState;
		};
		// Add method sniffer
		if (cXMLHttpRequest.onopen)
			cXMLHttpRequest.onopen.apply(this, arguments);

		this._object.open(sMethod, sUrl, bAsync, sUser, sPassword);

		// BUGFIX: Gecko - missing readystatechange calls in synchronous requests
		if (!bAsync && bGecko) {
			this.readyState	= cXMLHttpRequest.OPENED;

			fReadyStateChange(this);
		}
	};
	cXMLHttpRequest.prototype.send	= function(vData) {
		// Add method sniffer
		if (cXMLHttpRequest.onsend)
			cXMLHttpRequest.onsend.apply(this, arguments);

		// BUGFIX: Safari - fails sending documents created/modified dynamically, so an explicit serialization required
		// BUGFIX: IE - rewrites any custom mime-type to "text/xml" in case an XMLNode is sent
		// BUGFIX: Gecko - fails sending Element (this is up to the implementation either to standard)
		if (vData && vData.nodeType) {
			vData	= window.XMLSerializer ? new window.XMLSerializer().serializeToString(vData) : vData.xml;
			if (!this._headers["Content-Type"])
				this._object.setRequestHeader("Content-Type", "application/xml");
		}

		this._object.send(vData);

		// BUGFIX: Gecko - missing readystatechange calls in synchronous requests
		if (bGecko && !this._async) {
			this.readyState	= cXMLHttpRequest.OPENED;

			// Synchronize state
			fSynchronizeValues(this);

			// Simulate missing states
			while (this.readyState < cXMLHttpRequest.DONE) {
				this.readyState++;
				fReadyStateChange(this);
				// Check if we are aborted
				if (this._aborted)
					return;
			}
		}
	};
	cXMLHttpRequest.prototype.abort	= function() {
		// Add method sniffer
		if (cXMLHttpRequest.onabort)
			cXMLHttpRequest.onabort.apply(this, arguments);

		// BUGFIX: Gecko - unneccesary DONE when aborting
		if (this.readyState > cXMLHttpRequest.UNSENT)
			this._aborted	= true;

		this._object.abort();

		// BUGFIX: IE - memory leak
		fCleanTransport(this);
	};
	cXMLHttpRequest.prototype.getAllResponseHeaders	= function() {
		return this._object.getAllResponseHeaders();
	};
	cXMLHttpRequest.prototype.getResponseHeader	= function(sName) {
		return this._object.getResponseHeader(sName);
	};
	cXMLHttpRequest.prototype.setRequestHeader	= function(sName, sValue) {
		// BUGFIX: IE - cache issue
		if (!this._headers)
			this._headers	= {};
		this._headers[sName]	= sValue;

		return this._object.setRequestHeader(sName, sValue);
	};
	cXMLHttpRequest.prototype.toString	= function() {
		return '[' + "object" + ' ' + "XMLHttpRequest" + ']';
	};
	cXMLHttpRequest.toString	= function() {
		return '[' + "XMLHttpRequest" + ']';
	};

	// Helper function
	function fReadyStateChange(oRequest) {
		// Execute onreadystatechange
		if (oRequest.onreadystatechange)
			oRequest.onreadystatechange.apply(oRequest);

		// Sniffing code
		if (cXMLHttpRequest.onreadystatechange)
			cXMLHttpRequest.onreadystatechange.apply(oRequest);
	};

	function fGetDocument(oRequest) {
		var oDocument	= oRequest.responseXML;
		// Try parsing responseText
		if (bIE && oDocument && !oDocument.documentElement && oRequest.getResponseHeader("Content-Type").match(/[^\/]+\/[^\+]+\+xml/)) {
			oDocument	= new ActiveXObject('Microsoft.XMLDOM');
			oDocument.loadXML(oRequest.responseText);
		}
		// Check if there is no error in document
		if (oDocument)
			if ((bIE && oDocument.parseError != 0) || (oDocument.documentElement && oDocument.documentElement.tagName == "parsererror"))
				return null;
		return oDocument;
	};

	function fSynchronizeValues(oRequest) {
		try {	oRequest.responseText	= oRequest._object.responseText;	} catch (e) {}
		try {	oRequest.responseXML	= fGetDocument(oRequest._object);	} catch (e) {}
		try {	oRequest.status			= oRequest._object.status;			} catch (e) {}
		try {	oRequest.statusText		= oRequest._object.statusText;		} catch (e) {}
	};

	function fCleanTransport(oRequest) {
		// BUGFIX: IE - memory leak (on-page leak)
		oRequest._object.onreadystatechange	= new window.Function;

		// Delete private properties
		delete oRequest._headers;
	};

	// Internet Explorer 5.0 (missing apply)
	if (!window.Function.prototype.apply) {
		window.Function.prototype.apply	= function(oRequest, oArguments) {
			if (!oArguments)
				oArguments	= [];
			oRequest.__func	= this;
			oRequest.__func(oArguments[0], oArguments[1], oArguments[2], oArguments[3], oArguments[4]);
			delete oRequest.__func;
		};
	};

	// Register new object with window
	window.XMLHttpRequest	= cXMLHttpRequest;
})();
/*
   This JavaScript code was generated by Jemplate, the JavaScript
   Template Toolkit. Any changes made to this file will be lost the next
   time the templates are compiled.

   Copyright 2006 - Ingy döt Net - All rights reserved.
*/

if (typeof(Jemplate) == 'undefined')
    throw('Jemplate.js must be loaded before any Jemplate template files');

Jemplate.templateMap['basic_array1.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 4 "basic_array1.html"
stash.set( "simple_list", ["a","b","c"] );
stash.set( "mylist", [["a","b","c"],["d","e","f"],["h","i","j"]] );
output += 'a = ';
//line 5 "basic_array1.html"
output += stash.get(['simple_list', 0, 0, 0]);
output += '\na = ';
//line 6 "basic_array1.html"
output += stash.get(['mylist', 0, 0, 0, 0, 0]);
output += '\nc = ';
//line 7 "basic_array1.html"
output += stash.get(['mylist', 0, 0, 0, 2, 0]);
output += '\ne = ';
//line 8 "basic_array1.html"
output += stash.get(['mylist', 0, 1, 0, 1, 0]);
output += '\nj = ';
//line 9 "basic_array1.html"
output += stash.get(['mylist', 0, 2, 0, 2, 0]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['default.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "default.html"
stash.set('foo', 'two', 1);
stash.set('bar', 'three', 1);
//line 2 "default.html"
stash.set('bar', 'four', 1);
//line 3 "default.html"
output += stash.get('foo');
output += ' | ';
//line 3 "default.html"
output += stash.get('bar');
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['directives1.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {

//line 4 "directives1.html"
stash.set('list', [ 3, 4, 5 ]);
//line 7 "directives1.html"

// FOREACH 
(function() {
    var list = stash.get('list');
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['i'] = value;
//line 6 "directives1.html"
output += context.process('foo');;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['foo'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
output += 'I <3 Sushi\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['directives2.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "directives2.html"
stash.set('num', 4);
//line 2 "directives2.html"
stash.set('array', [ ]);
//line 6 "directives2.html"
    
// WHILE
var failsafe = 1000;
while (--failsafe && (stash.get('num') < 7)) {
//line 4 "directives2.html"
if (stash.get('num') % 2) {
//line 4 "directives2.html"
stash.get(['array', 0, 'push', [ 'Odd' ]]);
}
else {
//line 4 "directives2.html"
stash.get(['array', 0, 'push', [ 'Even' ]]);
}

//line 5 "directives2.html"
stash.set('num', stash.get('num') + 1);
}
if (! failsafe)
    throw("WHILE loop terminated (> 1000 iterations)\n")

//line 7 "directives2.html"
output += stash.get(['array', 0, 'join', [ '***' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['directives3.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "directives3.html"
stash.set("obj", {"key1": "val1", "key2": "val2"});
output += 'Key1: ';
//line 4 "directives3.html"
output += stash.get(['obj', 0, 'key1', 0]);
output += '\nKey2: ';
//line 5 "directives3.html"
output += stash.get(['obj', 0, 'key2', 0]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['directives4.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "directives4.html"
stash.set("obj", {"key1": "val1", "key2": "val2"});
//line 6 "directives4.html"

// FOREACH 
(function() {
    var list = stash.get('obj');
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['key'] = value;
//line 5 "directives4.html"
output += stash.get('key');
output += ': ';
//line 5 "directives4.html"
output += stash.get(['obj', 0, stash.get('key'), 0]);
output += '\n';;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['directives5.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 4 "directives5.html"

// FOREACH 
(function() {
    var list = [ 1, 2, 3, 4, 5, 6 ];
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['i'] = value;
//line 2 "directives5.html"
if (stash.get('i') % 2 == 0) {
  retval = list.get_next();
  value = retval[0];
  done = retval[1];
  continue;

}

output += 'I = ';
//line 3 "directives5.html"
output += stash.get('i');
output += ';';;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['filters_html.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "filters_html.html"

// FILTER
output += (function() {
    var output = '';

output += 'This is some html text\nAll the <tags> should be escaped & protected\n';

    return context.filter(output, 'html', []);
})();

output += '\n';
//line 4 "filters_html.html"
stash.set('text', 'The <cat> sat on the <mat>');
output += '\n';
//line 5 "filters_html.html"

// FILTER
output += (function() {
    var output = '';

output += stash.get('text');

    return context.filter(output, 'html', []);
})();

output += '\n';
//line 7 "filters_html.html"

// FILTER
output += (function() {
    var output = '';

output += '\n"It isn\'t what I expected", he replied.';

    return context.filter(output, 'html', []);
})();

output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['filters_indent.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 6 "filters_indent.html"

// FILTER
output += (function() {
    var output = '';

output += '1\n2\n3\n4';

    return context.filter(output, 'indent', []);
})();

output += '\n#\n';
//line 13 "filters_indent.html"

// FILTER
output += (function() {
    var output = '';

output += '1\n2\n3\n4';

    return context.filter(output, 'indent', [ 3 ]);
})();

output += '\n#\n';
//line 20 "filters_indent.html"

// FILTER
output += (function() {
    var output = '';

output += '1\n2\n3\n4';

    return context.filter(output, 'indent', [ '2' ]);
})();

output += '\n#\n';
//line 27 "filters_indent.html"

// FILTER
output += (function() {
    var output = '';

output += '1\n2\n3\n4';

    return context.filter(output, 'indent', [ 0 ]);
})();

output += '\n#\n';
//line 29 "filters_indent.html"
stash.set('text', 'The cat sat on the mat');
//line 29 "filters_indent.html"

// FILTER
output += (function() {
    var output = '';


// FILTER
output += (function() {
    var output = '';

output += stash.get('text');

    return context.filter(output, 'indent', [ '> ' ]);
})();


    return context.filter(output, 'indent', [ '+' ]);
})();

output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['filters_null.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "filters_null.html"

// FILTER
output += (function() {
    var output = '';

output += 'Ils ont les chapeaux ronds, vive la bretagne';

    return context.filter(output, 'null', []);
})();

    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['filters_repeat.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "filters_repeat.html"

// FILTER
output += (function() {
    var output = '';

output += 'foo...';

    return context.filter(output, 'repeat', [ 5 ]);
})();

output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['filters_replace.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "filters_replace.html"
stash.set('text', 'The cat sat on the mat');
//line 2 "filters_replace.html"

// FILTER
output += (function() {
    var output = '';

output += stash.get('text');

    return context.filter(output, 'replace', [ ' ', '_' ]);
})();

output += '\n';
//line 3 "filters_replace.html"

// FILTER
output += (function() {
    var output = '';

output += stash.get('text');

    return context.filter(output, 'replace', [ 'sat', 'shat' ]);
})();

output += '\n';
//line 4 "filters_replace.html"

// FILTER
output += (function() {
    var output = '';

output += stash.get('text');

    return context.filter(output, 'replace', [ 'at', 'plat' ]);
})();

output += '\n';
//line 5 "filters_replace.html"
stash.set('text', 'The <=> operator, blah, blah');
//line 6 "filters_replace.html"

// FILTER
output += (function() {
    var output = '';


// FILTER
output += (function() {
    var output = '';

output += stash.get('text');

    return context.filter(output, 'html', []);
})();


    return context.filter(output, 'replace', [ 'blah', 'rhubarb' ]);
})();

output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['filters_truncate.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "filters_truncate.html"
stash.set('a', '1234567890');
//line 2 "filters_truncate.html"

// FILTER
output += (function() {
    var output = '';

output += stash.get('a');

    return context.filter(output, 'truncate', [ 5 ]);
})();

output += '\n';
//line 3 "filters_truncate.html"

// FILTER
output += (function() {
    var output = '';

output += stash.get('a');

    return context.filter(output, 'truncate', [ 10 ]);
})();

output += '\n';
//line 4 "filters_truncate.html"

// FILTER
output += (function() {
    var output = '';

output += stash.get('a');

    return context.filter(output, 'truncate', [ 15 ]);
})();

output += '\n';
//line 5 "filters_truncate.html"

// FILTER
output += (function() {
    var output = '';

output += stash.get('a');

    return context.filter(output, 'truncate', [ 2 ]);
})();

output += '\n';
//line 6 "filters_truncate.html"
stash.set('a', '1234567890123456789012345678901234567890');
//line 7 "filters_truncate.html"

// FILTER
output += (function() {
    var output = '';

output += stash.get('a');

    return context.filter(output, 'truncate', []);
})();

output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['filters_uri.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "filters_uri.html"

// FILTER
output += (function() {
    var output = '';

output += 'my file.html';

    return context.filter(output, 'uri', []);
})();

output += '\n';
//line 2 "filters_uri.html"

// FILTER
output += (function() {
    var output = '';

output += 'my<file & your>file.html';

    return context.filter(output, 'uri', []);
})();

output += '\n';
//line 3 "filters_uri.html"

// FILTER
output += (function() {
    var output = '';


// FILTER
output += (function() {
    var output = '';

output += 'my<file & your>file.html';

    return context.filter(output, 'uri', []);
})();


    return context.filter(output, 'html', []);
})();

output += '\n';
//line 4 "filters_uri.html"

// FILTER
output += (function() {
    var output = '';

output += 'guitar&amp;file.html';

    return context.filter(output, 'uri', []);
})();

output += '\n';
//line 5 "filters_uri.html"

// FILTER
output += (function() {
    var output = '';


// FILTER
output += (function() {
    var output = '';

output += 'guitar&amp;file.html';

    return context.filter(output, 'uri', []);
})();


    return context.filter(output, 'html', []);
})();

output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['hash_each.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 4 "hash_each.html"
stash.set('hash', { 'a': 1, 'b': 2, 'c': 3  });
//line 4 "hash_each.html"
stash.set('list', stash.get(['hash', 0, 'each', 0]));
//line 4 "hash_each.html"

// FOREACH 
(function() {
    var list = [ 0, 2, 4 ];
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['kindex'] = value;
//line 4 "hash_each.html"
stash.set('vindex', stash.get('kindex') + 1);
//line 4 "hash_each.html"
stash.set('key', stash.get(['list', 0, stash.get('kindex'), 0]));
//line 4 "hash_each.html"
stash.set('value', stash.get(['list', 0, stash.get('vindex'), 0]));
//line 4 "hash_each.html"
output += (stash.get('key') && stash.get(['hash', 0, stash.get('key'), 0]) == stash.get('value')) ? 1 : 0;;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['hash_exists.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "hash_exists.html"
stash.set('a', { 'a': 1, 'b': 2, 'c': 3  });
//line 2 "hash_exists.html"
output += stash.get(['a', 0, 'exists', [ 'b' ]]) ? 1 : 0;
output += '\n';
//line 3 "hash_exists.html"
output += stash.get(['a', 0, 'exists', [ 'z' ]]) ? 1 : 0;
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['hash_import.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
output += '1\n';
output += '1\n';
output += '2\n';
output += '5\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['hash_keys.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "hash_keys.html"
stash.set('a', { 'a': 1, 'b': 2, 'c': 3  });
//line 2 "hash_keys.html"
output += stash.get(['a', 0, 'keys', 0, 'sort', 0, 'join', [ ' ' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['hash_list.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "hash_list.html"
stash.set('hash', { 'a': 1, 'b': 2, 'c': 3  });
//line 2 "hash_list.html"
output += stash.get(['hash', 0, 'list', [ 'keys' ], 'sort', 0, 'join', [ ' ' ]]);
output += '\n';
//line 3 "hash_list.html"
output += stash.get(['hash', 0, 'list', [ 'values' ], 'sort', 0, 'join', [ ' ' ]]);
output += '\n';
//line 4 "hash_list.html"
stash.set('list', stash.get(['hash', 0, 'list', [ 'each' ]]));
//line 4 "hash_list.html"

// FOREACH 
(function() {
    var list = [ 0, 2, 4 ];
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['kindex'] = value;
//line 4 "hash_list.html"
stash.set('vindex', stash.get('kindex') + 1);
//line 4 "hash_list.html"
stash.set('key', stash.get(['list', 0, stash.get('kindex'), 0]));
//line 4 "hash_list.html"
stash.set('value', stash.get(['list', 0, stash.get('vindex'), 0]));
//line 4 "hash_list.html"
output += (stash.get('key') && stash.get(['hash', 0, stash.get('key'), 0]) == stash.get('value')) ? 1 : 0;;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

output += '\n';
//line 11 "hash_list.html"
stash.set('list', stash.get(['hash', 0, 'list', []]));
//line 11 "hash_list.html"

// FOREACH 
(function() {
    var list = stash.get('list');
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['entry'] = value;
//line 11 "hash_list.html"
stash.set('key', stash.get(['entry', 0, 'key', 0]));
//line 11 "hash_list.html"
stash.set('value', stash.get(['entry', 0, 'value', 0]));
//line 11 "hash_list.html"
output += (stash.get(['hash', 0, stash.get('key'), 0]) == stash.get('value')) ? 1 : 0;;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['hash_nsort.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "hash_nsort.html"
stash.set('a', { '499': 'c', '5': 'a', '50': 'b'  });
//line 2 "hash_nsort.html"
output += stash.get(['a', 0, 'nsort', 0, 'join', [ ' ' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['hash_size.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "hash_size.html"
stash.set('a', { 'a': 1, 'b': 2, 'c': 3  });
//line 2 "hash_size.html"
output += stash.get(['a', 0, 'size', 0]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['hash_sort.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "hash_sort.html"
stash.set('a', { 'ac': 1, 'b': 2, 'aa': 3  });
//line 2 "hash_sort.html"
output += stash.get(['a', 0, 'sort', 0, 'join', [ ' ' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['hash_values.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "hash_values.html"
stash.set('a', { 'a': 1, 'b': 2, 'c': 3  });
//line 2 "hash_values.html"
output += stash.get(['a', 0, 'values', 0, 'nsort', 0, 'join', [ ' ' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['hello.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
output += 'Hello, ';
//line 1 "hello.html"
output += stash.get('name');
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['join.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "join.html"
stash.set('a', [ 'foo', 'bar', 'baz' ]);
//line 2 "join.html"
output += stash.get(['a', 0, 'join', [ '::' ]]);
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['list.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "list.html"
stash.set('a1', [ 'one', 'two', 'three' ]);
//line 2 "list.html"
stash.get(['a1', 0, 'push', [ 'four' ]]);
//line 3 "list.html"
output += stash.get(['a1', 0, 'first', []]);
output += ' - ';
//line 3 "list.html"
output += stash.get(['a1', 0, 'last', []]);
output += '\n';
//line 4 "list.html"
output += stash.get(['a1', 0, 'grep', [ 'o' ], 'join', [ '/' ]]);
output += '\n';
//line 5 "list.html"
output += stash.get(['a1', 0, 'max', []]);
output += '+';
//line 5 "list.html"
output += stash.get(['a1', 0, 'size', []]);
output += '\n';
//line 6 "list.html"
stash.set('a2', stash.get(['a1', 0, 'reverse', 0]));
//line 7 "list.html"
output += stash.get(['a2', 0, 'join', [ '^' ]]);
output += '\n';
//line 8 "list.html"
output += stash.get(['a2', 0, 'slice', [ 1, 3 ], 'join', [ '*' ]]);
output += '\n';
//line 9 "list.html"
stash.set('a3', [ 5, 9, 'x', 17, 9, 33, 12, 'x', 5 ]);
//line 10 "list.html"
output += stash.get(['a3', 0, 'unique', [], 'join', [ ',' ]]);
output += '\n';
//line 11 "list.html"
output += stash.get(['a1', 0, 'unshift', [ 'zero' ], 'sort', [], 'join', [ '!' ]]);
output += '\n';
//line 12 "list.html"
stash.get(['a1', 0, 'shift', []]);
//line 12 "list.html"
stash.get(['a1', 0, 'pop', []]);
//line 12 "list.html"
output += stash.get(['a1', 0, 'join', [ '_' ]]);
output += '\n';
//line 13 "list.html"
stash.get(['a3', 0, 'splice', [ 2, 1 ]]);
//line 13 "list.html"
stash.get(['a3', 0, 'splice', [ -2, 1 ]]);
//line 13 "list.html"
output += stash.get(['a3', 0, 'nsort', 0, 'join', [ '~' ]]);
output += '\n';
//line 14 "list.html"
stash.set('a4', [ 11, 22, 33 ]);
//line 15 "list.html"
stash.set('a5', [ 44, 55, 66 ]);
//line 16 "list.html"
stash.set('a6', [ 77, 88, 99 ]);
//line 17 "list.html"
stash.set('a7', stash.get(['a4', 0, 'merge', [ stash.get('a5'), 'foo', stash.get('a6') ]]));
//line 18 "list.html"
output += stash.get(['a7', 0, 'join', [ '\'' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['list_of_hash.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "list_of_hash.html"
stash.set('ll', [ { 'a': 9  }, { 'a': 1  }, { 'a': 3  } ]);
//line 4 "list_of_hash.html"

// FOREACH 
(function() {
    var list = stash.get(['ll', 0, 'sort', [ 'a' ]]);
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['hash'] = value;
//line 3 "list_of_hash.html"
output += stash.get(['hash', 0, 'a', 0]);
output += ':';;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['localise1.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "localise1.html"
output += stash.get('thing');
output += '\n';
//line 2 "localise1.html"
stash.set('thing', 'bar');
//line 3 "localise1.html"
output += stash.get('thing');
output += '\n';
//line 4 "localise1.html"
output += context.include('myblock');
//line 5 "localise1.html"
output += stash.get('thing');
output += '\n';

    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['myblock'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 7 "localise1.html"
stash.set('thing', 'baz');
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['localise2.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "localise2.html"
output += stash.get('thing');
output += '\n';
//line 2 "localise2.html"
stash.set('thing', 'bar');
//line 3 "localise2.html"
output += stash.get('thing');
output += '\n';
//line 4 "localise2.html"
output += context.process('myblock');
//line 5 "localise2.html"
output += stash.get('thing');
output += '\n';

    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['myblock'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 7 "localise2.html"
stash.set('thing', 'baz');
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['loop1.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "loop1.html"

// FOREACH 
(function() {
    var list = [ 0, 1, 2, 3 ];
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['i'] = value;
//line 2 "loop1.html"
output += stash.get('i');
output += ':';
//line 2 "loop1.html"
output += stash.get(['loop', 0, 'index', 0]);
output += '\n';;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['loop2.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 9 "loop2.html"

// FOREACH 
(function() {
    var list = [ 0, 1, 2, 3 ];
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['i'] = value;
//line 4 "loop2.html"
if (stash.get(['loop', 0, 'first', 0])) {
output += '[start]';
}

//line 5 "loop2.html"
output += stash.get('i');
//line 8 "loop2.html"
if (stash.get(['loop', 0, 'last', 0])) {
output += '[end]';
}
;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['loop3.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "loop3.html"

// FOREACH 
(function() {
    var list = [ 0, 1, 2, 3 ];
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['i'] = value;
//line 2 "loop3.html"
output += stash.get('i');
output += ':';
//line 2 "loop3.html"
output += stash.get(['loop', 0, 'count', 0]);
output += '\n';;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['loop4.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "loop4.html"

// FOREACH 
(function() {
    var list = [ 0, 1, 2, 3 ];
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['i'] = value;
//line 2 "loop4.html"
output += stash.get('i');
output += ':';
//line 2 "loop4.html"
output += stash.get(['loop', 0, 'size', 0]);
output += ':';
//line 2 "loop4.html"
output += stash.get(['loop', 0, 'max', 0]);
output += '\n';;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['loop5.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "loop5.html"

// FOREACH 
(function() {
    var list = [ 0, 1, 2, 3 ];
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['i'] = value;
//line 2 "loop5.html"
output += stash.get('i');
output += ':';
//line 2 "loop5.html"
output += stash.get(['loop', 0, 'prev', 0]);
output += ':';
//line 2 "loop5.html"
output += stash.get(['loop', 0, 'next', 0]);
output += '\n';;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

//line 6 "loop5.html"

// FOREACH 
(function() {
    var list = { 'a': 0, 'b': 1, 'c': 3, 'd': 4  };
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['i'] = value;
//line 5 "loop5.html"
output += stash.get('i');
output += ':';
//line 5 "loop5.html"
output += stash.get(['loop', 0, 'prev', 0]);
output += ':';
//line 5 "loop5.html"
output += stash.get(['loop', 0, 'next', 0]);
output += '\n';;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['myhashname.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "myhashname.html"
stash.set( "object", { name: 'Wally' } );
output += 'Hello, ';
//line 4 "myhashname.html"
output += stash.get(['object', 0, 'name', 0]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['myobjectnameac.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 4 "myobjectnameac.html"
var obj = new TheName('Bally');
stash.set( "objectName", obj.getName() );
output += 'Hello, ';
//line 5 "myobjectnameac.html"
output += stash.get('objectName');
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['myobjectnameac2.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "myobjectnameac2.html"
stash.set( "object", new TheName('Mally') );
output += 'Hello, ';
//line 4 "myobjectnameac2.html"
output += stash.get(['object', 0, 'getName', []]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['myobjectnameattr.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "myobjectnameattr.html"
stash.set( "object", new TheName('Larry') );
output += 'Hello, ';
//line 4 "myobjectnameattr.html"
output += stash.get(['object', 0, 'name', 0]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['operator1.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "operator1.html"
if ('abc' == 'abc') {
output += 'same';
}

output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['operator2.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 3 "operator2.html"
if ('abc' != 'def') {
output += 'not same';
}

output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['operator3.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "operator3.html"
output += 'abc'  + 'def';
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['plugins_basic.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "plugins_basic.html"
// USE
stash.set('dummy', context.plugin('dummy', [ 'simple param' ]));
//line 2 "plugins_basic.html"
output += stash.get(['dummy', 0, 'simple', 0]);
output += '\n#\n';
//line 4 "plugins_basic.html"
output += stash.get(['dummy', 0, 'params', [ 'one', 'two' ]]);
output += '\n#\n';
//line 6 "plugins_basic.html"
output += stash.get(['dummy', 0, 'what', 0]);
output += '\n#\n';
//line 8 "plugins_basic.html"
output += stash.get(['dummy', 0, 'get_what', 0]);
output += '\n#\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['stash-functions1.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "stash-functions1.html"
output += stash.get(['hash', 0, 'keys', 0, 'sort', 0, 'join', [ '+' ]]);
output += '\n';
//line 2 "stash-functions1.html"
output += stash.get(['hash', 0, 'keys', [], 'sort', [], 'join', [ '+' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['stash-functions2.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "stash-functions2.html"
output += stash.get(['hash', 0, 'keys', 0]);
output += '\n';
//line 2 "stash-functions2.html"
output += stash.get(['hash', 0, 'keys', [], 'join', [ '+' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['stash-functions3.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "stash-functions3.html"
output += stash.get(['hash', 0, 'noarg', 0]);
output += '\n';
//line 2 "stash-functions3.html"
output += stash.get(['hash', 0, 'noarg', []]);
output += '\n';
//line 3 "stash-functions3.html"
output += stash.get(['hash', 0, 'arg', [ 'abc' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['string_chunk.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "string_chunk.html"
stash.set('a', '1234567890');
//line 2 "string_chunk.html"
output += stash.get(['a', 0, 'chunk', 0, 'join', [ ' ' ]]);
output += '\n';
//line 3 "string_chunk.html"
output += stash.get(['a', 0, 'chunk', [ 2 ], 'join', [ ' ' ]]);
output += '\n';
//line 4 "string_chunk.html"
output += stash.get(['a', 0, 'chunk', [ 3 ], 'join', [ ' ' ]]);
output += '\n';
//line 5 "string_chunk.html"
output += stash.get(['a', 0, 'chunk', [ 9 ], 'join', [ ' ' ]]);
output += '\n';
//line 6 "string_chunk.html"
output += stash.get(['a', 0, 'chunk', [ 10 ], 'join', [ ' ' ]]);
output += '\n';
//line 7 "string_chunk.html"
output += stash.get(['a', 0, 'chunk', [ -1 ], 'join', [ ' ' ]]);
output += '\n';
//line 8 "string_chunk.html"
output += stash.get(['a', 0, 'chunk', [ -2 ], 'join', [ ' ' ]]);
output += '\n';
//line 9 "string_chunk.html"
output += stash.get(['a', 0, 'chunk', [ -3 ], 'join', [ ' ' ]]);
output += '\n';
//line 10 "string_chunk.html"
output += stash.get(['a', 0, 'chunk', [ -9 ], 'join', [ ' ' ]]);
output += '\n';
//line 11 "string_chunk.html"
output += stash.get(['a', 0, 'chunk', [ -10 ], 'join', [ ' ' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['string_defined.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "string_defined.html"
stash.set('a', '1');
//line 2 "string_defined.html"
output += stash.get(['a', 0, 'defined', 0]) ? '1' : '0';
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['string_hash.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "string_hash.html"
stash.set('a', 'Hi');
//line 2 "string_hash.html"
output += stash.get(['a', 0, 'hash', 0, 'value', 0]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['string_length.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "string_length.html"
stash.set('a', 'Hi');
//line 2 "string_length.html"
output += stash.get(['a', 0, 'length', 0]);
output += '\n';
//line 3 "string_length.html"
stash.set('a', 10);
//line 4 "string_length.html"
output += stash.get(['a', 0, 'length', 0]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['string_list.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "string_list.html"
stash.set('a', 'Hi');
//line 2 "string_list.html"
output += stash.get(['a', 0, 'list', 0, 0, 0]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['string_match.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "string_match.html"
stash.set('a', 'aaa12aaa34aaa56');
//line 2 "string_match.html"
output += stash.get(['a', 0, 'match', [ '\\\d\\\d' ], 'join', [ ' ' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['string_repeat.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "string_repeat.html"
stash.set('a', 'aaa');
//line 2 "string_repeat.html"
output += stash.get(['a', 0, 'repeat', [ 3 ]]);
output += '\n';
//line 3 "string_repeat.html"
output += stash.get(['a', 0, 'repeat', []]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['string_replace.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "string_replace.html"
stash.set('a', 'aaa12aaa34aaa56');
//line 2 "string_replace.html"
output += stash.get(['a', 0, 'replace', [ '\\\d\\\d', 'bb' ]]);
output += '\n';
//line 3 "string_replace.html"
output += stash.get(['a', 0, 'replace', [ '\\\d\\\d' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['string_search.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "string_search.html"
stash.set('a', 'aaa12aaa34aaa56');
//line 2 "string_search.html"
output += stash.get(['a', 0, 'search', [ '\\\d\\\d' ]]) ? 1 : 0;
output += '\n';
//line 3 "string_search.html"
output += stash.get(['a', 0, 'search', [ 'w' ]]) ? 1 : 0;
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['string_size.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "string_size.html"
stash.set('a', '1');
//line 2 "string_size.html"
output += stash.get(['a', 0, 'defined', 0]) ? '1' : '0';
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['string_split.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "string_split.html"
stash.set('a', 'aaa12aaa34aaa');
//line 2 "string_split.html"
output += stash.get(['a', 0, 'split', [ '\\\d\\\d' ], 'join', [ ' ' ]]);
output += '\n';
//line 3 "string_split.html"
stash.set('a', '1aaa2aaa3aaa4');
//line 4 "string_split.html"
output += stash.get(['a', 0, 'split', [ 'aaa' ], 'join', [ ' ' ]]);
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['test.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "test.html"
stash.set('testhash', {   });
//line 2 "test.html"
stash.set('testkey', 'bob');
//line 3 "test.html"
stash.set(['testhash', 0, stash.get('testkey'), 0], 'bozo');
output += 'Value: ';
//line 4 "test.html"
output += stash.get(['testhash', 0, stash.get('testkey'), 0]);
output += '<br />\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

