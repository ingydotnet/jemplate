use t::TestJemplate tests => 1;

filters { 'tt' => 'parse_lite' };
run_is 'tt' => 'js';

__END__

=== WHILE/RETURN/STOP Directives
--- tt
Foo
[%- WHILE (foo == 'bar') -%]
    [%- IF 1 == 2 -%]
        [%- RETURN -%]
    [%- ELSE -%]
        [%- STOP -%]
    [%- END -%]
    Bar
[%- END -%]
--- js
output += 'Foo';
//line 11 "(unknown template)"
    
// WHILE
var failsafe = 1000;
while (--failsafe && ((stash.get('foo') eq 'bar'))) {
//line 8 "(unknown template)"
if (1 == 2) {
//line 5 "(unknown template)"
return output;
}
else {
//line 7 "(unknown template)"
throw('Jemplate.STOP\n' + output);
}

output += '    Bar';
}
if (! failsafe)
    throw("WHILE loop terminated (> 1000 iterations)\n")
