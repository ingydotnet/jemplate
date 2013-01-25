
var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(6);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== Test loop.index
--- jemplate
loop1.html
[%- FOR i IN [0,1,2,3] -%]
[%- i -%]:[%- loop.index %]
[% END -%]
--- output
0:0
1:1
2:2
3:3

=== Test loop.first && loop.last
--- jemplate
loop2.html
[%- FOR i IN [0,1,2,3] -%]
    [%- IF loop.first -%]
[start]
    [%- END -%]
    [%- i -%]
    [%- IF loop.last -%]
[end]
    [%- END -%]
[%- END %]
--- output
[start]0123[end]

=== Test loop.count
--- jemplate
loop3.html
[%- FOR i IN [0,1,2,3] -%]
    [%- i -%]:[%-loop.count%]
[% END -%]
--- output
0:1
1:2
2:3
3:4

=== Test loop.size && loop.max
--- jemplate
loop4.html
[%- FOR i IN [0,1,2,3] -%]
    [%- i -%]:[%-loop.size%]:[%-loop.max%]
[% END -%]
--- output
0:4:3
1:4:3
2:4:3
3:4:3

=== Test loop.prev && loop.next
--- jemplate
loop5.html
[%- FOR i IN [0,1,2,3] -%]
    [%- i -%]:[%-loop.prev%]:[%-loop.next%]
[% END -%]
[%- FOR i IN {a => 0, b => 1, c => 3, d => 4 } -%]
    [%- i -%]:[%-loop.prev%]:[%-loop.next%]
[% END -%]
--- output
0::1
1:0:2
2:1:3
3:2:
a::b
b:a:c
c:b:d
d:c:

=== Test range operator
--- jemplate
loop3.html
[%- FOR i IN [0 .. 3] -%]
    [%- i -%]:[%-loop.count%]
[% END -%]
--- output
0:1
1:2
2:3
3:4

*/
