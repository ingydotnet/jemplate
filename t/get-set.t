use t::TestJemplate tests => 1;

filters { 'tt' => 'parse_lite' };
no_diff;
run_is 'tt' => 'js';

__END__

===
--- tt
[% food.barge -%]
--- js
//line 1 "(unknown template)"
output += stash.get(['food', 0, 'barge', 0]);

