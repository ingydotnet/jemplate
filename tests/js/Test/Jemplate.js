(function() {

var proto = Test.Base.newSubclass('Test.Jemplate');

proto = Test.Jemplate.Filter.prototype;

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

})();
