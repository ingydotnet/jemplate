var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(2);
t.filters(filters);
t.spec('filters.t.js'); 
t.run_is('jemplate', 'output');

/* Test
=== Test indent
--- jemplate
filters_indent.html
[% FILTER indent -%]
1
2
3
4
[%- END %]
#
[% FILTER indent(3) -%]
1
2
3
4
[%- END %]
#
[% FILTER indent('2') -%]
1
2
3
4
[%- END %]
#
[% FILTER indent(0) -%]
1
2
3
4
[%- END %]
#
[% text = 'The cat sat on the mat';
   text | indent('> ') | indent('+') %]
--- output
    1
    2
    3
    4
#
   1
   2
   3
   4
#
  1
  2
  3
  4
#
1
2
3
4
#
+> The cat sat on the mat
=== Test truncate
--- jemplate
filters_truncate.html
[% a = '1234567890' -%]
[% a | truncate(5)  %]
[% a | truncate(10) %]
[% a | truncate(15) %]
[% a | truncate(2)  %]
[% a = '1234567890123456789012345678901234567890' -%]
[% a | truncate  %]
--- output
12...
1234567...
1234567890
...
12345678901234567890123456789...

*/
