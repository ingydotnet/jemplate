package Jemplate::Parser;
use strict;
use warnings;
use base 'Template::Parser';

use Jemplate::Directive;

sub new {
    my $class = shift;
    $class->SUPER::new(
        FACTORY => 'Jemplate::Directive',
        @_,
    );
}

1;
