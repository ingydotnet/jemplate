proto = new Subclass('Test.Jemplate', 'Test.Base');


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
