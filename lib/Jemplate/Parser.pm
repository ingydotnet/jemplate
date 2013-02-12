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

__END__

=encoding UTF-8

=head1 NAME

Jemplate::Parser - Jemplate Parser Subclass

=head1 SYNOPSIS

    use Jemplate::Parser;

=head1 DESCRIPTION

Jemplate::Parser is a simple subclass of Template::Parser. Not much
to see here.

=head1 AUTHOR

Ingy döt Net <ingy@cpan.org>

=head1 COPYRIGHT

Copyright (c) 2006-2008. Ingy döt Net. All rights reserved.

This program is free software; you can redistribute it and/or modify it
under the same terms as Perl itself.

See L<http://www.perl.com/perl/misc/Artistic.html>

=cut
