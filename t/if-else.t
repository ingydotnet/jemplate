use t::TestJemplate tests => 1;

filters { 'tt' => 'parse_lite' };
run_is 'tt' => 'js';

__END__

=== TT Comments
--- tt
[%# foo.bar %]
[% foo.baz %]
--- js
output += '\n';
//line 2 "(unknown template)"
output += stash.get(['foo', 0, 'baz', 0]);
output += '\n';

