package Jemplate::Runtime::Compact;
use strict;
use warnings;

sub main { return &kernel }
sub kernel {
    <<'...';
[% INCLUDE "js/kernel.compact.js" %]
...
}

sub ajax_jquery {
    <<'...';
[% INCLUDE "js/ajax-jquery.compact.js" %]
...
}

sub ajax_xhr {
    <<'...';
[% INCLUDE "js/ajax-xhr.compact.js" %]
...
}

sub ajax_yui {
    <<'...';
[% INCLUDE "js/ajax-yui.compact.js" %]
...
}

sub json_json2 {
    <<'...';
[% INCLUDE "js/json-json2.compact.js" %]
...
}

sub json_json2_internal {
    <<'...';
;(function(){

var JSON;

[% INCLUDE "js/json2.compact.js" %]

[% INCLUDE "js/json-json2-internal.compact.js" %]

}());
...
}

sub json_yui {
    <<'...';
[% INCLUDE "js/json-yui.compact.js" %]
...
}

sub json2 {
    <<'...';
[% INCLUDE "js/json2.compact.js" %]
...
}

sub xhr_gregory {
    <<'...';
[% INCLUDE "js/xhr-gregory.compact.js" %]
...
}

sub xhr_ilinsky {
    <<'...';
[% INCLUDE "js/xhr-ilinsky.compact.js" %]
...
}

sub xxx {
    <<'...';
[% INCLUDE "js/xxx.compact.js" %]
...
}

1;

__END__

=encoding UTF-8

=head1 NAME

Jemplate::Runtime - Perl Module containing the Jemplate JavaScript Runtime

=head1 SYNOPSIS

    use Jemplate::Runtime;
    print Jemplate::Runtime->main;

=head1 DESCRIPTION

This module is auto-generated and used internally by Jemplate. It
contains subroutines that simply return various parts of the Jemplate
JavaScript Runtime code.

=head1 METHODS

head2 kernel

head2 ajax_jquery

head2 ajax_xhr

head2 ajax_yui

head2 json_json2

head2 json_yui

head2 json2

head2 xhr_gregory

head2 xhr_ilinsky

head2 xxx

=head1 COPYRIGHT

Copyright (c) 2008. Ingy döt Net.

This program is free software; you can redistribute it and/or modify it
under the same terms as Perl itself.

See L<http://www.perl.com/perl/misc/Artistic.html>

=cut
