use t::TestJemplate tests => 2;

filters {
    'tt' => 'compile_lite',
    'tt_nojs' => 'no_javascript',
};
run_is 'tt_nojs' => 'js';
run_is 'tt' => 'js';

sub no_javascript {
    my $jemplate = Jemplate->new( EVAL_JAVASCRIPT => 0 );
    my $result = eval {
        $jemplate->compile_template_content(shift, 'test_template');
    };
    # bail out if eval error
    if( $@ ) {  
        my $error = $@;
        $error =~ s/ at .*$//sg; 
        return $error;
    }
    return $result;
}


__END__

=== verify javascript insert
--- tt
Stuff here
[% JAVASCRIPT %]
alert("this is a test");
[% END %]
More stuff here

--- js
output += 'Stuff here\n';
//line 4 "test_template"

alert("this is a test");

output += '\nMore stuff here\n';

=== verify --nojavascript will cause error
--- tt_nojs
Stuff here
[% JAVASCRIPT %]
alert("this is a test");
[% END %]
More stuff here

--- js
line 4: EVAL_JAVASCRIPT has not been enabled, cannot process [% JAVASCRIPT %] blocks