var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(1);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== Test plugins
--- jemplate
plugins_basic.html
[% USE dummy -%]
[% dummy.simple %]
#
[% dummy.params('one', 'two') %]
#
--- output
This text came from the plugin
#
params: one, two
#

*/
