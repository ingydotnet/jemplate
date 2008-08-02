var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process',
    context: 'evaluate'
};

t.plan(1);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== Setting a value into a hash works
--- jemplate
test.html
[% testhash = {} -%]
[% testkey = 'bob' -%]
[% testhash.$testkey = 'bozo' -%]
Value: [% testhash.$testkey %]<br />
--- output
Value: bozo<br />

*/
