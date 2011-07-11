use t::TestJemplate tests => 5;

filters { 'tt' => 'parse_lite' };
run_is 'tt' => 'js';

__END__

=== First test
--- tt
[% IF foo.bar.baz %]Foo[% END -%]
--- js
//line 1 "(unknown template)"
if (stash.get(['foo', 0, 'bar', 0, 'baz', 0])) {
output += 'Foo';
}

=== Second test
--- tt
[% UNLESS foo %]Foo[% END -%]
--- js
//line 1 "(unknown template)"
if ((stash.get('foo')) == false) {
output += 'Foo';
}

===
--- tt
[% IF foo OR bar %]Foo[% END -%]
--- js
//line 1 "(unknown template)"
if (stash.get('foo') || stash.get('bar')) {
output += 'Foo';
}

===
--- tt
[% IF foo AND bar %]Foo[% END -%]
--- js
//line 1 "(unknown template)"
if (stash.get('foo') && stash.get('bar')) {
output += 'Foo';
}

===
--- tt
[% SET foo = bar UNLESS baz -%]
--- js
//line 1 "(unknown template)"
if ((stash.get('baz')) == false) {
stash.set('foo', stash.get('bar'));
}

