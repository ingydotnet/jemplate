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

sub check_fail {
    check qr/When you absolutely, positively, have to fail\./;
}

sub check_ilinsky {
    check qr/window\.document\.all && !window.opera;/;
    check qr/!!window\.controllers,/;
}

sub check_gregory {
    check qr/case\s*'microsoft.xmlhttp':\s+case\s*'msxml2.xmlhttp':\s+case\s*'msxml2.xmlhttp.3.0':\s+case\s*'msxml2.xmlhttp.4.0':\s+case\s*'msxml2.xmlhttp.5.0':\s+/
}

sub check_yui {
    check qr/YAHOO\.connect\./;
    check qr/YAHOO\.lang\.JSON/;
}

sub check_xhr {
    check qr/request.onreadystatechange = function\(\)/;
    check qr/if\s*\(request.readyState == 4\)/;
    check qr/if\s*\(request.status == 200\)/;
}

sub check_jquery {
    check qr/jQuery\.getJSON/;
    check qr/jQuery\.post/;
}

sub check_xxx {
    check qr/function XXX/;
}

sub check_json2 {
    check qr/return\s+JSON\.parse\(/;
    check qr/return\s+JSON\.stringify\(/;
}

jemplate qw/--runtime/;
    check_json2;
    check_ilinsky;

jemplate qw/--runtime=standard/;
    check_json2;
    check_ilinsky;

jemplate qw/--runtime=jquery/;
    check_jquery;

jemplate qw/--runtime=yui/;
    check_yui;

jemplate qw/--runtime=legacy/;
    check_json2;
    check_gregory;

jemplate qw/--runtime=lite/;

jemplate qw/--runtime=yui --xhr=ilinsky/;
    check_yui;
    check_ilinsky;

# Don't know why you would want this combo, it'll break YAHOO.connect.
jemplate qw/--runtime=yui --xhr=gregory/;
    check_yui;
    check_gregory;

jemplate qw/--runtime=yui --xhr=gregory --xxx/;
    check_yui;
    check_gregory;
    check_xxx;

jemplate qw/--runtime=legacy/;
    check_gregory;
    check_xxx;
    check_xhr;

jemplate qw/--runtime=lite --ajax/;
    check_xhr;
    check_ilinsky;
#    !check_json2;

jemplate qw/--runtime=lite --ajax --json/;
    check_xhr;
    check_ilinsky;
    check_json2;

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
