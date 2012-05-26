##
# name:      Jemplate
# abstract:  JavaScript Templating with Template Toolkit
# author:    Ingy döt Net <ingy@cpan.org>
# license:   perl
# copyright: 2006-2008, 2011

# ToDo:
# - Module::Package
# - Stardoc
# - Use TT:Simple in Makefiles

package Jemplate;
use 5.006001;
use strict;
use warnings;
use Template 2.14;
use Getopt::Long;

our $VERSION = '0.27';

use Jemplate::Parser;

#-------------------------------------------------------------------------------
sub usage {
    <<'...';
Usage:

    jemplate --runtime [runtime-opt]

    jemplate --compile [compile-opt] <template-list>

    jemplate --runtime [runtime-opt] --compile [compile-opt] <template-list>

    jemplate --list <template-list>

Where "--runtime" and "runtime-opt" can include:

    --runtime           Equivalent to --ajax=ilinsky --json=json2
    --runtime=standard

    --runtime=lite      Same as --ajax=none --json=none
    --runtime=jquery    Same as --ajax=jquery --json=none
    --runtime=yui       Same as --ajax=yui --json=yui
    --runtime=legacy    Same as --ajax=gregory --json=json2

    --json              By itself, equivalent to --json=json2
    --json=json2        Include http://www.json.org/json2.js for parsing/stringifying
    --json=yui          Use YUI: YAHOO.lang.JSON (requires external YUI)
    --json=none         Doesn't provide any JSON functionality except a warning
    
    --ajax              By itself, equivalent to --ajax=xhr
    --ajax=jquery       Use jQuery for Ajax get and post (requires external jQuery)
    --ajax=yui          Use YUI: yui/connection/connection.js (requires external YUI)
    --ajax=xhr          Use XMLHttpRequest (will automatically use --xhr=ilinsky if --xhr is not set)
    --ajax=none         Doesn't provide any Ajax functionality except a warning

    --xhr               By itself, equivalent to --xhr=ilinsky
    --xhr=ilinsky       Include http://code.google.com/p/xmlhttprequest/
    --xhr=gregory       Include http://www.scss.com.au/family/andrew/webdesign/xmlhttprequest/

    --xxx               Include XXX and JJJ helper functions

    --compact           Use the YUICompressor compacted version of the runtime

Where "compile-opt" can include:

    --start-tag
    --end-tag
    --pre-chomp
    --post-chomp
    --trim
    --any-case
    --eval
    --noeval
    -s, --source

For more information use:
    perldoc jemplate
...
}

sub main {
    my $class = shift;

    my @argv = @_;

    my ($template_options, $jemplate_options) = get_options(@argv);
    my ($runtime, $compile, $list) = @$jemplate_options{qw/runtime compile list/};

    if ($runtime) {
        print runtime_source_code(@$jemplate_options{qw/runtime ajax json xhr xxx compact/});
        return unless $compile;
    }

    my $templates = make_file_list(@argv);
    print_usage_and_exit() unless @$templates;

    if ($list) {
        foreach (@$templates) {
            print STDOUT $_->{short} . "\n";
        }
        return;
    }

    if ($compile) {
        my $jemplate = Jemplate->new(%$template_options);
        print STDOUT $jemplate->_preamble;
        foreach my $template (@$templates) {
            my $content = slurp($template->{full});
            if ($content) {
                print STDOUT $jemplate->compile_template_content(
                    $content,
                    $template->{short},
                );
            }
        }
        return;
    }

    print_usage_and_exit();
}

sub get_options {
    local @ARGV = @_;

    my $runtime;
    my $compile = 0;
    my $list = 0;

    my $start_tag = exists $ENV{JEMPLATE_START_TAG}
        ? $ENV{JEMPLATE_START_TAG}
        : undef;
    my $end_tag = exists $ENV{JEMPLATE_END_TAG}
        ? $ENV{JEMPLATE_END_TAG}
        : undef;
    my $pre_chomp = exists $ENV{JEMPLATE_PRE_CHOMP}
        ? $ENV{JEMPLATE_PRE_CHOMP}
        : undef;
    my $post_chomp = exists $ENV{JEMPLATE_POST_CHOMP}
        ? $ENV{JEMPLATE_POST_CHOMP}
        : undef;
    my $trim = exists $ENV{JEMPLATE_TRIM}
        ? $ENV{JEMPLATE_TRIM}
        : undef;
    my $anycase = exists $ENV{JEMPLATE_ANYCASE}
        ? $ENV{JEMPLATE_ANYCASE}
        : undef;
    my $eval_javascript = exists $ENV{JEMPLATE_EVAL_JAVASCRIPT}
        ? $ENV{JEMPLATE_EVAL_JAVASCRIPT}
        : 1;

    my $source = 0;
    my ($ajax, $json, $xxx, $xhr, $compact, $minify);

    my $help = 0;

    GetOptions(
        "compile|c"     => \$compile,
        "list|l"        => \$list,
        "runtime|r:s"   => \$runtime,

        "start-tag=s"   => \$start_tag,
        "end-tag=s"     => \$end_tag,
        "trim=s"        => \$trim,
        "pre-chomp"     => \$pre_chomp,
        "post-chomp"    => \$post_chomp,
        "any-case"      => \$anycase,
        "eval!"         => \$eval_javascript,

        "source|s"      => \$source,

        "ajax:s"        => \$ajax,
        "json:s"        => \$json,
        "xxx"           => \$xxx,
        "xhr:s"         => \$xhr,

        "compact"       => \$compact,
        "minify:s"      => \$minify,

        "help|?"        => \$help,
    ) or print_usage_and_exit();

    if ($help) {
        print_usage_and_exit();
    }

    ($runtime, $ajax, $json, $xxx, $xhr, $minify) = map { defined $_ && ! length $_ ? 1 : $_ } ($runtime, $ajax, $json, $xxx, $xhr, $minify);
    $runtime = "standard" if $runtime && $runtime eq 1;

    print_usage_and_exit("Don't understand '--runtime $runtime'") if defined $runtime && ! grep { $runtime =~ m/$_/ } qw/standard lite jquery yui legacy/;
    print_usage_and_exit("Can't specify --list with a --runtime and/or the --compile option") if $list && ($runtime || $compile);
    print_usage_and_exit() unless $list || $runtime || $compile;

    my $command =
        $runtime ? 'runtime' :
        $compile ? 'compile' :
        $list ? 'list' :
        print_usage_and_exit();

    my $options = {};
    $options->{START_TAG} = $start_tag if defined $start_tag;
    $options->{END_TAG} = $end_tag if defined $end_tag;
    $options->{PRE_CHOMP} = $pre_chomp if defined $pre_chomp;
    $options->{POST_CHOMP} = $post_chomp if defined $post_chomp;
    $options->{TRIM} = $trim if defined $trim;
    $options->{ANYCASE} = $anycase if defined $anycase;
    $options->{EVAL_JAVASCRIPT} = $eval_javascript if defined $eval_javascript;

    return (
        $options,
        { compile => $compile, runtime => $runtime, list => $list,
            source => $source,
            ajax => $ajax, json => $json, xxx => $xxx, xhr => $xhr,
            compact => $compact, minify => $minify },
    );
}


sub slurp {
    my $filepath = shift;
    open(F, '<', $filepath) or die "Can't open '$filepath' for input:\n$!";
    my $contents = do {local $/; <F>};
    close(F);
    return $contents;
}

sub recurse_dir {
    require File::Find::Rule;

    my $dir = shift;
    my @files;
    foreach ( File::Find::Rule->file->in( $dir ) ) {
        if ( m{/\.[^\.]+} ) {} # Skip ".hidden" files or directories
        else {
            push @files, $_;
        }
    }
    return @files;
}

sub make_file_list {
    my @args = @_;

    my @list;

    foreach my $arg (@args) {
        unless (-e $arg) { next; } # file exists
        unless (-s $arg or -d $arg) { next; } # file size > 0 or directory (for Win platform)

        if (-d $arg) {
            foreach my $full ( recurse_dir($arg) ) {
                $full =~ /$arg(\/|)(.*)/;
                my $short = $2;
                push(@list, {full=>$full, short=>$short} );
            }
        }
        else {
            my $full = $arg;
            my $short = $full;
            $short =~ s/.*[\/\\]//;
            push(@list, {full=>$arg, short=>$short} );
        }
    }

    return [ sort { $a->{short} cmp $b->{short} } @list ];
}

sub print_usage_and_exit {
    print STDOUT join "\n", "", @_, "Aborting!", "\n" if @_;
    print STDOUT usage();
    exit;
}

sub runtime_source_code {
    require Jemplate::Runtime;
    require Jemplate::Runtime::Compact;

    unshift @_, "standard" unless @_;

    my ($runtime, $ajax, $json, $xhr, $xxx, $compact) = map { defined $_ ? lc $_ : "" } @_[0 .. 5];

    my $Jemplate_Runtime = $compact ? "Jemplate::Runtime::Compact" : "Jemplate::Runtime";

    if ($runtime eq "standard") {
        $ajax ||= "xhr";
        $json ||= "json2";
        $xhr ||= "ilinsky";
    }
    elsif ($runtime eq "jquery") {
        $ajax ||= "jquery";
    }
    elsif ($runtime eq "yui") {
        $ajax ||= "yui";
        $json ||= "yui";
    }
    elsif ($runtime eq "legacy") {
        $ajax ||= "xhr";
        $json ||= "json2";
        $xhr ||= "gregory";
        $xxx = 1;
    }
    elsif ($runtime eq "lite") {
    }

    $ajax = "xhr" if $ajax eq 1;
    $xhr ||= 1 if $ajax eq "xhr";
    $json = "json2" if $json eq 1;
    $xhr = "ilinsky" if $xhr eq 1;

    my @runtime;

    push @runtime, $Jemplate_Runtime->kernel if $runtime;

    push @runtime, $Jemplate_Runtime->json2 if $json =~ m/^json2?$/i;
    
    push @runtime, $Jemplate_Runtime->ajax_xhr if $ajax eq "xhr";
    push @runtime, $Jemplate_Runtime->ajax_jquery if $ajax eq "jquery";
    push @runtime, $Jemplate_Runtime->ajax_yui if $ajax eq "yui";

    push @runtime, $Jemplate_Runtime->json_json2 if $json =~ m/^json2?$/i;
    push @runtime, $Jemplate_Runtime->json_json2_internal if $json =~ m/^json2?[_-]?internal$/i;
    push @runtime, $Jemplate_Runtime->json_yui if $json eq "yui";

    push @runtime, $Jemplate_Runtime->xhr_ilinsky if $xhr eq "ilinsky";
    push @runtime, $Jemplate_Runtime->xhr_gregory if $xhr eq "gregory";

    push @runtime, $Jemplate_Runtime->xxx if $xxx;

    return join ";", @runtime;
}

#-------------------------------------------------------------------------------

sub new {
    my $class = shift;
    return bless { @_ }, $class;
}

sub compile_module {
    my ($self, $module_path, $template_file_paths) = @_;
    my $result = $self->compile_template_files(@$template_file_paths)
      or return;
    open MODULE, "> $module_path"
        or die "Can't open '$module_path' for output:\n$!";
    print MODULE $result;
    close MODULE;
    return 1;
}

sub compile_module_cached {
    my ($self, $module_path, $template_file_paths) = @_;
    my $m = -M $module_path;
    return 0 unless grep { -M($_) < $m } @$template_file_paths;
    return $self->compile_module($module_path, $template_file_paths);
}

sub compile_template_files {
    my $self = shift;
    my $output = $self->_preamble;
    for my $filepath (@_) {
        my $filename = $filepath;
        $filename =~ s/.*[\/\\]//;
        open FILE, $filepath
          or die "Can't open '$filepath' for input:\n$!";
        my $template_input = do {local $/; <FILE>};
        close FILE;
        $output .=
            $self->compile_template_content($template_input, $filename);
    }
    return $output;
}

sub compile_template_content {
    die "Invalid arguments in call to Jemplate->compile_template_content"
      unless @_ == 3;
    my ($self, $template_content, $template_name) = @_;
    my $parser = Jemplate::Parser->new( ref($self) ? %$self : () );
    my $parse_tree = $parser->parse(
        $template_content, {name => $template_name}
    ) or die $parser->error;
    my $output =
        "Jemplate.templateMap['$template_name'] = " .
        $parse_tree->{BLOCK} .
        "\n";
    for my $function_name (sort keys %{$parse_tree->{DEFBLOCKS}}) {
        $output .=
            "Jemplate.templateMap['$function_name'] = " .
            $parse_tree->{DEFBLOCKS}{$function_name} .
            "\n";
    }
    return $output;
}

sub _preamble {
    return <<'...';
/*
   This JavaScript code was generated by Jemplate, the JavaScript
   Template Toolkit. Any changes made to this file will be lost the next
   time the templates are compiled.

   Copyright 2006-2008 - Ingy döt Net - All rights reserved.
*/

var Jemplate;
if (typeof(exports) == 'object') {
    Jemplate = require("jemplate").Jemplate;
}

if (typeof(Jemplate) == 'undefined')
    throw('Jemplate.js must be loaded before any Jemplate template files');

...
}

1;

=head1 SYNOPSIS

    var data = Ajax.get('url/data.json');
    var elem = document.getElementById('some-div');
    elem.innerHTML = Jemplate.process('my-template.html', data);

or:

    var data = Ajax.get('url/data.json');
    var elem = document.getElementById('some-div');
    Jemplate.process('my-template.html', data, elem);

or simply:

    Jemplate.process('my-template.html', 'url/data.json', '#some-div');

or, with jQuery.js:

    jQuery.getJSON("url/data.json", function(data) {
        Jemplate.process('my-template.html', data, '#some-div');
    });

From the commandline:

    jemplate --runtime --compile path/to/jemplate/directory/ > jemplate.js

=head1 DESCRIPTION

Jemplate is a templating framework for JavaScript that is built over
Perl's Template Toolkit (TT2).

Jemplate parses TT2 templates using the TT2 Perl framework, but with a
twist. Instead of compiling the templates into Perl code, it compiles
them into JavaScript.

Jemplate then provides a JavaScript runtime module for processing
the template code. Presto, we have full featured JavaScript
templating language!

Combined with JSON and xmlHttpRequest, Jemplate provides a really simple
and powerful way to do Ajax stuff.

=head1 HOWTO

Jemplate comes with a command line tool call C<jemplate> that you use to
precompile your templates into a JavaScript file. For example if you have
a template directory called C<templates> that contains:

    > ls templates/
    body.html
    footer.html
    header.html

You might run this command:

    > jemplate --compile template/* > js/jemplates.js

This will compile all the templates into one JavaScript file.

You also need to generate the Jemplate runtime.

    > jemplate --runtime > js/Jemplate.js

Now all you need to do is include these two files in your HTML:

    <script src="js/Jemplate.js" type="text/javascript"></script>
    <script src="js/jemplates.js" type="text/javascript"></script>

Now you have Jemplate support for these templates in your HTML document.

=head1 PUBLIC API

The Jemplate.js JavaScript runtime module has the following API method:

=over

=item Jemplate.process(template-name, data, target);

The C<template-name> is a string like C<'body.html'> that is the name of
the top level template that you wish to process.

The optional C<data> specififies the data object to be used by the
templates. It can be an object, a function or a url. If it is an object,
it is used directly. If it is a function, the function is called and the
returned object is used. If it is a url, an asynchronous <Ajax.get> is
performed. The result is expected to be a JSON string, which gets turned
into an object.

The optional C<target> can be an HTMLElement reference, a function or a
string beginning with a C<#> char. If the target is omitted, the
template result is returned. If it is a function, the function is called
with the result. If it is a string, the string is used as an id to find
an HTMLElement.

If an HTMLElement is used (by id or directly) then the innerHTML
property is set to the template processing result.

=back

The Jemplate.pm Perl module has the following public class methods,
although you won't likely need to use them directly. Normally, you just
use the C<jemplate> command line tool.

=over

=item Jemplate->compile_template_files(@template_file_paths);

Take a list of template file paths and compile them into a module of
functions. Returns the text of the module.

=item Jemplate->compile_template_content($content, $template_name);

Compile one template whose content is in memory. You must provide a
unique template name. Returns the JavaScript text result of the
compilation.

=item Jemplate->compile_module($module_path, \@template_file_paths);

Similar to `compile_template_files`, but prints to result to the
$module_path. Returns 1 if successful, undef if error.

=item Jemplate->compile_module_cached($module_path, \@template_file_paths);

Similar to `compile_module`, but only compiles if one of the templates
is newer than the module. Returns 1 if sucessful compile, 0 if no
compile due to cache, undef if error.

=back

=head1 AJAX AND JSON METHODS

Jemplate comes with builtin Ajax and JSON support.

=over

=item Ajax.get(url, [callback]);

Does a GET operation to the url.

If a callback is provided, the operation is asynchronous, and the data
is passed to the callback. Otherwise, the operation is synchronous and
the data is returned.

=item Ajax.post(url, data, [callback]);

Does a POST operation to the url.

Same callback rules as C<get> apply.

=item JSON.stringify(object);

Return the JSON serialization of an object.

=item JSON.parse(jsonString);

Turns a JSON string into an object and returns the object.

=back

=head1 CURRENT SUPPORT

The goal of Jemplate is to support all of the Template Toolkit features
that can possibly be supported.

Jemplate now supports almost all the TT directives, including:

  * Plain text
  * [% [GET] variable %]
  * [% CALL variable %]
  * [% [SET] variable = value %]
  * [% DEFAULT variable = value ... %]
  * [% INCLUDE [arguments] %]
  * [% PROCESS [arguments] %]
  * [% BLOCK name %]
  * [% FILTER filter %] text... [% END %]
  * [% JAVASCRIPT %] code... [% END %]
  * [% WRAPPER template [variable = value ...] %]
  * [% IF condition %]
  * [% ELSIF condition %]
  * [% ELSE %]
  * [% SWITCH variable %]
  * [% CASE [{value|DEFAULT}] %]
  * [% FOR x = y %]
  * [% WHILE expression %]
  * [% RETURN %]
  * [% THROW type message %]
  * [% STOP %]
  * [% NEXT %]
  * [% LAST %]
  * [% CLEAR %]
  * [%# this is a comment %]
  * [% MACRO name(param1, param2) BLOCK %] ... [% END %]  

ALL of the string virtual functions are supported.

ALL of the array virtual functions are supported:

ALL of the hash virtual functions are supported:

MANY of the standard filters are implemented.

The remaining features will be added very soon. See the DESIGN document
in the distro for a list of all features and their progress.

=head1 BROWSER SUPPORT

Tested successfully in:

    * Firefox Mac/Win32/Linux
    * IE 6.0
    * Safari
    * Opera
    * Konqueror

All tests run 100% successful in the above browsers.

=head1 DEVELOPMENT

The bleeding edge code is available via Git at
git://github.com/ingydotnet/jemplate.git

You can run the runtime tests directly from
http://svn.jemplate.net/repo/trunk/tests/run/index.html or from the
corresponding CPAN or JSAN directories.

Jemplate development is being discussed at irc://irc.freenode.net/#jemplate

If you want a committer bit, just ask ingy on the irc channel.

=head1 CREDIT

This module is only possible because of Andy Wardley's mighty Template
Toolkit. Thanks Andy. I will gladly give you half of any beers I
receive for this work. (As long as you are in the same room when I'm
drinking them ;)

=head1 AUTHORS

Ingy döt Net <ingy@cpan.org>

(Note: I had to list myself first so that this line would go into META.yml)

Jemplate is truly a community authored project:

Ingy döt Net <ingy@cpan.org>

Tatsuhiko Miyagawa <miyagawa@bulknews.net>

Yann Kerherve <yannk@cpan.org>

David Davis <xantus@xantus.org>

Cory Bennett <coryb@corybennett.org>

Cees Hek <ceeshek@gmail.com>

Christian Hansen

David A. Coffey <dacoffey@cogsmith.com>

Robert Krimen <robertkrimen@gmail.com>

Nickolay Platonov <nickolay8@gmail.com>
