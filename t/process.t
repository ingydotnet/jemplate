use t::TestJemplate tests => 2;

filters { 'tt' => 'parse_lite' };
# no_diff;
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

=== PROCESS with args
--- tt
Top
[% PROCESS middle.tt foo = 'xxx', bar = [1, 2] %]
Bottom
--- js
output += 'Top\n';
//line 2 "(unknown template)"
output += context.process('middle.tt', { 'foo': 'xxx', 'bar': [ 1, 2 ] });
output += '\nBottom\n';

