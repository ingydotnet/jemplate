proto = new Subclass('Test.Jemplate', 'Test.Base');


proto = new Subclass('Test.Jemplate.Filter', 'Test.Base.Filter');

proto.jemplate_process = function(block, template) {
    var j = new Jemplate();
    var data = block.data();
    return j.process(template, data);
}

