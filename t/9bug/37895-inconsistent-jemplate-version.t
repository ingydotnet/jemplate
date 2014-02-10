#!/usr/bin/env perl

use strict;
use warnings;

use Test::More;

plan qw/no_plan/;

$ENV{PERL5LIB} = join ':', @INC;

system( $^X, 'jemplate' );

ok( ! $? );
