var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process',
    context: 'evaluate',
    raw_context: 'raw_context'
};

t.plan(4);
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

=== Stashed Function
--- raw_context
{ hash: { 
    noarg: function() { return "noarg" },
    arg:   function(arg) { return "arg: " + arg }
} }
--- jemplate
stash-functions3.html
[% hash.noarg %]
[% hash.noarg() %]
[% hash.arg("abc") %]
--- output
noarg
noarg
arg: abc

=== Global Scope Access
--- raw_context
{}
--- jemplate
global-scope-access.html
[% global_foo %]
[% global_object.str %]
[% global_object.func_sum(1,1) %]
[% global_multiply(1,10) %]
[% JEMPLATE_GLOBAL.global_foo %]
[% JEMPLATE_GLOBAL.global_object.str %]
[% JEMPLATE_GLOBAL.global_object.func_sum(1,1) %]
[% JEMPLATE_GLOBAL.global_multiply(1,10) %]
[% 
	global_foo = 'local_foo'; #defaults to read-only access level, creates new local "global_foo"
	global_foo;'\n';
	JEMPLATE_GLOBAL.global_foo
 %]
--- output
global_foo
global_object_foo
2
10
global_foo
global_object_foo
2
10
local_foo
global_foo

*/
