var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process',
    context: 'evaluate'
};

t.plan(2);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== Both .keys and .keys() works
--- context
{"hash":{"foo":"FOO","bar":"BAR"}}
--- jemplate
stash-functions1.html
[% hash.keys.sort.join('+') %]
[% hash.keys().sort().join('+') %]
--- output
bar+foo
bar+foo

=== Disambiguatation of .keys and .keys()
--- context
{"hash":{"keys":"foo","values":"bar"}}
--- jemplate
stash-functions2.html
[% hash.keys %]
[% hash.keys().join('+') %]
--- output
foo
keys+values

*/
