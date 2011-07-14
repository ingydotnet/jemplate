#!/usr/bin/env perl

use strict;
use warnings;

use Test::More;

plan qw/no_plan/;

system( $^X, 'jemplate' );

ok( ! $? );
