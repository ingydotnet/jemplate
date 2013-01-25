/*------------------------------------------------------------------------------
Jemplate - Template Toolkit for JavaScript

DESCRIPTION - This module provides the runtime JavaScript support for
compiled Jemplate templates.

AUTHOR - Ingy döt Net <ingy@cpan.org>

Copyright 2006,2008 Ingy döt Net.

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

Jemplate.VERSION = '0.22';

Jemplate.process = function() {
    var jemplate = new Jemplate(Jemplate.prototype.config);
    return jemplate.process.apply(jemplate, arguments);
}

;(function(){

if (! Jemplate.templateMap)
    Jemplate.templateMap = {};

var proto = Jemplate.prototype = {};

proto.config = {
    AUTO_RESET: true,
    BLOCKS: {},
    CONTEXT: null,
    DEBUG_UNDEF: false,
    DEFAULT: null,
    ERROR: null,
    EVAL_JAVASCRIPT: false,
    GLOBAL : true,
	SCOPE : this,
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

proto.defaults = {
    AUTO_RESET: true,
    BLOCKS: {},
    CONTEXT: null,
    DEBUG_UNDEF: false,
    DEFAULT: null,
    ERROR: null,
    EVAL_JAVASCRIPT: false,
    GLOBAL : true,
	SCOPE : this,
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


Jemplate.init = function(config) {
 
    Jemplate.prototype.config = config || {};
    
    for (var i in Jemplate.prototype.defaults) {
        if(typeof Jemplate.prototype.config[i] == "undefined") {
            Jemplate.prototype.config[i] = Jemplate.prototype.defaults[i];
        }
    }
}

proto.init = function(config) {
    
    this.config = config || {};
    
    for (var i in Jemplate.prototype.defaults) {
        if(typeof this.config[i] == "undefined") {
            this.config[i] = Jemplate.prototype.defaults[i];
        }
    }
}

proto.process = function(template, data, output) {
    var context = this.config.CONTEXT || new Jemplate.Context();
    context.config = this.config;

    context.stash = new Jemplate.Stash(this.config.STASH, this.config);

    context.__filter__ = new Jemplate.Filter();
    context.__filter__.config = this.config;

    context.__plugin__ = new Jemplate.Plugin();
    context.__plugin__.config = this.config;

    var result;

    var proc = function(input) {
        try {
            if (typeof context.config.PRE_PROCESS == 'string') context.config.PRE_PROCESS = [context.config.PRE_PROCESS];                
            for (var i = 0; i < context.config.PRE_PROCESS.length; i++) {
                context.process(context.config.PRE_PROCESS[i]);
            }
            
            result = context.process(template, input);
            
            if (typeof context.config.POST_PROCESS == 'string') context.config.PRE_PROCESS = [context.config.POST_PROCESS];
            for (i = 0; i < context.config.POST_PROCESS.length; i++) {
                context.process(context.config.POST_PROCESS[i]);
            }
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
	var func = eval(name);
    return new func(this, args);
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
     return encodeURIComponent(text);
}
 
proto.filters.url = function(text) {
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
    Jemplate.Stash = function(stash, config) {
        this.__config__ = config;
		
		this.data = {
			GLOBAL : this.__config__.SCOPE			
		};
		this.LOCAL_ANCHOR = {};
		this.data.LOCAL = this.LOCAL_ANCHOR;
		
		this.update(stash);
    };
}

proto = Jemplate.Stash.prototype;

proto.clone = function(args) {
    var data = this.data;
    this.data = {
		GLOBAL : this.__config__.SCOPE
	};
	this.data.LOCAL = this.LOCAL_ANCHOR;
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
        if (key != 'GLOBAL' && key != 'LOCAL') {
	        this.set(key, args[key]);
		}
    }
}

proto.get = function(ident, args) {
    var root = this.data;
    
    var value;
    
    if ( (ident instanceof Array) || (typeof ident == 'string' && /\./.test(ident) ) ) {
        
        if (typeof ident == 'string') {
            ident = ident.split('.');
            var newIdent = [];
            for (var i = 0; i < ident.length; i++) {
                newIdent.push(ident.replace(/\(.*$/,''));
                newIdent.push(0);
            }
            ident = newIdent;
        }
        
        for (var i = 0; i < ident.length; i += 2) {
            var dotopArgs = ident.slice(i, i+2);
            dotopArgs.unshift(root);
            value = this._dotop.apply(this, dotopArgs);
            if (typeof value == 'undefined')
                break;
            root = value;
        }
    }
    else {
        value = this._dotop(root, ident, args);
    }

    if (typeof value == 'undefined' || value == null) {
        if (this.__config__.DEBUG_UNDEF)
            throw("undefined value found while using DEBUG_UNDEF");
        value = '';
    }

    return value;
}



proto.set = function(ident, value, set_default) {
    
    var root, result, error;
    
    root = this.data;
    
    while (true) {
        if ( (ident instanceof Array) || (typeof ident == 'string' && /\./.test(ident) ) ) {
            
            if (typeof ident == 'string') {
                ident = ident.split('.');
                var newIdent = [];
                for (var i = 0; i < ident.length; i++) {
                    newIdent.push(ident.replace(/\(.*$/,''));
                    newIdent.push(0);
                }
                ident = newIdent;
            }
            
            for (var i = 0; i < ident.length - 2; i += 2) {
                var dotopArgs = ident.slice(i, i+2);
                dotopArgs.unshift(root);
                dotopArgs.push(1);
                result = this._dotop.apply(this, dotopArgs);
                if (typeof value == 'undefined')
                    break;
                root = result;
            }
            
            var assignArgs = ident.slice(ident.length-2, ident.length);
            assignArgs.unshift(root);
            assignArgs.push(value);
            assignArgs.push(set_default);
            
            
            result = this._assign.apply(this, assignArgs);
        } else {
            result = this._assign(root, ident, 0, value, set_default);
        }
        break;
    }
    
    return (typeof result != 'undefined') ? result : '';
}



proto._dotop = function(root, item, args, lvalue) {    
    if (root == this.LOCAL_ANCHOR) root = this.data;
	var atroot = root == this.data;
    
    var value,result = undefined;
    
   	var is_function_call = args instanceof Array;
   	
   	args = args || [];
    
    if (typeof root == 'undefined' || typeof item == 'undefined' || typeof item == 'string' && item.match(/^[\._]/)) {
        return undefined;
    }


    //root is complex object, not scalar
    if (atroot || (root instanceof Object && !(root instanceof Array)) || root == this.data.GLOBAL) {
        
		if (typeof root[item] != 'undefined' && root[item] != null && (!is_function_call || !this.hash_functions[item])) { //consider undefined == null
            if (typeof root[item] == 'function') {
                result = root[item].apply(root,args);
            } else {
                return root[item];
            }
        } else if (lvalue) {
            return root[item] = {};
        } else if (this.hash_functions[item] && !atroot || item == 'import') {
            args.unshift(root);
            result = this.hash_functions[item].apply(this,args);
        } else if (item instanceof Array) {
            result = {};
            
            for (var i = 0; i < item.length; i++) result[item[i]] = root[item[i]];
            return result;
        }
    } else if (root instanceof Array) {
        if (this.list_functions[item]) {
            args.unshift(root);
            result = this.list_functions[item].apply(this,args);
        } else if (typeof item == 'string' && /^-?\d+$/.test(item) || typeof item == 'number' ) {
            if (typeof root[item] != 'function') return root[item];
            result = root[item].apply(this, args);
        } else if (item instanceof Array) {
            for (var i = 0; i < item.length; i++) result.push(root[item[i]]);
            return result;
        }
    } else if (this.string_functions[item] && !lvalue) {
        args.unshift(root);
        result = this.string_functions[item].apply(this, args);
    } else if (this.list_functions[item] && !lvalue) {
        args.unshift([root]);
        result = this.list_functions[item].apply(this,args);
    } else {
        result = undefined;
    }
    
    
    if (result instanceof Array) {
		if (typeof result[0] == 'undefined' && typeof result[1] != 'undefined') {
	        throw result[1];
	    }
	}
    
    return result;

}


proto._assign = function(root, item, args, value, set_default) {
    var atroot = root == this.data;
    var result;
    
    args = args || [];
    
    if (typeof root == 'undefined' || typeof item == 'undefined' || typeof item == 'string' && item.match(/^[\._]/)) {
        return undefined;
    }
    
    if (atroot || root.constructor == Object || root == this.data.GLOBAL) {
		
		if (root == this.LOCAL_ANCHOR) root = this.data;
			 
		if (!(set_default && typeof root[item] != 'undefined')) {
            if (atroot && item == 'GLOBAL') throw "Attempt to modify GLOBAL access modifier"
			if (atroot && item == 'LOCAL') throw "Attempt to modify LOCAL access modifier"
			
			return root[item] = value;
        } 
    } else if ((root instanceof Array) && (typeof item == 'string' && /^-?\d+$/.test(item) || typeof item == 'number' )) {
        if (!(set_default && typeof root[item] != 'undefined')) {
            return root[item] = value;
        }
    } else if ( (root.constructor != Object) && (root instanceof Object) ) {
        try {
            result = root[item].apply(root,args);
        } catch (e) {
        }
    } else {
        throw 'dont know how to assign to [' + root + '.' + item +']';
    }
    
    return undefined;
}


proto.string_functions = {};

// typeof
proto.string_functions['typeof'] = function(value) {
    return typeof value;
}

// chunk(size)     negative size chunks from end
proto.string_functions.chunk = function(string, size) {
    //var size = args;
    var list = new Array();
    if (! size)
        size = 1;
    if (size < 0) {
        size = 0 - size;
        for (var i = string.length - size; i >= 0; i = i - size)
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
proto.string_functions.match = function(string, re, modifiers) {
    var regexp = new RegExp(re, modifiers == undefined ? 'g' : modifiers);
    var list = string.match(regexp);
    return list;
}

// repeat(n)       repeated n times
proto.string_functions.repeat = function(string, args) {
    var n = args || 1;
    var output = '';
    for (var i = 0; i < n; i++) {
        output += string;
    }
    return output;
}

// replace(re, sub, global)    replace instances of re with sub
proto.string_functions.replace = function(string, re, sub, modifiers) {
    var regexp = new RegExp(re, modifiers == undefined ? 'g' : modifiers);    
    if (! sub) sub  = '';

    return string.replace(regexp, sub);
}

// search(re)      true if value matches re
proto.string_functions.search = function(string, re) {
    var regexp = new RegExp(re);
    return (string.search(regexp) >= 0) ? 1 : 0;
}

// size            returns 1, as if a single-item list
proto.string_functions.size = function(string) {
    return 1;
}

// split(re)       split string on re
proto.string_functions.split = function(string, re) {
    var regexp = new RegExp(re);
    var list = string.split(regexp);
    return list;
}



proto.list_functions = {};

// typeof
proto.list_functions['typeof'] = function(list) {
    return 'array';
};


proto.list_functions.list = function(list) {
    return list;
};

proto.list_functions.join = function(list, str) {
    return list.join(str);
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

proto.list_functions.grep = function(list, re) {
    var regexp = new RegExp(re);
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

proto.list_functions.merge = function(list /*, ... args */) {
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
    for (var i = 1; i < arguments.length; i++) {
        push_all(arguments[i]);
    }
    return result;
}

proto.list_functions.slice = function(list, start, end) {
    // To make it like slice in TT
    // See rt53453
    if ( end == -1 ) {
        return list.slice( start );
    }
    return list.slice( start, end + 1 );
}

proto.list_functions.splice = function(list /*, ... args */ ) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    
    return list.splice.apply(list,args);
}

proto.list_functions.push = function(list, value) {
    list.push(value);
    return list;
}

proto.list_functions.pop = function(list) {
    return list.pop();
}

proto.list_functions.unshift = function(list, value) {
    list.unshift(value);
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

// typeof
proto.hash_functions['typeof'] = function(hash) {
    return 'object';
};


// each            list of alternating keys/values
proto.hash_functions.each = function(hash) {
    var list = new Array();
    for ( var key in hash )
        list.push(key, hash[key]);
    return list;
}

// exists(key)     does key exist?
proto.hash_functions.exists = function(hash, key) {
    return ( typeof( hash[key] ) == "undefined" ) ? 0 : 1;
}

// import(hash2)   import contents of hash2
// import          import into current namespace hash
proto.hash_functions['import'] = function(hash, hash2) {    
    for ( var key in hash2 )
        hash[key] = hash2[key];
    return '';
}

// keys            list of keys
proto.hash_functions.keys = function(hash) {
    var list = new Array();
    for ( var key in hash )
        list.push(key);
    return list;
}

// list            returns alternating key, value
proto.hash_functions.list = function(hash, what) {
    //var what = '';
    //if ( args )
        //what = args[0];

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

// item           return a value by key
proto.hash_functions.item = function(hash, key) {
    return hash[key];
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

proto.hash_functions.pairs = function(hash) {
    var list = new Array();
    var keys = new Array();
    for ( var key in hash ) {
        keys.push( key );
    }
    keys.sort();
    for ( var key in keys ) {
        key = keys[key]
        list.push( { 'key': key, 'value': hash[key] } );
    }
    return list;
}

//  delete
proto.hash_functions.remove = function(hash, key) {
    return delete hash[key];
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
        } else if (typeof object == 'undefined' || object == null || object == '') {
            this.object = null;
            this.max  = -1;
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
        if (index <= this.max) {
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
