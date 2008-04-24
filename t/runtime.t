use t::TestJemplate;
plan qw/no_plan/;

use constant USE_THE_SPIDERMONKEY => $ENV{USE_THE_SPIDERMONKEY} ? 1 : 0;

my $file = "./t/tmp.jemplate.js";
my $content;
sub jemplate(@) {
    undef $content;
    ok(system("$^X ./jemplate @_ > $file") == 0);
    ok(-s $file);
    if (USE_THE_SPIDERMONKEY) {
        ok(system("/usr/bin/js -swC -e 'var window = { document: {}, Function: { prototype: {} } }' $file") == 0);
    }
}

sub check(@) {
    unless (defined $content) {
        local *FILE;
        local $/;
        open FILE, $file or die $!;
        $content = <FILE>;
    }
    like($content, $_) for @_;
}

jemplate qw/--runtime/;

jemplate qw/--runtime=standard/;
check qr/JSON\.parse/;
check qr/JSON\.stringify/;
check qr/window\.document\.all && !window.opera;/; # Using xhr=ilinsky
check qr/!!window\.controllers,/;

jemplate qw/--runtime=jquery/;
check qr/jQuery\.getJSON/;
check qr/jQuery\.post/;

jemplate qw/--runtime=yui/;
check qr/YAHOO\.connect\./;
check qr/YAHOO\.lang\.JSON/;

jemplate qw/--runtime=legacy/;

jemplate qw/--runtime=lite/;

jemplate qw/--runtime=yui --xhr=ilinsky/;
check qr/YAHOO\.connect\./;
check qr/YAHOO\.lang\.JSON/;

jemplate qw/--runtime=yui --xhr=gregory/;
check qr/YAHOO\.connect\./;
check qr/YAHOO\.lang\.JSON/;

jemplate qw/--runtime=yui --xhr=gregory --xxx/;
check qr/function XXX/;

jemplate qw/--runtime=legacy/;
check qr/function XXX/;


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
