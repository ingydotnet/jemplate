package t::TestJemplate;
use lib 'inc';
use Test::Base -Base;

use Jemplate;

package t::TestJemplate::Filter;
use base 'Test::Base::Filter';

sub XXX() { require YAML; die YAML::Dump(@_) }

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

sub compile {
    return Jemplate->compile_template_content(shift, 'test_template');
}

sub compile_lite {
    my $result = $self->compile(@_);
    $result =~ s/^Jemplate\.templateMap.*?    try \{\n//gsm;
    $result =~ s/^\s+\}\s+catch\(e\) \{\n.*?\n\}\n//gsm;
    $result =~ s/\n+\z/\n/;
    return $result;
}

sub X_line_numbers {
    my $js = shift;
    $js =~ s!^//line \d+!//line X!gm;
    return $js;
}
