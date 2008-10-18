var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process',
    context: 'evaluate',
    raw_context: 'raw_context'
};

t.plan(7);
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
#1
[% GLOBAL.global_foo %]
#2
[% GLOBAL.global_object.str %]
#3
[% GLOBAL.global_object.func_sum(1,1) %]
#4
[% GLOBAL.global_multiply(1,10) %]
#5
[% global_foo %]
#6
[% global_object.str %]
#7
[% global_object.func_sum(1,1) %]
#8
[% global_multiply(1,10) %]
eof
--- output
#1
global_foo
#2
global_object_str
#3
2
#4
10
#5

#6

#7

#8

eof

=== Advanced Global Scope Access
--- raw_context
{}
--- jemplate
global-scope-access2.html
#1
[% 
	global_foo = 'local_foo'; #creates local variable
	GLOBAL.global_foo;
%]
#2
[% global_foo %]
#3
[% 
	local_var = "foo"; #new variables are always local
	GLOBAL.local_var; #empty	
%]
#4
[% 
	GLOBAL.new_global_var = "new_global_var"; #new global vars could be created only this way
	new_global_var; #empty
%]
#5
[% GLOBAL.new_global_var; %]
#6
[%
	new_global_var = "local_value";
	new_global_var; #not empty
%]
#7
[% GLOBAL.new_global_var; %]
#8
[% 
	global_foo = "global_foo2";
	global_foo;
%]
#9
[%
	LOCAL.global_foo = "masked"; #LOCAL access	
	global_foo; 
%]
--- output
#1
global_foo
#2
local_foo
#3

#4

#5
new_global_var
#6
local_value
#7
new_global_var
#8
global_foo2
#9
masked

=== RAW directive
--- raw_context
{}
--- jemplate
global-scope-access3.html
#1
[%
	RAW global_foo;
	global_foo;
%]
#2
[%
	RAW global_object;
	global_object.str;
%]
#3
[% global_object.func_sum(1,1); %]
#4
[%
	RAW global_multiply;	
	global_multiply(1,10);
%]
#5
[%
	global_object.str = 'new_str';
	GLOBAL.global_object.str;	
%]
--- output
#1
global_foo
#2
global_object_str
#3
2
#4
10
#5
new_str

=== Function property access
--- raw_context
{}
--- jemplate
global-scope-access4.html
#1
[%
	#RAW global_multiply;	
	#global_multiply.function_property;
	'function_property';
%]
--- output
#1
function_property

*/
