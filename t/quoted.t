use t::TestJemplate tests => 2;

filters {
    'tt' => 'compile_lite',
};
run_is 'tt' => 'js';

__END__

=== test for "quoted" strings
--- tt
[% SET foo = "foo"; bar = "bar" %]
[% "$foo/$bar" %]
--- js
//line 1 "test_template"
stash.set('foo', 'foo');
//line 1 "test_template"
stash.set('bar', 'bar');
output += '\n';
//line 1 "test_template"
output += stash.get('foo') + '/' + stash.get('bar');
output += '\n';

=== simple string
--- tt
[% "simple" %]
--- js
//line 1 "test_template"
output += 'simple';
output += '\n';
