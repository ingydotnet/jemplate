var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(1);
t.filters(filters);
t.spec('join.t.js'); 
t.run_is('jemplate', 'output');

/* Test
=== Test join
--- jemplate: join.html
--- output
foo::bar::baz
*/
