var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(10);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== Test chunk method
--- jemplate
string_chunk.html
[% SET a = '1234567890' -%]
[% a.chunk.join(' ') %]
[% a.chunk(2).join(' ') %]
[% a.chunk(3).join(' ') %]
[% a.chunk(9).join(' ') %]
[% a.chunk(10).join(' ') %]
[% a.chunk(-1).join(' ') %]
[% a.chunk(-2).join(' ') %]
[% a.chunk(-3).join(' ') %]
[% a.chunk(-9).join(' ') %]
[% a.chunk(-10).join(' ') %]
--- output
1 2 3 4 5 6 7 8 9 0
12 34 56 78 90
123 456 789 0
123456789 0
1234567890
1 2 3 4 5 6 7 8 9 0
12 34 56 78 90
1 234 567 890
1 234567890
1234567890

=== Test defined method
--- jemplate
string_defined.html
[% SET a = '1' -%]
[% a.defined ? '1' : '0' %]
--- output
1

=== Test hash method
--- jemplate
string_hash.html
[% SET a = 'Hi' -%]
[% a.hash.value %]
--- output
Hi

=== Test list method
--- jemplate
string_list.html
[% SET a = 'Hi' -%]
[% a.list.0 %]
--- output
Hi

=== Test match method
--- jemplate
string_match.html
[% SET a = 'aaa12aaa34aaa56' -%]
[% a.match('\\\d\\\d','g').join(' ') %]
--- output
12 34 56

=== Test repeat method
--- jemplate
string_repeat.html
[% SET a = 'aaa' -%]
[% a.repeat(3) %]
[% a.repeat() %]
--- output
aaaaaaaaa
aaa

=== Test replace method
--- jemplate
string_replace.html
[% SET a = 'aaa12aaa34aaa56' -%]
[% a.replace('\\\d\\\d', 'bb', 'g') %]
[% a.replace('\\\d\\\d', '', 'g') %]
--- output
aaabbaaabbaaabb
aaaaaaaaa

=== Test search method
--- jemplate
string_search.html
[% SET a = 'aaa12aaa34aaa56' -%]
[% a.search('\\\d\\\d') ? 1 : 0 %]
[% a.search('w') ? 1 : 0 %]
--- output
1
0

=== Test size method
--- jemplate
string_size.html
[% SET a = '1' -%]
[% a.defined ? '1' : '0' %]
--- output
1

=== Test split method
--- jemplate
string_split.html
[% SET a = 'aaa12aaa34aaa' -%]
[% a.split('\\\d\\\d').join(' ') %]
[% SET a = '1aaa2aaa3aaa4' -%]
[% a.split('aaa').join(' ') %]
--- output
aaa aaa aaa
1 2 3 4

*/

/*
=== Test length method
--- jemplate
string_length.html
[% SET a = 'Hi' -%]
[% a.length %]
[% SET a = 10 -%]
[% a.length %]
--- output
2

*/
