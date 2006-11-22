use t::TestJemplate tests => 2;

filters { 'tt' => ['parse_lite', 'X_line_numbers'] };
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
//line X "(unknown template)"
    
// WHILE
var failsafe = 1000;
while (--failsafe && ((stash.get('foo') == 'bar'))) {
//line X "(unknown template)"
if (1 == 2) {
//line X "(unknown template)"
return output;
}
else {
//line X "(unknown template)"
throw('Jemplate.STOP\n' + output);
}

output += '    Bar';
}
if (! failsafe)
    throw("WHILE loop terminated (> 1000 iterations)\n")

=== WHILE/NEXT/LAST Directives
--- tt
Foo
[%- WHILE (foo == 'bar') -%]
    [%- IF 1 == 2 -%]
        [%- NEXT -%]
    [%- ELSE -%]
        [%- LAST -%]
    [%- END -%]
    Bar
[%- END -%]
--- js
output += 'Foo';
//line X "(unknown template)"
    
// WHILE
var failsafe = 1000;
while (--failsafe && ((stash.get('foo') == 'bar'))) {
//line X "(unknown template)"
if (1 == 2) {
//line X "(unknown template)"
  retval = list.get_next();
  value = retval[0];
  done = retval[1];
  continue;

}
else {
//line X "(unknown template)"
break;
}

output += '    Bar';
}
if (! failsafe)
    throw("WHILE loop terminated (> 1000 iterations)\n")
