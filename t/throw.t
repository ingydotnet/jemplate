use t::TestJemplate tests => 1;

filters { 'tt' => 'parse_lite' };
run_is 'tt' => 'js';

__END__

=== THROW
--- tt
[% THROW severe "Something bad happened" -%]
--- js
//line 1 "(unknown template)"
throw(['severe', 'Something bad happened']);

