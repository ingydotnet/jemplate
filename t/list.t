use t::TestJemplate tests => 3;

run_is command => 'output';

__DATA__
=== Listing using directory
--- command eval_stdout
Jemplate->main('--list', 't/list/');
--- output
bar/one
bar/two
foo/one
foo/two
one
three
two

=== Listing using files
--- command eval_stdout
Jemplate->main('--list', 't/list/foo/one', 't/list/two');
--- output
one
two

=== Listing using directories and files
--- command eval_stdout
Jemplate->main('--list', 't/list/foo', 't/list/three');
--- output
one
two
three

