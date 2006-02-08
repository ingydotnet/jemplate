package Jemplate::Directive;
use strict;
use warnings;

{   # XXX This is only temporarily here for debugging
    no warnings 'redefine';
    sub XXX {
        require YAML;
        die YAML::Dump(@_);
    }
}

our( $PRETTY, $OUTPUT );
BEGIN {
    no warnings 'once';
    *PRETTY = \ $Template::Directive::PRETTY;
    $OUTPUT = 'output +=';
}

sub template {
    my ($class, $block) = @_;
    $block = pad($block, 2) if $PRETTY;

    return "sub { return '' }" unless $block =~ /\S/;

    return <<"...";
function(context) {
    if (! context) throw('Jemplate function called without context\\n');
    var stash = context.stash;
    var output = '';

    try {
$block
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}
...
}
 
#------------------------------------------------------------------------
# textblock($text)
#------------------------------------------------------------------------

sub textblock {
    my ($class, $text) = @_;
    return "$OUTPUT " . $class->text($text) . ';';
}

#------------------------------------------------------------------------
# text($text)
#------------------------------------------------------------------------

sub text {
    my ($class, $text) = @_;
    for ($text) {
        s/([\'\\])/\\$1/g;
        s/\n/\\n/g;
    }
    return "'" . $text . "'";
}

#------------------------------------------------------------------------
# ident(\@ident)                                             foo.bar(baz)
#------------------------------------------------------------------------

sub ident {
    my ($class, $ident) = @_;
    return "''" unless @$ident;
    my $ns;

    # does the first element of the identifier have a NAMESPACE
    # handler defined?
    if (ref $class && @$ident > 2 && ($ns = $class->{ NAMESPACE })) {
        my $key = $ident->[0];
        $key =~ s/^'(.+)'$/$1/s;
        if ($ns = $ns->{ $key }) {
            return $ns->ident($ident);
        }
    }

    if (scalar @$ident <= 2 && ! $ident->[1]) {
        $ident = $ident->[0];
    }
    else {
        $ident = '[' . join(', ', @$ident) . ']';
    }
    return "stash.get($ident)";
}


#------------------------------------------------------------------------
# filenames(\@names)
#------------------------------------------------------------------------
    
sub filenames {
    my ($class, $names) = @_;
    if (@$names > 1) {
        $names = '[ ' . join(', ', @$names) . ' ]';
    }
    else {
        $names = shift @$names;
    }
    return $names;
}   
    
        
#------------------------------------------------------------------------
# get($expr)                                                    [% foo %]
#------------------------------------------------------------------------

sub get {
    my ($class, $expr) = @_;
    return "$OUTPUT $expr;";
}   

sub block {
    my ($class, $block) = @_;
    return join "\n", map {
        s/^#(?=line \d+)/\/\//gm;
        $_;
    } @{ $block || [] };
}

#------------------------------------------------------------------------
# process(\@nameargs)                    [% PROCESS template foo = bar %] 
#         # => [ [ $file, ... ], \@args ]
#------------------------------------------------------------------------

sub process {
    my ($class, $nameargs) = @_;
    my ($file, $args) = @$nameargs;
    my $hash = shift @$args;
    s/ => /: / for @$hash;
    $file = $class->filenames($file);
    $file .= @$hash ? ', { ' . join(', ', @$hash) . ' }' : '';
    return "$OUTPUT context.process($file);"; 
}   
    
        
#------------------------------------------------------------------------
# if($expr, $block, $else)                             [% IF foo < bar %]
#                                                         ...
#                                                      [% ELSE %]
#                                                         ...
#                                                      [% END %]
#------------------------------------------------------------------------
    
sub if {
    my ($class, $expr, $block, $else) = @_;
    my @else = $else ? @$else : ();
    $else = pop @else;

    $expr = _fix_expr($expr);
    my $output = "if ($expr) {\n$block\n}\n";
        
    foreach my $elsif (@else) {
        ($expr, $block) = @$elsif;
        $expr = _fix_expr($expr);
        $output .= "else if ($expr) {\n$block\n}\n";
    }   
    if (defined $else) {
        $output .= "else {\n$else\n}\n";
    }

    return $output;
}

# XXX A very nasty hack until I learn more.
sub _fix_expr {
    my $expr = shift;
    $expr =~ s/ eq / == /g;
    return $expr;
}

1;

=head1 NAME

Jemplate::Directive - Jemplate Code Generating Backend

=head1 SYNOPSIS

    use Jemplate::Directive;

=head1 DESCRIPTION

Jemplate::Directive is the analog to Template::Directive, which is the
module that produces that actual code that templates turn into. The
Jemplate version obviously produces Javascript code rather than Perl.
Other than that the two modules are almost exactly the same.

=head1 BUGS

Unfortunately, some of the code generation seems to happen before
Jemplate::Directive gets control. So it currently has heuristical code
to rejigger Perl code snippets into Javascript. This processing needs to
happen upstream once I get more clarity on how Template::Toolkit works.

=head1 AUTHOR

Ingy döt Net <ingy@cpan.org>

=head1 COPYRIGHT

Copyright (c) 2006. Ingy döt Net. All rights reserved.

This program is free software; you can redistribute it and/or modify it
under the same terms as Perl itself.

See L<http://www.perl.com/perl/misc/Artistic.html>

=cut
