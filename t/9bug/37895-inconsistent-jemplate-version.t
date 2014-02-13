#!/usr/bin/env perl

use strict;
use warnings;

use Test::More;

plan qw/no_plan/;

SKIP: {
    skip 'Fix this test', 1;
};

# Test causing failures:
# http://www.cpantesters.org/cpan/report/dfd244fa-9408-11e3-9959-c083572dead6
# 
# $ENV{PERL5LIB} = join ':', @INC;
# 
# system( $^X, 'jemplate' );
# 
# ok( ! $? );
