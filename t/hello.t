use t::TestJemplate tests => 1;

filters { 'tt' => 'parse' };
# no_diff;
run_is 'tt' => 'js';

sub parse {
#     my $parser = Template::Parser->new;
    my $parser = Jemplate::Parser->new;
    my $template = $parser->parse(shift)
      or return $parser->error;
#       or die $parser->error;
    $template->{BLOCK};
}

__END__

=== Hello world
--- tt
Hello [% name %], and good day!
--- js
function(context) {
    if (! context)
        throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';
    var error = null;

    try {
output += 'Hello ';
//line 1 "(unknown template)"
output += stash.get('name');
output += ', and good day!\n';
    }
    catch(e) {
        error = context.katch(e, output);
        if (error.type != 'return')
            throw(error);
    }

    return output;
}
