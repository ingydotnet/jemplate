var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(1);
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
[% FILTER indent('a') -%]
1
2
3
4
[%- END -%]
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
*/
