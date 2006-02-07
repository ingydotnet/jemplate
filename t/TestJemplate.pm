package t::TestJemplate;
use Test::Base -Base;

use Jemplate;

package t::TestJemplate::Filter;
use base 'Test::Base::Filter';

sub parse {
    my $parser = Jemplate::Parser->new;
    my $template = $parser->parse(shift)
      or die $parser->error;
    return $template->{BLOCK};
}

sub parse_lite {
    no warnings 'redefine';
    local *Jemplate::Directive::template = sub {
        my ($class, $block) = @_;
        chomp($block);
        return "$block\n";
    };
    return $self->parse(@_);
}
