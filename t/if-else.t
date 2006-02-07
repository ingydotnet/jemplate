use t::TestJemplate tests => 1;

filters { 'tt' => 'parse_lite' };
no_diff;
run_is 'tt' => 'js';

__END__

=== PROCESS with no args
--- tt
Top
[% PROCESS middle.tt %]
Bottom
--- js
output += 'Top\n';
//line 2 "(unknown template)"
output += context.process('middle.tt');
output += '\nBottom\n';

