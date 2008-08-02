var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process',
    context: 'evaluate'
};

t.plan(2);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== INCLUDE should localize
--- context
{"thing":"foo"}
--- jemplate
localise1.html
[% thing %]
[% SET thing = 'bar' -%]
[% thing %]
[% INCLUDE myblock -%]
[% thing %]
[% BLOCK myblock -%]
[% SET thing = 'baz' -%]
[% END -%]
--- output
foo
bar
bar

=== PROCESS should not localize
--- context
{"thing":"foo"}
--- jemplate
localise2.html
[% thing %]
[% SET thing = 'bar' -%]
[% thing %]
[% PROCESS myblock -%]
[% thing %]
[% BLOCK myblock -%]
[% SET thing = 'baz' -%]
[% END -%]
--- output
foo
bar
baz

*/
