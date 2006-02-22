proto = Subclass('Test.Base', 'Test.Builder');
proto.constructor = function() { alert('che?') }

proto.filters = function() {}
proto.spec = function() {}
proto.run_is = function() {
    this.pass('cool');
}

proto.pass = function (name) {
    return Test.More.Test.ok(true, name);
};



