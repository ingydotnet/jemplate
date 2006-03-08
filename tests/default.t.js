var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process',
    context: 'evaluate'
};

t.plan(1);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== DEFAULT directive works
--- context
{"foo":"one"}
--- jemplate
default.html
[% DEFAULT foo = 'two', bar = 'three' -%]
[% DEFAULT bar = 'four' -%]
[% foo %] | [% bar %]
--- output
one | three

*/
