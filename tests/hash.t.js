var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

t.plan(9);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== Test each method
--- jemplate
hash_each.html
[%# This is a bit convoluted because sort order can not be guaranteed -%]
[%# please fix it if you can find a better way... -%]
[%# There are a few other tests below that are very similar -%]
[% SET hash = { a=1 b=2 c=3 };
   SET list = hash.each;
   FOR kindex IN [0,2,4];
     SET vindex = kindex + 1;
     SET key = list.${kindex};
     SET value = list.${vindex};
     (key AND hash.${key} == value) ? 1 : 0;
   END %]
--- output
111

=== Test exists method
--- jemplate
hash_exists.html
[% SET a = { a=1 b=2 c=3 } -%]
[% a.exists('b') ? 1 : 0 %]
[% a.exists('z') ? 1 : 0 %]
--- output
1
0

=== Test import method TODO
--- jemplate
hash_import.html
[%# SET a = { a=1 b=2 c=3 } -%]
[%# CALL a.import({ a=2 b=1 d=4 e=5 }) -%]
[%# a.exists('c') ? 1 : 0 %]1
[%# a.exists('d') ? 1 : 0 %]1
[%# a.a %]2
[%# a.e %]5
--- output
1
1
2
5

=== Test keys method
--- jemplate
hash_keys.html
[% SET a = { a=1 b=2 c=3 } -%]
[% a.keys.sort.join(' ') %]
--- output
a b c

=== Test list method
--- jemplate
hash_list.html
[% SET hash = { a=1 b=2 c=3 } -%]
[% hash.list('keys').sort.join(' ') %]
[% hash.list('values').sort.join(' ') %]
[% SET list = hash.list('each');
   FOR kindex IN [0,2,4];
     SET vindex = kindex + 1;
     SET key = list.${kindex};
     SET value = list.${vindex};
     (key AND hash.${key} == value) ? 1 : 0;
   END %]
[% SET list = hash.list();
   FOR entry IN list;
     SET key = entry.key;
     SET value = entry.value;
     (hash.${key} == value) ? 1 : 0;
   END %]
--- output
a b c
1 2 3
111
111

=== Test nsort method
--- jemplate
hash_nsort.html
[% SET a = { '499'='c' '5'='a' '50'='b' } -%]
[% a.nsort.join(' ') %]
--- output
5 50 499

=== Test size method
--- jemplate
hash_size.html
[% SET a = { a=1 b=2 c=3 } -%]
[% a.size %]
--- output
3

=== Test sort method
--- jemplate
hash_sort.html
[% SET a = { ac=1 b=2 aa=3 } -%]
[% a.sort.join(' ') %]
--- output
aa ac b

=== Test values method
--- jemplate
hash_values.html
[% SET a = { a=1 b=2 c=3 } -%]
[% a.values.nsort.join(' ') %]
--- output
1 2 3

*/
