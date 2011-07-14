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
[% BLOCK t1 %][% apple.slice( 0, 2 ).join(' - ') %][% END %]
[% BLOCK t2 %][% apple.slice( -3, -1 ).join(' - ') %][% END %]
[% BLOCK t3 %][% apple.slice( -3, -2 ).join(' - ') %][% END %]
[% BLOCK t4 %][% apple.slice( 3, -2 ).join(' - ') %][% END %]
[% BLOCK t5 %][% apple.slice( 3, -1 ).join(' - ') %][% END %]
_END_

test_js_eval( Jemplate::Runtime->kernel );
test_js_eval( join "\n", @js, "1;" );
test_js <<'_END_';
var result
var apple = [ 1, 2, 3, 4, 5, 6, 7 ]

result = Jemplate.process( 't1', { apple: apple } )
areEqual( result, "1 - 2 - 3" );

result = Jemplate.process( 't2', { apple: apple } )
areEqual( result, "5 - 6 - 7" );

result = Jemplate.process( 't3', { apple: apple } )
areEqual( result, "5 - 6" );

result = Jemplate.process( 't4', { apple: apple } )
areEqual( result, "4 - 5 - 6" );

result = Jemplate.process( 't5', { apple: apple } )
areEqual( result, "4 - 5 - 6 - 7" );
_END_

