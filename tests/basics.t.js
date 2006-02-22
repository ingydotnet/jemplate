var t = new Test.Jemplate();

var filters = {jemplate: 'jemplate_process'};

t.plan(1);
t.filters(filters);
t.spec('basics.t.js'); 
t.run_is('jemplate', 'output');

/* Test
=== Basic Substitution1
--- jemplate: hello.html
--- data
{name: Wally}
--- output
Hello, Wally

=== Basic Substitution2
--- jemplate: hello.html
--- data
{name: Wally}
--- output
Hello, Wally

*/
