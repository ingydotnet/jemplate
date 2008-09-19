(function() {

Test.Base = function() {
    this.init.apply(this, arguments);
}
var proto = Test.Base.prototype;

Test.Base.VERSION = '0.16';

Test.Base.newSubclass = function(name, base, isFinal) {
    if (
        !name || typeof(name) != 'string' ||
        base && typeof(base) != 'string'
    ) throw "Usage: Test.Base.newSubclass('subclass.name' [, 'baseclass.name'])";
    if (!base)
        base = 'Test.Base';

    var parts = name.split('.');
    var subclass = window;
    for (var i = 0; i < parts.length; i++) {
        if (! subclass[parts[i]])
            subclass[parts[i]] = function() {
                try { this.init() } catch(e) {throw(e)}
            };
        subclass = subclass[parts[i]];
    }

    var baseclass = eval('new ' + base + '()');
    subclass.prototype = baseclass;
    subclass.prototype.className = name;
    subclass.prototype.baseClassName = base;

    if (! isFinal) {
        subclass.prototype.init = function() {
            eval(base).prototype.init.call(this);
            this.block_class = name + '.Block';
        }

        var block_proto =
            Test.Base.newSubclass(name + '.Block', base + '.Block', true);

        block_proto.init = function() {
            eval(base + '.Block').prototype.init.call(this);
            this.filter_object = eval('new ' + name + '.Filter()');
        }

        Test.Base.newSubclass(name + '.Filter', base + '.Filter', true);
    }

    subclass.prototype.classname = name;
    return subclass.prototype;
}

proto.init = function() {
    this.builder = Test.Builder.instance();
    this.builder.reset();
    this.block_class = 'Test.Base.Block';
    this.state = {};
    this.state.compiled = false;
    this.state.spec_url = testBaseCurrentScript;
    this.state.spec_content = null;
    this.state.filters_map = {};
    this.state.blocks = [];
    this.section_delim = '---';
}

proto.spec = function(url) {
    this.state.spec_url = url;
}

proto.filters = function(obj) {
    this.state.filters_map = obj;
}

proto.run_is = function(x, y) {
    try {
        this.compile();
        var blocks =  this.state.blocks;
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            if (! this.verify_block(block, x, y)) continue;
            this.is(block.data[x], block.data[y], block.name);
        }
    }
    catch(e) {
        // alert(e);
        throw(e);
    }
}

// TODO Add more proxy functions for common builder stuffs
proto.plan = function(number) {
    var cmds = {tests: number};
    return this.builder.plan(cmds);
}

proto.pass = function(name) {
    return this.builder.ok(true, name);
}

proto.fail = function(name) {
    return this.builder.ok(false, name);
}

proto.ok = function(test, desc) {
    this.builder.ok(test, desc);
}

proto.is = function (got, expect, desc) {
    return this.builder.isEq(got, expect, desc);
};

proto.isnt = function (got, expect, desc) {
    return this.builder.isntEq(got, expect, desc);
};

proto.like = function (val, regex, desc) {
    return this.builder.like(val, regex, desc);
};

proto.unlike = function (val, regex, desc) {
    return this.builder.unlike(val, regex, desc);
};

proto.skip = function(why) {
    return this.builder.skip(why);
};

proto.skipAll = function(why) {
    return this.builder.skipAll(why);
};

proto.compile = function() {
    if (this.state.compiled) return;
    this.get_spec();
    this.create_blocks();
    this.state.compiled = true;
}

proto.get_spec = function() {
    var url = this.state.spec_url;
    if (url == undefined)
        throw('no spec provided');

    var text = Ajax.get(url);
    text = text.replace(/(?:.|\n)*\/\*\s*test.*\n/i, '');
    text = text.replace(/\n\*\/(?:.|\n)*/, '');
    this.state.spec_content = text;
}

proto.create_blocks = function() {
    var text = this.state.spec_content;
    // This is what we want but Safari is broken with ^ and m flag
    // var hunks = text.split(/(?=(\A|^)===)/m);
    // This works for now but is too fragile.
    var hunks = text.split(/(?====)/);
    for (var i = 0; i < hunks.length; i++) {
        var hunk = hunks[i];
        if (! hunk.match(/^===/)) continue;
        var block = this.make_block(hunk);
        this.state.blocks.push(block);
    }
}

proto.make_block = function(hunk) {
    var block = eval('new ' + this.block_class + '()');
    if (! hunk.match(/^===/)) throw("Invalid Hunk");

    var index = hunk.indexOf('\n') + 1;
    if (! index) throw('Invalid Hunk.');
    var name = hunk.substr(4, index - 5);
    hunk = hunk.substr(index); 
    block.name = name.replace(/^\s*(.*?)\s*$/, '$1');

    var chunks = [];
    while (hunk.indexOf('\n' + this.section_delim + ' ') >= 0) {
        index = hunk.indexOf('\n' + this.section_delim + ' ') + 1;
        var chunk = hunk.substr(0, index);
        hunk = hunk.substr(index);
        chunks.push(chunk);
    }
    chunks.push(hunk);

    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i];
        index = chunk.indexOf('\n');
        if (index < 0) throw('xxx1');
        var line1 = chunk.substr(0, index);
        var section_data = chunk.substr(index + 1);
        var re = new RegExp(
            '^' +
            this.section_delim.replace(/([\+\*])/g, '\\$1') +
            '\\s+'
        );
        line1 = line1.replace(re, '');
        if (! line1.length) throw('xxx2');
        var section_name = '';
        var section_filters = [];
        if (line1.indexOf(':') >= 0) {
            index = line1.indexOf(':');
            section_data = line1.substr(index + 1).
                replace(/^\s*(.*?)\s*$/, '$1');
            line1 = line1.substr(0, index);
        }
        if (! line1.match(/^\w+$/)) throw('xxx3');
        section_name = line1;
        block.add_section(section_name, section_filters, section_data);
    }
    return block;
}

proto.verify_block = function(block) {
    block.apply_filters(this.state.filters_map);
    for (var i = 1; i < arguments.length; i++) {
        var value = arguments[i];
        if (typeof block.data[value] == 'undefined') return false;
    }
    return true;
}

//------------------------------------------------------------------------------
Test.Base.Block = function() {
    this.init.apply(this, arguments);
}
proto = Test.Base.Block.prototype;

proto.init = function() {
    this.name = null;
    this.description = null;
    this.sections = [];
    this.data = {};
    this.filters = {};
    this.filter_object = new Test.Base.Filter();
}

proto.add_section = function(name, filters, data) {
    this.sections.push(name);
    this.data[name] = data;
    this.filters[name] = filters;
}

proto.apply_filters = function(filter_overrides) {
    var sections = this.sections;
    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var filters = ['normalize', 'trim'];
        this.push_filters(filters, this.filters[section]);
        this.push_filters(filters, filter_overrides[section]);
        this.filter_section(section, filters);
    }
}

proto.push_filters = function(a1, a2) {
    if (typeof a2 == 'undefined')
        return;
    if (typeof a2 == 'string')
        a1.push(a2);
    else {
        for (var i = 0; i < a2.length; i++) {
            a1.push(a2[i]);
        }
    }
}

proto.filter_section = function(section, filters) {
    var data = this.data[section];
    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];
        if (typeof filter == 'function') {
            data = filter.call(this, data, this);
        }
        else if (
            typeof window[filter] == 'function' &&
            filter != 'eval'
        )
            data = (window[filter]).call(this, data, this);
        else if (typeof this.filter_object[filter] == 'function')
            data = (this.filter_object[filter]).call(this, data, this);
        else
            throw('No function for filter: ' + filter);
    }
    this.data[section] = data;
}

//------------------------------------------------------------------------------
Test.Base.Filter = function() {
    this.init.apply(this, arguments);
}
proto = Test.Base.Filter.prototype;

proto.init = function() {
}

proto.ajax_get = function(url) {
    url = url.replace(/n+$/, '');
    return Ajax.get(url);
}

proto.trim = function(content, block) {
    var result = content.replace(/^\s*\n/, '');
    result = result.replace(/\n\s*$/, '\n');
    return result;
}

proto.normalize = function(content, block) {
    return content;
}

proto.evaluate = function(content, block) {
    var javascript = content;
    var object = JSON.parse(javascript);
    return object;
}

proto.eval = function(content, block) {
    var javascript = content;
    var object = eval(content);
    return object;
}

//------------------------------------------------------------------------------
// Debugging Support
//------------------------------------------------------------------------------

function XXX(msg) {
    //if (! confirm(arguments.join('\n')))
    if (! confirm(msg))
        throw("terminated...");
    return msg;
}

function JJJ(obj) {
    return XXX(JSON.stringify(obj));
}

//------------------------------------------------------------------------------
// Ajax support
//------------------------------------------------------------------------------
if (! this.Ajax) Ajax = {};

Ajax.get = function(url, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url, Boolean(callback));
    return Ajax._send(req, null, callback, url);
}

Ajax.post = function(url, data, callback) {
    var req = new XMLHttpRequest();
    req.open('POST', url, Boolean(callback));
    req.setRequestHeader(
        'Content-Type', 
        'application/x-www-form-urlencoded'
    );
    return Ajax._send(req, data, callback, url);
}

Ajax._send = function(req, data, callback, url) {
    if (callback) {
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                if(req.status == 200)
                    callback(req.responseText);
            }
        };
    }
    req.send(data);
    if (!callback) {
        if (req.status != 200)
            throw('Request for "' + url +
                  '" failed with status: ' + req.status);
        return req.responseText;
    }
}

//------------------------------------------------------------------------------
// Cross-Browser XMLHttpRequest v1.1
//------------------------------------------------------------------------------
/*
Emulate Gecko 'XMLHttpRequest()' functionality in IE and Opera. Opera requires
the Sun Java Runtime Environment <http://www.java.com/>.

by Andrew Gregory
http://www.scss.com.au/family/andrew/webdesign/xmlhttprequest/

This work is licensed under the Creative Commons Attribution License. To view a
copy of this license, visit http://creativecommons.org/licenses/by/1.0/ or send
a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305,
USA.
*/

// IE support
if (window.ActiveXObject && !window.XMLHttpRequest) {
  window.XMLHttpRequest = function() {
    return new ActiveXObject((navigator.userAgent.toLowerCase().indexOf('msie 5') != -1) ? 'Microsoft.XMLHTTP' : 'Msxml2.XMLHTTP');
  };
}

// Opera support
if (window.opera && !window.XMLHttpRequest) {
  window.XMLHttpRequest = function() {
    this.readyState = 0; // 0=uninitialized,1=loading,2=loaded,3=interactive,4=complete
    this.status = 0; // HTTP status codes
    this.statusText = '';
    this._headers = [];
    this._aborted = false;
    this._async = true;
    this.abort = function() {
      this._aborted = true;
    };
    this.getAllResponseHeaders = function() {
      return this.getAllResponseHeader('*');
    };
    this.getAllResponseHeader = function(header) {
      var ret = '';
      for (var i = 0; i < this._headers.length; i++) {
        if (header == '*' || this._headers[i].h == header) {
          ret += this._headers[i].h + ': ' + this._headers[i].v + '\n';
        }
      }
      return ret;
    };
    this.setRequestHeader = function(header, value) {
      this._headers[this._headers.length] = {h:header, v:value};
    };
    this.open = function(method, url, async, user, password) {
      this.method = method;
      this.url = url;
      this._async = true;
      this._aborted = false;
      if (arguments.length >= 3) {
        this._async = async;
      }
      if (arguments.length > 3) {
        // user/password support requires a custom Authenticator class
        opera.postError('XMLHttpRequest.open() - user/password not supported');
      }
      this._headers = [];
      this.readyState = 1;
      if (this.onreadystatechange) {
        this.onreadystatechange();
      }
    };
    this.send = function(data) {
      if (!navigator.javaEnabled()) {
        alert("XMLHttpRequest.send() - Java must be installed and enabled.");
        return;
      }
      if (this._async) {
        setTimeout(this._sendasync, 0, this, data);
        // this is not really asynchronous and won't execute until the current
        // execution context ends
      } else {
        this._sendsync(data);
      }
    }
    this._sendasync = function(req, data) {
      if (!req._aborted) {
        req._sendsync(data);
      }
    };
    this._sendsync = function(data) {
      this.readyState = 2;
      if (this.onreadystatechange) {
        this.onreadystatechange();
      }
      // open connection
      var url = new java.net.URL(new java.net.URL(window.location.href), this.url);
      var conn = url.openConnection();
      for (var i = 0; i < this._headers.length; i++) {
        conn.setRequestProperty(this._headers[i].h, this._headers[i].v);
      }
      this._headers = [];
      if (this.method == 'POST') {
        // POST data
        conn.setDoOutput(true);
        var wr = new java.io.OutputStreamWriter(conn.getOutputStream());
        wr.write(data);
        wr.flush();
        wr.close();
      }
      // read response headers
      // NOTE: the getHeaderField() methods always return nulls for me :(
      var gotContentEncoding = false;
      var gotContentLength = false;
      var gotContentType = false;
      var gotDate = false;
      var gotExpiration = false;
      var gotLastModified = false;
      for (var i = 0; ; i++) {
        var hdrName = conn.getHeaderFieldKey(i);
        var hdrValue = conn.getHeaderField(i);
        if (hdrName == null && hdrValue == null) {
          break;
        }
        if (hdrName != null) {
          this._headers[this._headers.length] = {h:hdrName, v:hdrValue};
          switch (hdrName.toLowerCase()) {
            case 'content-encoding': gotContentEncoding = true; break;
            case 'content-length'  : gotContentLength   = true; break;
            case 'content-type'    : gotContentType     = true; break;
            case 'date'            : gotDate            = true; break;
            case 'expires'         : gotExpiration      = true; break;
            case 'last-modified'   : gotLastModified    = true; break;
          }
        }
      }
      // try to fill in any missing header information
      var val;
      val = conn.getContentEncoding();
      if (val != null && !gotContentEncoding) this._headers[this._headers.length] = {h:'Content-encoding', v:val};
      val = conn.getContentLength();
      if (val != -1 && !gotContentLength) this._headers[this._headers.length] = {h:'Content-length', v:val};
      val = conn.getContentType();
      if (val != null && !gotContentType) this._headers[this._headers.length] = {h:'Content-type', v:val};
      val = conn.getDate();
      if (val != 0 && !gotDate) this._headers[this._headers.length] = {h:'Date', v:(new Date(val)).toUTCString()};
      val = conn.getExpiration();
      if (val != 0 && !gotExpiration) this._headers[this._headers.length] = {h:'Expires', v:(new Date(val)).toUTCString()};
      val = conn.getLastModified();
      if (val != 0 && !gotLastModified) this._headers[this._headers.length] = {h:'Last-modified', v:(new Date(val)).toUTCString()};
      // read response data
      var reqdata = '';
      var stream = conn.getInputStream();
      if (stream) {
        var reader = new java.io.BufferedReader(new java.io.InputStreamReader(stream));
        var line;
        while ((line = reader.readLine()) != null) {
          if (this.readyState == 2) {
            this.readyState = 3;
            if (this.onreadystatechange) {
              this.onreadystatechange();
            }
          }
          reqdata += line + '\n';
        }
        reader.close();
        this.status = 200;
        this.statusText = 'OK';
        this.responseText = reqdata;
        this.readyState = 4;
        if (this.onreadystatechange) {
          this.onreadystatechange();
        }
        if (this.onload) {
          this.onload();
        }
      } else {
        // error
        this.status = 404;
        this.statusText = 'Not Found';
        this.responseText = '';
        this.readyState = 4;
        if (this.onreadystatechange) {
          this.onreadystatechange();
        }
        if (this.onerror) {
          this.onerror();
        }
      }
    };
  };
}
// ActiveXObject emulation
if (!window.ActiveXObject && window.XMLHttpRequest) {
  window.ActiveXObject = function(type) {
    switch (type.toLowerCase()) {
      case 'microsoft.xmlhttp':
      case 'msxml2.xmlhttp':
        return new XMLHttpRequest();
    }
    return null;
  };
}


//------------------------------------------------------------------------------
// JSON Support
//------------------------------------------------------------------------------

/*
Copyright (c) 2005 JSON.org
*/
var JSON = function () {
    var m = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        s = {
            'boolean': function (x) {
                return String(x);
            },
            number: function (x) {
                return isFinite(x) ? String(x) : 'null';
            },
            string: function (x) {
                if (/["\\\x00-\x1f]/.test(x)) {
                    x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                        var c = m[b];
                        if (c) {
                            return c;
                        }
                        c = b.charCodeAt();
                        return '\\u00' +
                            Math.floor(c / 16).toString(16) +
                            (c % 16).toString(16);
                    });
                }
                return '"' + x + '"';
            },
            object: function (x) {
                if (x) {
                    var a = [], b, f, i, l, v;
                    if (x instanceof Array) {
                        a[0] = '[';
                        l = x.length;
                        for (i = 0; i < l; i += 1) {
                            v = x[i];
                            f = s[typeof v];
                            if (f) {
                                v = f(v);
                                if (typeof v == 'string') {
                                    if (b) {
                                        a[a.length] = ',';
                                    }
                                    a[a.length] = v;
                                    b = true;
                                }
                            }
                        }
                        a[a.length] = ']';
                    } else if (x instanceof Object) {
                        a[0] = '{';
                        for (i in x) {
                            v = x[i];
                            f = s[typeof v];
                            if (f) {
                                v = f(v);
                                if (typeof v == 'string') {
                                    if (b) {
                                        a[a.length] = ',';
                                    }
                                    a.push(s.string(i), ':', v);
                                    b = true;
                                }
                            }
                        }
                        a[a.length] = '}';
                    } else {
                        return;
                    }
                    return a.join('');
                }
                return 'null';
            }
        };
    return {
        copyright: '(c)2005 JSON.org',
        license: 'http://www.crockford.com/JSON/license.html',
        stringify: function (v) {
            var f = s[typeof v];
            if (f) {
                v = f(v);
                if (typeof v == 'string') {
                    return v;
                }
            }
            return null;
        },
        parse: function (text) {
            try {
                return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
                        text.replace(/"(\\.|[^"\\])*"/g, ''))) &&
                    eval('(' + text + ')');
            } catch (e) {
                return false;
            }
        }
    };
}();

})();
