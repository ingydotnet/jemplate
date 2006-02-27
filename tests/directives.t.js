var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(1);
t.filters(filters);
t.spec('directives.t.js'); 
t.run_is('jemplate', 'output');

/* Test
=== Test join
--- jemplate
directives1.html
[% BLOCK foo %]
I <3 Sushi
[% END %]
[% SET list = [3, 4, 5] %]
[% FOR i = list %]
[% PROCESS foo %]
[% END %]
--- output
foo::bar::baz
*/
