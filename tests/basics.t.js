var test = new Test.Jemplate();
test.plan({tests: 2});
test.filters({jemplate: 'process'});
test.spec('basics.t.js'); 
test.run_is('jemplate', 'output');

function process(block, template) {
    var j = new Jemplate();
    var data = block.data;
    return j.process(template, data);
}

/* Test.Base

=== Basic Substitution
Hello, [% name %]
--- jemplate: hello.html
--- data
name: Wally
--- output
Hello, Wally


*/
