package Jemplate;
use 5.006001;
use strict;
use warnings;
use Template 2.14;

our $VERSION = '0.11';

use Jemplate::Parser;

sub compile_templates {
    my $class = shift;
    my $output = $class->_preamble;
    for my $filepath (@_) {
        my $filename = $filepath;
        $filename =~ s/.*[\/\\]//;
        open FILE, $filepath
          or die "Can't open '$filepath' for input:\n$!";
        my $template_input = do {local $/; <FILE>};
        close FILE;
        my $parser = Jemplate::Parser->new;
        my $info = { name => $filename };
        my $template_output = $parser->parse($template_input, $info)
          or die $parser->error;
        my $template_function = $template_output->{BLOCK};
        $output .= "Jemplate.templateMap['$filename'] = $template_function\n";
    }
    return $output;
}

sub _preamble {
    return <<'...';
if (typeof(Jemplate) == 'undefined')
    throw('Jemplate.js must be loaded before any Jemplate template files');

...
}

1;

=head1 NAME

Jemplate - Javascript Templating with Template Toolkit

=head1 SYNOPSIS

    var data = fetchSomeJsonResult();
    var elem = document.getElementById('some-div');
    elem.innerHTML = Jemplate.process('my-template.html', data);

Or, with Prototype.js:

    new Ajax.Request("/json", {
        onComplete: function(req) {
            var data = eval(req.responseText);
            $('some-div').innerHTML = Jemplate.process('my-template.html', data);
        }
    );

=head1 DESCRIPTION

Jemplate is a templating framework for Javascript that is built over
Perl's Template Toolkit (TT2).

Jemplate parses TT2 templates using the TT2 Perl framework, but with a
twist. Instead of compiling the templates into Perl code, it compiles
them into Javascript.

Jemplate then provides a Javascript runtime module for processing
the template code. Presto, we have full featured Javascript
templating language!

Combined with JSON and xmlHttpRequest, Jemplate provides a really simple
and powerful way to do Ajax stuff.

=head1 HOWTO

Jemplate comes with a command line tool call C<jemplate> that you use to
precompile your templates into javscript. For example if you have a template
directory called C<templates> that contains:

    > ls templates/
    body.html
    footer.html
    header.html

You might run this command:

    > jemplate --compile template/* > js/jemplate01.js

This will compile all the templates into one Javascript file.

You also need to get the Jemplate runtime.

    > cp ~/Jemplate-x.xx/share/Jemplate.js js/Jemplate.js

Now all you need to do is include these two files in the HEAD of
your html:

    <script src="js/Jemplate.js" type="text/javascript"></script>
    <script src="js/jemplate01.js" type="text/javascript"></script>

Now you have Jemplate support for these templates in your html document.

=head1 BUGS

This early release of Jemplate only supports the following
template features:

  * Plain text
  * Simple [% variable %] substitution
  * IF/ELSIF/ELSE
  * PROCESS

The remaining features will be added very soon.

=head1 DEVELOPMENT

Jemplate development is being discussed at
irc://irc.freenode.net/#jemplate

=head1 CREDIT

This module is only possible because of Andy Wardley's mighty
Template Toolkit. Thanks Andy. I will gladly give you half of any beers
I receive for this work.

=head1 AUTHOR

Ingy döt Net <ingy@cpan.org>

=head1 COPYRIGHT

Copyright (c) 2006. Ingy döt Net. All rights reserved.

This program is free software; you can redistribute it and/or modify it
under the same terms as Perl itself.

See L<http://www.perl.com/perl/misc/Artistic.html>

=cut
