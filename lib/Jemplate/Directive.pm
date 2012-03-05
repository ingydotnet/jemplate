package Jemplate::Directive;
use strict;
use warnings;

our $OUTPUT = 'output +=';
our $WHILE_MAX = 1000;

# parser state variable
# only true when inside JAVASCRIPT blocks
our $INJAVASCRIPT = 0;

sub new {
    my $class = shift;
    
    return bless {}, $class
}

sub template {
    my ($class, $block) = @_;

    return "function() { return ''; }" unless $block =~ /\S/;

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
 
# Try to do 1 .. 10 expansions
sub _attempt_range_expand_val ($) {
    my $val = shift;
    return $val unless
        my ( $from, $to ) = $val =~ m/\s*\[\s*(\S+)\s*\.\.\s*(\S+)\s*\]/;

    die "Range expansion is current supported for positive/negative integer values only (e.g. [ 1 .. 10 ])\nCannot expand: $val" unless $from =~ m/^-?\d+$/ && $to =~ m/^-?\d+$/;

    return join '', '[', join( ',', $from .. $to ), ']';
}

#------------------------------------------------------------------------
# textblock($text)
#------------------------------------------------------------------------

sub textblock {
    my ($class, $text) = @_;
    return $text if $INJAVASCRIPT;
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
        s/\r/\\r/g;
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
# assign(\@ident, $value, $default)                             foo = bar
#------------------------------------------------------------------------

sub assign {
    my ($class, $var, $val, $default) = @_;

    if (ref $var) {
        if (scalar @$var == 2 && ! $var->[1]) {
            $var = $var->[0];
        }
        else {
            $var = '[' . join(', ', @$var) . ']';
        }
    }
    $val =  _attempt_range_expand_val $val;
    $val .= ', 1' if $default;
    return "stash.set($var, $val)";
}


#------------------------------------------------------------------------
# args(\@args)                                        foo, bar, baz = qux
#------------------------------------------------------------------------

sub args {
    my ($class, $args) = @_;
    my $hash = shift @$args;
    push(@$args, '{ ' . join(', ', @$hash) . ' }')
        if @$hash;

    return '[]' unless @$args;
    return '[ ' . join(', ', @$args) . ' ]';
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
# call($expr)                                              [% CALL bar %]
#------------------------------------------------------------------------

sub call {
    my ($class, $expr) = @_;
    $expr .= ';';
    return $expr;
}


#------------------------------------------------------------------------
# set(\@setlist)                               [% foo = bar, baz = qux %]
#------------------------------------------------------------------------

sub set {
    my ($class, $setlist) = @_;
    my $output;
    while (my ($var, $val) = splice(@$setlist, 0, 2)) {
        $output .= $class->assign($var, $val) . ";\n";
    }
    chomp $output;
    return $output;
}


#------------------------------------------------------------------------
# default(\@setlist)                   [% DEFAULT foo = bar, baz = qux %]
#------------------------------------------------------------------------

sub default {
    my ($class, $setlist) = @_;
    my $output;
    while (my ($var, $val) = splice(@$setlist, 0, 2)) {
        $output .= &assign($class, $var, $val, 1) . ";\n";
    }
    chomp $output;
    return $output;
}


#------------------------------------------------------------------------
# include(\@nameargs)                    [% INCLUDE template foo = bar %] 
#         # => [ [ $file, ... ], \@args ]
#------------------------------------------------------------------------

sub include {
    my ($class, $nameargs) = @_;
    my ($file, $args) = @$nameargs;
    my $hash = shift @$args;
    $file = $class->filenames($file);
    $file .= @$hash ? ', { ' . join(', ', @$hash) . ' }' : '';
    return "$OUTPUT context.include($file);"; 
}   
    
        
#------------------------------------------------------------------------
# process(\@nameargs)                    [% PROCESS template foo = bar %] 
#         # => [ [ $file, ... ], \@args ]
#------------------------------------------------------------------------

sub process {
    my ($class, $nameargs) = @_;
    my ($file, $args) = @$nameargs;
    my $hash = shift @$args;
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

    my $output = "if ($expr) {\n$block\n}\n";
        
    foreach my $elsif (@else) {
        ($expr, $block) = @$elsif;
        $output .= "else if ($expr) {\n$block\n}\n";
    }   
    if (defined $else) {
        $output .= "else {\n$else\n}\n";
    }

    return $output;
}

#------------------------------------------------------------------------
# foreach($target, $list, $args, $block)    [% FOREACH x = [ foo bar ] %]
#                                              ...
#                                           [% END %]
#------------------------------------------------------------------------

sub foreach {
    my ($class, $target, $list, $args, $block) = @_;
    $args  = shift @$args;
    $args  = @$args ? ', { ' . join(', ', @$args) . ' }' : '';

    my ($loop_save, $loop_set, $loop_restore, $setiter);
    if ($target) {
        $loop_save =
            'try { oldloop = ' . $class->ident(["'loop'"]) . ' } finally {}';
        $loop_set = "stash.data['$target'] = value";
        $loop_restore = "stash.set('loop', oldloop)";
    }
    else {
        die "XXX - Not supported yet";
        $loop_save = 'stash = context.localise()';
        $loop_set =
            "stash.get(['import', [value]]) if typeof(value) == 'object'";
        $loop_restore = 'stash = context.delocalise()';
    }

    $list = _attempt_range_expand_val $list;

    return <<EOF;

// FOREACH 
(function() {
    var list = $list;
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    $loop_save
    stash.set('loop', list);
    try {
        while (! done) {
            $loop_set;
$block;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    $loop_restore;
})();
EOF
}


#------------------------------------------------------------------------
# next()                                                       [% NEXT %]
#
# Next iteration of a FOREACH loop (experimental)
#------------------------------------------------------------------------

sub next {
  return <<EOF;
  retval = list.get_next();
  value = retval[0];
  done = retval[1];
  continue;
EOF
}

#------------------------------------------------------------------------
# wrapper(\@nameargs, $block)            [% WRAPPER template foo = bar %] 
#          # => [ [$file,...], \@args ]    
#------------------------------------------------------------------------
sub wrapper {
    my ($class, $nameargs, $block) = @_;
    my ($file, $args) = @$nameargs;
    my $hash = shift @$args;

    s/ => /: / for @$hash;
    return $class->multi_wrapper($file, $hash, $block)
        if @$file > 1;
    $file = shift @$file;
    push(@$hash, "'content': output");
    $file .= @$hash ? ', { ' . join(', ', @$hash) . ' }' : '';

    return <<EOF;

// WRAPPER
$OUTPUT (function() {
    var output = '';
$block;
    return context.include($file);
})();
EOF
}

sub multi_wrapper {
    my ($class, $file, $hash, $block) = @_;

    push(@$hash, "'content': output");
    $hash = @$hash ? ', { ' . join(', ', @$hash) . ' }' : '';

    $file = join(', ', reverse @$file);
#    print STDERR "multi wrapper: $file\n";

    return <<EOF;

// WRAPPER
$OUTPUT (function() {
    var output = '';
$block;
    var files = new Array($file);
    for (var i = 0; i < files.length; i++) {
        output = context.include(files[i]$hash);
    }
    return output;
})();
EOF
}


#------------------------------------------------------------------------
# while($expr, $block)                                 [% WHILE x < 10 %]
#                                                         ...
#                                                      [% END %]
#------------------------------------------------------------------------

sub while {
    my ($class, $expr, $block) = @_; 
    
    return <<EOF;
    
// WHILE
var failsafe = $WHILE_MAX;
while (--failsafe && ($expr)) {
$block
}
if (! failsafe)
    throw("WHILE loop terminated (> $WHILE_MAX iterations)\\n")
EOF
}

#------------------------------------------------------------------------
# javascript($script)                                   [% JAVASCRIPT %]
#                                                           ...
#                                                       [% END %]
#------------------------------------------------------------------------
sub javascript {
    my ( $class, $javascript ) = @_;
    return $javascript;
}

sub no_javascript {
    my ( $class ) = @_;
    die "EVAL_JAVASCRIPT has not been enabled, cannot process [% JAVASCRIPT %] blocks";
}

#------------------------------------------------------------------------
# switch($expr, \@case)                                    [% SWITCH %]
#                                                          [% CASE foo %]
#                                                             ...
#                                                          [% END %]
#------------------------------------------------------------------------

sub switch {
    my ($class, $expr, $case) = @_;
    my @case = @$case;
    my ($match, $block, $default);
    my $caseblock = '';

    $default = pop @case;

    foreach $case (@case) {
        $match = $case->[0];
        $block = $case->[1];
#        $block = pad($block, 1) if $PRETTY;
        $caseblock .= <<EOF;
case $match:
$block
break;

EOF
    }

    if (defined $default) {
        $caseblock .= <<EOF;
default:
$default
break;
EOF
    }
#    $caseblock = pad($caseblock, 2) if $PRETTY;

return <<EOF;

    switch($expr) {
$caseblock
    }

EOF
}


#------------------------------------------------------------------------
# throw(\@nameargs)                           [% THROW foo "bar error" %]
#       # => [ [$type], \@args ]
#------------------------------------------------------------------------

sub throw {
    my ($class, $nameargs) = @_;
    my ($type, $args) = @$nameargs;
    my $hash = shift(@$args);
    my $info = shift(@$args);
    $type = shift @$type;

    return qq{throw([$type, $info]);};
}


#------------------------------------------------------------------------
# clear()                                                     [% CLEAR %]
#   
# NOTE: this is redundant, being hard-coded (for now) into Parser.yp
#------------------------------------------------------------------------

sub clear {
    return "output = '';";
}


#------------------------------------------------------------------------
# break()                                                     [% BREAK %]
#   
# NOTE: this is redundant, being hard-coded (for now) into Parser.yp
#------------------------------------------------------------------------

sub break {
    return 'break;';
}                       
        
#------------------------------------------------------------------------
# return()                                                   [% RETURN %]
#------------------------------------------------------------------------

sub return {
    return "return output;"
}


#------------------------------------------------------------------------
# stop()                                                       [% STOP %]
#------------------------------------------------------------------------

sub stop {
    return "throw('Jemplate.STOP\\n' + output);";
}   


#------------------------------------------------------------------------
# use(\@lnameargs)                         [% USE alias = plugin(args) %]
#     # => [ [$file, ...], \@args, $alias ]
#------------------------------------------------------------------------

sub use {
    my ($class, $lnameargs) = @_;
    my ($file, $args, $alias) = @$lnameargs;
    $file = shift @$file;       # same production rule as INCLUDE
    $alias ||= $file;
    $args = &args($class, $args);
    $file .= ", $args" if $args;
    return "// USE\n"
         . "stash.set($alias, context.plugin($file));";
}


#------------------------------------------------------------------------
# raw(\@lnameargs)                         [% RAW alias = plugin(args) %]
#     # => [ [$file, ...], \@args, $alias ]
#------------------------------------------------------------------------

sub raw {
    my ($class, $lnameargs) = @_;
    my ($file, $args, $alias) = @$lnameargs;
    $file = shift @$file;       # same production rule as INCLUDE
    $alias ||= $file;
    $args = &args($class, $args);
#    $file .= ", $args" if $args;
    $file =~ s/'|"//g;
    return "// RAW\n"
         . "stash.set($alias, $file);";
}


#------------------------------------------------------------------------
# stubs()                                                      [% STOP %]
#------------------------------------------------------------------------

sub filter {
    my ($class, $lnameargs, $block) = @_;
    my ($name, $args, $alias) = @$lnameargs;
    $name = shift @$name;
    $args = &args($class, $args);
    $args = $args ? "$args, $alias" : ", null, $alias"
        if $alias;
    $name .= ", $args" if $args;
    return <<EOF;

// FILTER
$OUTPUT (function() {
    var output = '';

$block

    return context.filter(output, $name);
})();
EOF
}

sub quoted {
    my $class = shift;
    if ( @_ && ref($_[0]) ) {
        return join( " + ", @{$_[0]} );
    }
    return "throw('QUOTED called with unknown arguments in Jemplate');";
}   

#------------------------------------------------------------------------
# macro($name, $block, \@args)
#------------------------------------------------------------------------

sub macro {
    my ($class, $ident, $block, $args) = @_;

    if ($args) {
        $args = join(';', map { "args['$_'] = fargs.shift()" } @$args);

        return <<EOF;

//MACRO
stash.set('$ident', function () {
    var output = '';
    var args = {};
    var fargs = Array.prototype.slice.call(arguments);
    $args;
    args.arguments = Array.prototype.slice.call(arguments);

    var params = fargs.shift() || {};

    for (var key in params) {
        args[key] = params[key];
    }

    context.stash.clone(args);
    try {
$block
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    context.stash.declone();
    return output;
});

EOF

    }
    else {
        return <<EOF;

//MACRO

stash.set('$ident', function () {
    var output = '';
    var args = {};
    
    var fargs = Array.prototype.slice.call(arguments);
    args.arguments = Array.prototype.slice.call(arguments);   
    
    if (typeof arguments[0] == 'object') args = arguments[0];
    
    context.stash.clone(args);
    try {
$block
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    context.stash.declone(); 
    return output;});

EOF
    }
}

sub capture {
    my ($class, $name, $block) = @_;

    if (ref $name) {
        if (scalar @$name == 2 && ! $name->[1]) {
            $name = $name->[0];
        }
        else {
            $name = '[' . join(', ', @$name) . ']';
        }
    }

    return <<EOF;

// CAPTURE
(function() {
	var output = '';
	$block
	stash.set($name, output);
})();
EOF

}   

BEGIN {
    return;  # Comment out this line to get callback traces
    no strict 'refs';
    my $pkg = __PACKAGE__ . '::';
    my $stash = \ %$pkg;
    use strict 'refs';
    for my $name (keys %$stash) {
        my $glob = $stash->{$name};
        if (*$glob{CODE}) {
            my $code = *$glob{CODE};    
            no warnings 'redefine';
            $stash->{$name} = sub {
                warn "Calling $name(@_)\n";
                &$code(@_);
            };
        }
    } 
}

    
1;

=head1 NAME

Jemplate::Directive - Jemplate Code Generating Backend

=head1 SYNOPSIS

    use Jemplate::Directive;

=head1 DESCRIPTION

Jemplate::Directive is the analog to Template::Directive, which is the
module that produces that actual code that templates turn into. The
Jemplate version obviously produces JavaScript code rather than Perl.
Other than that the two modules are almost exactly the same.

=head1 BUGS

Unfortunately, some of the code generation seems to happen before
Jemplate::Directive gets control. So it currently has heuristical code
to rejigger Perl code snippets into JavaScript. This processing needs to
happen upstream once I get more clarity on how Template::Toolkit works.

=head1 AUTHOR

Ingy döt Net <ingy@cpan.org>

=head1 COPYRIGHT

Copyright (c) 2006-2008. Ingy döt Net. All rights reserved.

This program is free software; you can redistribute it and/or modify it
under the same terms as Perl itself.

See L<http://www.perl.com/perl/misc/Artistic.html>

=cut
