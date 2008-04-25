proto = new Subclass('Test.Jemplate', 'Test.Base');

proto.init = function() {
    Test.Base.prototype.init.call(this);
    this.block_class = 'Test.Jemplate.Block';
}

proto = Subclass('Test.Jemplate.Block', 'Test.Base.Block');

proto.init = function() {
    Test.Base.Block.prototype.init.call(this);
    this.filter_object = new Test.Jemplate.Filter();
}

proto = new Subclass('Test.Jemplate.Filter', 'Test.Base.Filter');

proto.jemplate_process = function(content, block) {
    var template;
    if (content.match(/\n/))
        template = content.split(/\n/)[0];
    else
        template = content;

    var j = new Jemplate();
    var data = block.data.context;
    var result = Jemplate.process(template, data);
    return result;
}

proto.raw_context = function( content, block ) {
    try {
        var context = eval("("+content+")");
        block.data.context = context;
    } catch(e) {
        alert(e);
    }
}
