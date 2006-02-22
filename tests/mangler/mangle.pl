#! /usr/bin/perl -w
# $Id$
## Most parts are ripped from Template::Test and thus (c) Andy Wardley

# This is an utility script to extract Test cases (from the DATA secion) 
# from the TT test suite # in order to reuse them in Jemplate.
#
# Limitation : it's not currently possible to automatically generate 
# Test.Data compatible suite because TT test suite also  relies on 
# Perl manipulation. (context, post-processing, My::Object)

use strict;
use warnings;
use Template; 
use IO::All;
use File::Spec;
use Getopt::Long;
use Pod::Usage;
 
 
my $context  = '';
my $ctx_file = '';
my $mode     = "perl";
my $help     = 0;

GetOptions('help|?' => \$help, "context=s" => \$ctx_file, "mode=s", \$mode) 
    or pod2usage(2); 
pod2usage(1) if $help;

our $tt = Template->new;

if (-e $ctx_file) {
    my $content = io($ctx_file)->slurp;
    if ($mode eq 'perl') {
        require JSON;
        my $json = JSON->new(); #pretty => 1, delimiter => 1);
        $context = $json->objToJson(eval $content );
    } else {
        #assume it's raw context
        $context = $content;
    }
}

my @data = io('-')->separator('__DATA__')->slurp;
my $data = pop @data; 
my $tests = extract($data);
create_jemplates($tests);
generate_testfile($tests, $context);

# Create the Test.Data test file 
sub generate_testfile {
    my ($tests, $context) = @_;
    # reuse tt itself ;)
    $tt->process('test-data.tmpl.tt', 
        { tests => $tests, context => $context, name => 'newtest' })
        or die $tt->error;
}

# create jemplates on disk based on the 'input' of the tests
sub create_jemplates {
    my $tests = shift;
    for my $t (@$tests) {
        my $name = $t->{name} || "";
        my $filename = File::Spec->catfile('jemplates', dirify($name).'.html');
        my $content = delete $t->{input}; 
        $content > io($filename);
        $t->{filename} = $filename;
    }
}

# Generate a cleaner filename from the test name
sub dirify {
    my $name = shift;
    $name =~ s/ /-/g;
    $name =~ s/[^\w\.-]/_/g;
    return $name;
}

sub extract {
    my ($src) = @_;
    my $input;
    eval {
        local $/ = undef;
        $input = ref $src ? <$src> : $src;
    };
    if ($@) {
        warn "Cannot read input text from $src\n";
        return undef;
    }

    # remove any comment lines
    $input =~ s/^#.*?\n//gm;

    # remove anything before '-- start --' and/or after '-- stop --'
    $input = $' if $input =~ /\s*--\s*start\s*--\s*/;
    $input = $` if $input =~ /\s*--\s*stop\s*--\s*/;

    my @tests = split(/^\s*--\s*test\s*--\s*\n/im, $input);

    # if the first line of the file was '--test--' (optional) then the 
    # first test will be empty and can be discarded
    shift(@tests) if $tests[0] =~ /^\s*$/;

    my @suite = ();
    my $count = 0;
    # the remaining tests are defined in @tests...
    foreach my $input (@tests) {
        $count++;
        my $name = '';

        if ($input =~ s/^\s*-- name:? (.*?) --\s*\n//im) {
            $name = $1; 
        } else {
            $name = "test $count";
        }

        # split input by a line like "-- expect --"
        my $expect;
        ($input, $expect) = 
            split(/^\s*--\s*expect\s*--\s*\n/im, $input);
        $expect = '' 
            unless defined $expect;

        # input text may be prefixed with "-- use name --" to indicate a
        # Template object in the $ttproc hash which we should use
        if ($input =~ s/^\s*--\s*use\s+(\S+)\s*--\s*\n//im) {
            warn "ignored 'use' thing";
            next;
        }

        # another hack: if the '-- expect --' section starts with 
        # '-- process --' then we process the expected output 
        # before comparing it with the generated output.  This is
        # slightly twisted but it makes it possible to run tests 
        # where the expected output isn't static.  See t/date.t for
        # an example.

        if ($expect =~ s/^\s*--+\s*process\s*--+\s*\n//im) {
            warn "ignored the 'process' hack";
            next;
        }; 
        push @suite, { input => $input, expect => $expect, name => $name };
    }
    return \@suite;
}

__END__

=head1 NAME

find a name if this script is useful

=head1 SYNOPSIS

mangle.pl [--context file] [--mode perl|other] < input

 Options:
   --help            this help message
   --context=        context file to use
   --mode=           of the context

=head1 DESCRIPTION

stub. to write.

=cut
