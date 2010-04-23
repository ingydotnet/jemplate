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
[% BLOCK t1 %][% list = [ 1 .. 10 ] %][% list.join(', ') %][% END %]
[% BLOCK t2 %][% FOREACH ii = [ 1 .. 4 ] %][% ii %] [% END %][% END %]
[% BLOCK t3 %][% FOREACH ii = [ -1 .. -4 ] %][% ii %] [% END %][% END %]
[% BLOCK t4 %][% FOREACH ii = [ -4 .. -1 ] %][% ii %] [% END %][% END %]
_END_

eval {
$jemplate->compile_template_content( <<_END_, 't0' );
[% BLOCK t1 %][% broken = [ 1 .. end ] %][% list.join(', ') %][% END %]
_END_
};
like $@, qr{Range expansion is current supported for positive/negative integer values only};

test_js_eval( Jemplate::Runtime->kernel );
test_js_eval( join "\n", @js, "1;" );
test_js <<'_END_';
var result

result = Jemplate.process( 't1', { } )
areEqual( result, "1, 2, 3, 4, 5, 6, 7, 8, 9, 10" );

result = Jemplate.process( 't2', { } )
areEqual( result, "1 2 3 4 " );

result = Jemplate.process( 't3', { } )
areEqual( result, "" );

result = Jemplate.process( 't4', { } )
areEqual( result, "-4 -3 -2 -1 " );
_END_
