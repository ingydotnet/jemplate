use t::TestJemplate tests => 1;

filters { 'tt' => 'parse_lite' };
# no_diff;
run_is 'tt' => 'js';

__END__

=== CALL
--- tt
[% CALL xxx -%]
[% foo = bar -%]
[% CALL yyy.zzz -%]
--- js
//line 1 "(unknown template)"
stash.get('xxx');
//line 2 "(unknown template)"
stash.set('foo', stash.get('bar'));
//line 3 "(unknown template)"
stash.get(['yyy', 0, 'zzz', 0]);

