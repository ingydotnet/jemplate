use t::TestJemplate;
plan qw/no_plan/;

use constant USE_THE_SPIDERMONKEY => $ENV{USE_THE_SPIDERMONKEY} ? 1 : 0;

sub jemplate(@) {
    my $file = "./t/tmp.jemplate.js";
    ok(system("$^X ./jemplate @_ > $file") == 0);
    ok(-s $file);
    if (USE_THE_SPIDERMONKEY) {
        ok(system("/usr/bin/js -swC -e 'var window = { document: {}, Function: { prototype: {} } }' $file") == 0);
    }
}

jemplate "--runtime";

ok(1);

__END__

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
