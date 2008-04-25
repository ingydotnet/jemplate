var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(1);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== Test join
--- jemplate
join.html
[% a = ['foo', 'bar', 'baz'] %]
[%- a.join('::') -%]
--- output
foo::bar::baz
*/
