#line 1 "inc/Module/Install/Share.pm - /Users/ingy/local/lib/perl5/site_perl/5.8.6/Module/Install/Share.pm"
package Module::Install::Share;

use Module::Install::Base;
@ISA = qw(Module::Install::Base);

$VERSION = '0.01';

use strict;

sub install_share {
    my $self = shift;
    my $dir  = shift;

    if ( ! defined $dir ) {
        die "Cannot find the 'share' directory" unless -d 'share';
        $dir = 'share';
    }

    $self->postamble(<<".");
config ::
\t\$(NOECHO) \$(MOD_INSTALL) \\
\t\t\"$dir\" \$(INST_ARCHAUTODIR)

.
}

__END__

#line 62
