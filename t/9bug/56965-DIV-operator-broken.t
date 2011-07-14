#!/usr/bin/env perl

use strict;
use warnings;

use Test::More;

BEGIN {
    plan skip_all => "JavaScript::V8x::TestMoreish not available" unless eval { require JavaScript::V8x::TestMoreish };
}

plan qw/no_plan/;

use Jemplate;
use Jemplate::Runtime;

use JavaScript::V8x::TestMoreish;

my $jemplate = Jemplate->new;
my @js;

push @js, $jemplate->compile_template_content( <<_END_, 't0' );
[% BLOCK t1 %][% 3 DIV 2 %][% END %]
[% BLOCK t2 %][% 4 DIV 2 %][% END %]
[% BLOCK t3 %][% 5 DIV 2 %][% END %]
_END_

test_js_eval( Jemplate::Runtime->kernel );
test_js_eval( join "\n", @js, "1;" );
test_js <<'_END_';

areEqual( Jemplate.process( 't1' ), 1 );
areEqual( Jemplate.process( 't2' ), 2 );
areEqual( Jemplate.process( 't3' ), 2 );

_END_
