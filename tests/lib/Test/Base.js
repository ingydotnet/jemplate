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
    this.apply_filters();
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
    alert(JSON.stringify(chunks));
}

proto.apply_filters = function() {
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

proto.data = {};

//------------------------------------------------------------------------------
proto = Subclass('Test.Base.Filter');

proto.xhr_get = function(url) {
    url = url.replace(/n+$/, '');
    return Test.Base.xhr_get(url);
}

