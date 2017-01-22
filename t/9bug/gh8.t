#!/usr/bin/env perl

use strict;
use warnings;

use Test::More;

use Jemplate;
my $jemplate = Jemplate->new;

my %warning_seen;
local $SIG{__WARN__} = sub {
    if ($_[0] =~ /Duplicate template or block name (b1|t2)/) {
        ++$warning_seen{$1};
    } else {
        die "Unexpected warning: @_";
    }
};

$jemplate->compile_template_content(
    '[% BLOCK b1 %] first [% END %]',
    't1',
);

$jemplate->compile_template_content(
    '[% BLOCK b1 %] duplicate block [% END %]',
    't2',
);

$jemplate->compile_template_content(
    '[% BLOCK b2 %] duplicate template [% END %]',
    't2',
);

is_deeply(
    \%warning_seen,
    { b1 => 1, t2 => 1 },
    'duplicate warning seen'
);

done_testing();
