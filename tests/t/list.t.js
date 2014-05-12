var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(2);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== Test list methods
--- jemplate
list.html
[% SET a1 = [ 'one', 'two', 'three'] -%]
[% CALL a1.push('four') -%]
[%- a1.first() %] - [% a1.last() %]
[% a1.grep('o').join('/') %]
[% a1.max() %]+[% a1.size() %]
[% SET a2 = a1.reverse -%]
[% a2.join('^') %]
[% a2.slice(1, 2).join('*') %]
[% SET a3 = [ 5, 9, 'x', 17, 9, 33, 12, 'x', 5] -%]
[% a3.unique().join(',') %]
[% a1.unshift('zero').sort().join('!') %]
[% CALL a1.shift(); CALL a1.pop(); a1.join('_') %]
[% CALL a3.splice(2,1); CALL a3.splice(-2,1); a3.nsort.join('~') %]
[% SET a4 = [11, 22, 33] -%]
[% SET a5 = [44, 55, 66] -%]
[% SET a6 = [77, 88, 99] -%]
[% SET a7 = a4.merge(a5, 'foo', a6) -%]
[% a7.join("'") %]
--- output
one - four
one/two/four
3+4
four^three^two^one
three*two
5,9,x,17,33,12
four!one!three!two!zero
one_three_two
5~5~9~9~12~17~33
11'22'33'44'55'66'foo'77'88'99
=== Test sort of hash
--- jemplate
list_of_hash.html
[% SET ll = [ {'a' => 9}, {'a' =>  1}, {'a' => 3} ] -%]
[%- FOR hash = ll.sort('a') -%]
[%- hash.a -%]:
[%- END -%]
--- output
1:3:9:
*/
