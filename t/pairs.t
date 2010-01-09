use Test::More;

BEGIN {
    plan skip_all => "JavaScript::V8x::TestMoreish not available" unless eval { require JavaScript::V8x::TestMoreish };
}

plan qw/no_plan/;

use JavaScript::V8x::TestMoreish;

test_js_eval <<'_END_';
diag( "Yoink!" );
_END_

test_js <<'_END_';
areEqual( 1, 1 )
_END_

1;
