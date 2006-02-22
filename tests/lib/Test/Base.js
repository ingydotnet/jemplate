proto = Subclass('Test.Base');

proto.init = function() {
    this.builder = Test.Builder.instance();
    this.builder.reset();
    this.state = {};
    this.state.compiled = false;
    this.state.spec_url = null;
    this.state.spec_content = null;
    this.state.filters_map = {};
    this.state.blocks = [];
}

proto.spec = function(url) {
    this.state.spec_url = url;
}

proto.filters = function(obj) {
    this.state.filters_map = obj;
}

proto.run_is = function(x, y) {
    this.compile();
    var blocks =  this.state.blocks;
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (! this.verify_block(block, x, y)) continue;
        this.is(block.data[x], block.data[y], block.name);
    }
}

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

    var text = Test.Base.xhr_get(url);
    text = text.replace(/(?:.|\n)*\/\*\s*test.*\n/i, '');
    text = text.replace(/\n\*\/(?:.|\n)*/, '');
    this.state.spec_content = text;
}

proto.create_blocks = function() {
    var text = this.state.spec_content;
    var hunks = text.split(/(?=(\A|^)===)/m);
    for (var i = 0; i < hunks.length; i++) {
        var hunk = hunks[i];
        if (! hunk.match(/^===/)) continue;
        var block = this.make_block(hunk);
        this.state.blocks.push(block);
    }
}

proto.make_block = function(hunk) {
    var block = new Test.Base.Block();
    if (! hunk.match(/^===/)) throw("Invalid Hunk");

    var index = hunk.indexOf('\n') + 1;
    if (! index) throw('Invalid Hunk.');
    var name = hunk.substr(4, index - 5);
    hunk = hunk.substr(index); 
    block.name = name.replace(/^\s*(.*?)\s*$/, '$1');

    var chunks = [];
    while (hunk.indexOf('\n---') >= 0) {
        index = hunk.indexOf('\n---') + 1;
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
        line1 = line1.replace(/^---\s*/, '');
        if (! line1.length) throw('xxx2');
        var section_name = '';
        var section_filters = ['trim'];
        if (line1.indexOf(':') >= 0) {
            index = line1.indexOf(':');
            section_data = line1.substr(index + 1);
            line1 = line1.substr(0, index);
        }
        if (! line1.match(/^\w+$/)) throw('xxx3');
        section_name = line1;
        block.add_section(section_name, section_filters, section_data);
    }
    return block;
}

proto.verify_block = function(block) {
    block.apply_filters(this.state.filters);
    for (var i = 1; i < arguments.length; i++) {
        if (typeof block.data[arguments[i]] == 'undefined') return false;
    }
    return true;
}

Test.Base.xhr_get = function(url) {
    var req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.send(null);
    if (req.status != 200)
        throw('Request for "' + url + '" failed with status: ' + req.status);
    return req.responseText;
}

//------------------------------------------------------------------------------
proto = Subclass('Test.Base.Block');

proto.init = function() {
    this.name = null;
    this.description = null;
    this.sections = [];
    this.data = {};
    this.filters = {};
}

proto.add_section = function(name, filters, data) {
    this.sections.push(name);
    this.data[name] = data;
    this.filters[name] = filters;
}

proto.apply_filters = function(filter_overrides, filters_class) {
    var sections = this.sections;
    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var filters = ['normalize', 'trim'];
        this.push_filters(filters, this.filters[section]);
        this.push_filters(filters, filter_overrides);
        this.filter_section(section, filters);
    }
}

proto.push_filters = function(a1, a2) {
    if (typeof a2 == 'undefined')
        return;
    for (var i = 0; i < a2.length; i++) {
        a1.push(a2[i]);
    }
}

proto.filter_section = function(section, filters) {
    var data = this.data;
    for (var i = 1; i < filters.length; i++) {
        var filter = filters[i];
        if (window[filter])
            data = (window[filter])(data, this);
        else if (Test.Jemplate.Filter[filter])
            data = (Test.Jemplate.Filter[filter])(data, this);
        else if (Test.Jemplate.Filter[filter])
            data = (Test.Jemplate.Filter[filter])(data, this);
        else
            throw('No function for filter: ' + filter);
    }
    this.data = data;
}

//------------------------------------------------------------------------------
proto = Subclass('Test.Base.Filter');

proto.xhr_get = function(url) {
    url = url.replace(/n+$/, '');
    return Test.Base.xhr_get(url);
}

proto.trim = function(content, block) {
    return content;
}
