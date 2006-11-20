use t::TestJemplate tests => 3;

run_is command => 'output';

__DATA__
=== Listing using directory
--- command eval_stdout
Jemplate->main('--list', 't/list/');
--- output
t/list/one => one
t/list/three => three
t/list/two => two
t/list/bar/one => bar/one
t/list/bar/two => bar/two
t/list/foo/one => foo/one
t/list/foo/two => foo/two

=== Listing using files
--- command eval_stdout
Jemplate->main('--list', 't/list/foo/one', 't/list/two');
--- output
t/list/foo/one => one
t/list/two => two

=== Listing using directories and files
--- command eval_stdout
Jemplate->main('--list', 't/list/foo', 't/list/three');
--- output
t/list/foo/one => one
t/list/foo/two => two
t/list/three => three

