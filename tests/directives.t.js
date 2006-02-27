
var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(4);
t.filters(filters);
t.spec('directives.t.js'); 
t.run_is('jemplate', 'output');

/* Test
=== Test BLOCK/SET/FOR/PROCESS
--- jemplate
directives1.html
[% BLOCK foo -%]
I <3 Sushi
[% END -%]
[% SET list = [3, 4, 5] -%]
[% FOR i = list -%]
[% PROCESS foo -%]
[% END -%]
--- output
I <3 Sushi
I <3 Sushi
I <3 Sushi

=== Test WHILE/IF/ELSE
--- jemplate
directives2.html
[% SET num = 4 -%]
[% array = [] -%]
[% WHILE num < 7 -%]
[% IF num % 2 %][% CALL array.push('Odd') %][% ELSE %][% CALL array.push('Even') %][% END -%]
[% num = num + 1 -%]
[% END -%]
[% array.join('***') %]
--- output
Even***Odd***Even

=== Test JAVASCRIPT
--- jemplate
directives3.html
[%- JAVASCRIPT -%]
stash.set("obj", {"key1": "val1", "key2": "val2"});
[%- END -%]
Key1: [% obj.key1 %]
Key2: [% obj.key2 %]
--- output
Key1: val1
Key2: val2

=== Test FOR i IN obj
--- jemplate
directives4.html
[%- JAVASCRIPT -%]
stash.set("obj", {"key1": "val1", "key2": "val2"});
[%- END -%]
[%- FOR key IN obj -%]
[% key %]: [% obj.$key %]
[% END -%]
--- output
key1: val1
key2: val2

*/
