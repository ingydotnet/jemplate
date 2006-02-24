var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(1);
t.filters(filters);
t.spec('list.t.js'); 
t.run_is('jemplate', 'output');

/* Test
=== Test list methods
--- jemplate: list.html
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

*/
