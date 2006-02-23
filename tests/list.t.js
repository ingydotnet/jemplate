var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(1);
t.filters(filters);
t.spec('list.t.js'); 
t.run_is('jemplate', 'output');

/* Test
=== Test list methods
--- jemplate: list.html
--- output
one - four

*/
