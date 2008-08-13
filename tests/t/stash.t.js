var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process',
    context: 'evaluate',
    raw_context: 'raw_context'
};

t.plan(6);
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

=== Basic Global Scope Access
--- raw_context
{}
--- jemplate
global-scope-access.html
[% GLOBAL.global_foo %]
[% GLOBAL.global_object.str %]
[% GLOBAL.global_object.func_sum(1,1) %]
[% GLOBAL.global_multiply(1,10) %]
[% global_foo %]
[% 1 %]
[% global_object.str %]
[% global_object.func_sum(1,1) %]
[% global_multiply(1,10) %]
[% 1 %]
--- output
global_foo
global_object_foo
2
10

1



1

=== Advanced Global Scope Access
--- raw_context
{}
--- jemplate
global-scope-access2.html
[% 
	global_foo = '|local_foo'; #creates new local variable
	GLOBAL.global_foo;
	global_foo;
%]
[% 
	local_var = "foo"; #new variables are always local
	GLOBAL.local_var; #empty	
%]
[% 
	GLOBAL.new_global_var = "|foo"; #new global vars could be created only this way
	new_global_var; #empty
	GLOBAL.new_global_var;
	new_global_var = "|foo2";
	new_global_var; #not empty
	GLOBAL.new_global_var; 
%]
[% 
	GLOBAL.global_foo = "global_foo";
	LOCAL.global_foo = "|masked"; #masking global variable	
	GLOBAL.global_foo;
	global_foo; 
%]
--- output
global_foo|local_foo

|foo|foo2|foo
global_foo|masked

=== RAW directive
--- raw_context
{}
--- jemplate
global-scope-access3.html
[% 
	RAW global_foo;
	global_foo;
	RAW global_object;
	'\n';global_object.str;
	'\n';global_object.func_sum(1,1);
	RAW global_multiply;	
	'\n';global_multiply(1,10);
%]
[% 
	RAW global_object;
	global_object.str = 'new_str';
	'\n';global_object.str;	
%]
--- output
global_foo
global_object_foo
2
10

new_str

*/
