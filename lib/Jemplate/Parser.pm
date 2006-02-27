package Jemplate::Parser;
use strict;
use warnings;
use base 'Template::Parser';

use Jemplate::Grammar;
use Jemplate::Directive;

sub new {
    my $class = shift;
    my $parser = $class->SUPER::new(
        GRAMMAR => Jemplate::Grammar->new(),
        FACTORY => 'Jemplate::Directive',
        @_,
    );
    
    # flags passed from Jemplate object
    my %args = @_;

    # eval-javascript is default "on"
    $parser->{EVAL_JAVASCRIPT} = exists $args{EVAL_JAVASCRIPT}
      ? $args{EVAL_JAVASCRIPT} : 1;
    
    # tie the parser state-variable to the global Directive var
    $parser->{INJAVASCRIPT} = \$Jemplate::Directive::INJAVASCRIPT;

    return $parser;
}

1;
