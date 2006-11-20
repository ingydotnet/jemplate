use t::TestJemplate tests => 1;

filters { 'tt' => 'parse_lite' };
# no_diff;
run_is 'tt' => 'js';

__END__

=== FOR looping
--- tt
[% SET list = [ 1, 3, 5 ] -%]
Top
[% FOR x = list -%]
Middle
[% END -%]
Bottom
--- js
//line 1 "(unknown template)"
stash.set('list', [ 1, 3, 5 ]);
output += 'Top\n';
//line 5 "(unknown template)"

// FOREACH 
(function() {
    var list = stash.get('list');
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash.data['x'] = value;
output += 'Middle\n';;
            retval = list.get_next();
            value = retval[0];
            done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

output += 'Bottom\n';

