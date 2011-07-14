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
[% BLOCK t1 %]
[% a.b.c = 1 %]
[% a.b.c %]
[% END %]
_END_

test_js_eval( Jemplate::Runtime->kernel );
test_js_eval( join "\n", @js, "1;" );
test_js <<'_END_';
result = Jemplate.process( 't1', {} )
areEqual( result, 1 );
_END_
