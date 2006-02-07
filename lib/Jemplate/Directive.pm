package Jemplate::Directive;
use strict;
use warnings;
# use base 'Template::Directive';

use YAML; sub XXX { die YAML::Dump @_ }

our( $PRETTY, $OUTPUT );
BEGIN {
    *PRETTY = \ $Template::Directive::PRETTY;
    $OUTPUT = 'output +=';
}

sub template {
    my ($class, $block) = @_;
    $block = pad($block, 2) if $PRETTY;

    return "sub { return '' }" unless $block =~ /\S/;

    return <<"...";
function(context) {
    if (! context)
        throw('template sub called without context\\n');
    var stash = context.stash;
    var output = '';
    var error = null;

    try {
$block
    }
    catch(e) {
        error = context.katch(e, output);
        if (error.type != 'return')
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

1;
