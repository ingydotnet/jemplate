use t::TestJemplate;
plan qw/no_plan/;

use constant TEST_SPIDERMONKEY => $ENV{TEST_SPIDERMONKEY} ? 1 : 0;
use constant TEST_COMPACT => $ENV{TEST_COMPACT} ? 1 : 0;

#use Directory::Scratch;
#my $scratch = Directory::Scratch->new;

#my $check_file = $scratch->file("check.js");
#my $a_file = $scratch->file("a.js");
#my $b_file = $scratch->file("b.js");

my $check_file = "t/check.js";
my $a_file = "t/a.js";
my $b_file = "t/b.js";

my $content;

sub _jemplate($@) {
    my $file = shift;
    unshift @_, "--compact" if TEST_COMPACT;
    ok(system("$^X ./bin/jemplate @_ > $file") == 0);
}

sub jemplate(@) {
    my $file = $check_file;
    undef $content;
    _jemplate $file, @_;
    ok(-s $file);
    if (TEST_SPIDERMONKEY) {
        ok(system("js -swC -e 'var window = { document: {}, Function: { prototype: {} } }' $file") == 0);
    }
}

sub check(@) {
    my $file = $check_file;
    unless (defined $content) {
        local *FILE;
        local $/;
        open FILE, $file or die $!;
        $content = <FILE>;
    }
    like($content, $_) for @_;
}

sub same($$) {
    _jemplate($a_file, @{ shift() });
    _jemplate($b_file, @{ shift() });
    ok(-s $a_file > 0 && -s $a_file == -s $b_file);
}

sub check_fail {
    check qr/When you absolutely, positively, have to fail\./;
}

sub check_ilinsky {
    check qr/window\.document\.all\s*&&\s*!window.opera;/;
    check qr/!!window\.controllers,/;
}

sub check_gregory {
    check qr{XMLHttpRequest\.open\(\) - user/password not supported};
}

sub check_yui {
    check qr/YAHOO\.connect\./;
    check qr/YAHOO\.lang\.JSON/;
}

sub check_xhr {
    my $request = "(?:request|.)";
    check qr/$request.onreadystatechange\s*=\s*function\(\)/;
    check qr/if\s*\($request.readyState\s*==\s*4\)/;
    check qr/if\s*\($request.status\s*==\s*200\)/;
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
    check_xhr;
    check_json2;
    check_ilinsky;

same([qw/--runtime/], [qw/--runtime=lite --ajax=xhr --xhr=ilinsky --json/]);
same([qw/--runtime/], [qw/--runtime=lite --ajax=xhr --xhr=ilinsky --json=json/]);
same([qw/--runtime/], [qw/--runtime=lite --ajax=xhr --xhr=ilinsky --json=json2/]);

jemplate qw/--runtime=standard/;
    check_xhr;
    check_json2;
    check_ilinsky;

same([qw/--runtime/], [qw/--runtime=standard/]);

jemplate qw/--runtime=lite/;
#    !check_xhr;
#    !check_json2;
#    !check_ilinsky;

jemplate qw/--runtime=jquery/;
    check_jquery;

same([qw/--runtime=jquery/], [qw/--runtime=lite --ajax=jquery/]);

jemplate qw/--runtime=yui/;
    check_yui;

same([qw/--runtime=yui/], [qw/--runtime=lite --ajax=yui --json=yui/]);

jemplate qw/--runtime=legacy/;
    check_xhr;
    check_json2;
    check_gregory;

same([qw/--runtime=legacy/], [qw/--runtime=lite --ajax=xhr --json=json2 --xhr=gregory --xxx/]);

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

jemplate qw{--runtime --compile t/assets/jt};
    check qr/Jemplate\.templateMap\['hello'\] = function\(context\) \{/;

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
