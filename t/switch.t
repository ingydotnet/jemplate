use t::TestJemplate tests => 1;

filters { 'tt' => 'parse_lite' };
run_is 'tt' => 'js';

__END__

=== SWITCH/CASE Directives
--- tt
Foo
[%- SWITCH foo -%]
    [%- CASE 'Bar' -%]
        [%- 'Bar' -%]
    [%- CASE DEFAULT -%]
        [%- 'Baz' -%]
[%- END -%]
Zot
--- js
output += 'Foo';
//line 8 "(unknown template)"

    switch(stash.get('foo')) {
case 'Bar':
//line 5 "(unknown template)"
output += 'Bar';
break;

default:
//line 7 "(unknown template)"
output += 'Baz';
break;

    }


output += 'Zot\n';

