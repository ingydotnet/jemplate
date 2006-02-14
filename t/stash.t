use t::TestJemplate tests => 1;

filters { 'tt' => 'parse_lite' };
no_diff;
run_is 'tt' => 'js';

__END__

=== Stash Access Permutations
--- tt
[% CALL foo -%]
[% CALL foo.bar -%]
[% CALL foo.bar('baz') -%]
[% CALL foo.bar(baz.quux) -%]
[% CALL foo('bar').baz(quux.fox) -%]
[% foo.bar = baz.quux -%]

--- js
//line 1 "(unknown template)"
stash.get('foo');
//line 2 "(unknown template)"
stash.get(['foo', 0, 'bar', 0]);
//line 3 "(unknown template)"
stash.get(['foo', 0, 'bar', [ 'baz' ]]);
//line 4 "(unknown template)"
stash.get(['foo', 0, 'bar', [ stash.get(['baz', 0, 'quux', 0]) ]]);
//line 5 "(unknown template)"
stash.get(['foo', [ 'bar' ], 'baz', [ stash.get(['quux', 0, 'fox', 0]) ]]);
//line 6 "(unknown template)"
stash.set(['foo', 0, 'bar', 0], stash.get(['baz', 0, 'quux', 0]));

