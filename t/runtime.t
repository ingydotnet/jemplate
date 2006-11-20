use t::TestJemplate tests => 2;

my $output_file = 't/Jemplate.js';
unlink $output_file;

ok((system("$^X ./jemplate --runtime > $output_file") == 0),
    "jemplate command ran"
);;

is(read_file($output_file), read_file("share/Jemplate.js"),
    "--runtime output matches share/Jemplate.js"
);

sub read_file {
    my $file = shift;
    local *F;
    local $/;
    open F, $file;
    return <F>;
}
