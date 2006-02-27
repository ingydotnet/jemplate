var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process',
    context: 'evaluate'
};

t.plan(5);
t.filters(filters);
t.spec('basics.t.js'); 
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

*/
