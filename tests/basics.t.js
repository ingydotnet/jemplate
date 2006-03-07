var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process',
    context: 'evaluate'
};

t.plan(6);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== Basic Substitution1
--- context
{"name":"Wally"}
--- jemplate
hello.html
Hello, [% name %]
--- output
Hello, Wally

=== Basic Substitution2
--- context
{"name":"Yann"}
--- jemplate: hello.html
--- output
Hello, Yann

=== Operator "=="
--- jemplate
operator1.html
[%- IF "abc" == "abc" -%]
same
[%- END %]
--- output
same

=== Operator "!="
--- jemplate
operator2.html
[%- IF "abc" != "def" -%]
not same
[%- END -%]

--- output
not same

=== Operator concat "+"
--- jemplate
operator3.html
[%- "abc" _ "def" -%]

--- output
abcdef

=== Array index fetch"
--- jemplate
basic_array1.html
[%- JAVASCRIPT -%]
stash.set( "simple_list", ["a","b","c"] );
stash.set( "mylist", [["a","b","c"],["d","e","f"],["h","i","j"]] );
[%- END -%]
a = [% simple_list.0 %]
a = [% mylist.0.0 %]
c = [% mylist.0.2 %]
e = [% mylist.1.1 %]
j = [% mylist.2.2 -%]

--- output
a = a
a = a
c = c
e = e
j = j

*/
