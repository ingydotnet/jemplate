var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process',
    context: 'evaluate'
};

t.plan(1);
t.filters(filters);
t.spec('basics.t.js'); 
t.run_is('jemplate', 'output');

/* Test
=== Basic Substitution1
--- context
{"name":"Wally"}
--- jemplate: hello.html
--- output
Hello, Wally

=== Basic Substitution2
--- context
{"name":"Yann"}
--- jemplate: hello.html
--- output
Hello, Yann

*/
