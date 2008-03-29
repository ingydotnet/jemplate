package Jemplate::Runtime;
use strict;
use warnings;

sub main {
    <<'...';
[% INCLUDE Jemplate.js -%]
...
}

sub xxx {
    <<'...';
[% INCLUDE Jemplate/XXX.js -%]
...
}

sub ajax {
    <<'...';
[% INCLUDE Jemplate/Ajax.js -%]
...
}

sub json {
    <<'...';
[% INCLUDE Jemplate/JSON.js -%]
...
}

1;

=head1 NAME

Jemplate::Runtime - Perl Module containing the Jemplate JavaScript Runtime

=head1 SYNOPSIS

    use Jemplate::Runtime;
    print Jemplate::Runtime->main;

=head1 DESCRIPTION

This module is auto-generated and used internally by Jemplate. It
contains subroutines that simply return various parts of the Jemplate
JavaScript Runtime code.

=head1 COPYRIGHT

Copyright (c) 2008. Ingy döt Net.

This program is free software; you can redistribute it and/or modify it
under the same terms as Perl itself.

See L<http://www.perl.com/perl/misc/Artistic.html>

=cut
