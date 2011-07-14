use Test::More;

BEGIN {
    plan skip_all => "JavaScript::V8x::TestMoreish not available" unless eval { require JavaScript::V8x::TestMoreish };
}

plan qw/no_plan/;

use Jemplate;
use Jemplate::Runtime;

use JavaScript::V8x::TestMoreish;

my $jemplate = Jemplate->new;
my @templates;
push @templates, $jemplate->compile_template_content( <<_END_, 't0' );
Hello, World.
_END_
push @templates, $jemplate->compile_template_content( <<_END_, 't1' );
[% FOREACH pair = hash.pairs %]
[% pair.key %] = [% pair.value %]
[% END %]
_END_
push @templates, $jemplate->compile_template_content( <<_END_, 't2' );
[% FOREACH key = hash.keys %]
[% key %] = [% hash.\$key %]
[% END %]
_END_

test_js_eval( Jemplate::Runtime->kernel );
test_js_eval( join "\n", @templates, "1;" );

test_js <<'_END_';
result = Jemplate.process( 't1', { hash: { c: 1, a: 2, b: 3 } } );
like( result, /a = 2\s+b = 3\s+c = 1/ )
_END_

1;
