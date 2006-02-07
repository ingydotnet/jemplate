use t::TestJemplate tests => 2;

filters { 'tt' => 'parse_lite' };
no_diff;
run_is 'tt' => 'js';

__END__

=== IF
--- tt
[% IF foo == 'bar' %]
Foo Bar
[% END %]
--- js
//line 3 "(unknown template)"
if (stash.get('foo') == 'bar') {
output += '\nFoo Bar\n';
}

output += '\n';

=== IF/ELSE
--- tt
[% IF num % 2 -%]
This is odd!
[% ELSE -%]
Now we are even!
[% END -%]
--- js
//line 5 "(unknown template)"
if (stash.get('num') % 2) {
output += 'This is odd!\n';
}
else {
output += 'Now we are even!\n';
}

=== IF/ELSIF

=== IF/ELSIF/ELSE
