use t::TestJemplate tests => 4;

filters { 'tt' => 'parse_lite' };
# no_diff;
run_is 'tt' => 'js';

__END__

=== WRAPPER with no args
--- tt
Top
[% WRAPPER wrapper.tt %]
Middle
[% END %]
Bottom
--- js
output += 'Top\n';
//line 4 "(unknown template)"

// WRAPPER
output += (function() {
    var output = '';
output += '\nMiddle\n';;
    return context.include('wrapper.tt', { 'content': output });
})();

output += '\nBottom\n';

=== WRAPPER with args
--- tt
Top
[% WRAPPER wrapper.tt x='yann' %]
My name is [% x %]
[% END %]
Bottom
--- js
output += 'Top\n';
//line 4 "(unknown template)"

// WRAPPER
output += (function() {
    var output = '';
output += '\nMy name is ';
//line 3 "(unknown template)"
output += stash.get('x');
output += '\n';;
    return context.include('wrapper.tt', { 'x': 'yann', 'content': output });
})();

output += '\nBottom\n';

=== WRAPPER with args (inherited)
--- tt
Top
[% last_name = 'Kerhervé' %]
[% WRAPPER wrapper.tt first_name => 'yann' %]
My name is [% first_name %] [% last_name %]
[% END %]
Bottom
--- js
output += 'Top\n';
//line 2 "(unknown template)"
stash.set('last_name', 'Kerhervé');
output += '\n';
//line 5 "(unknown template)"

// WRAPPER
output += (function() {
    var output = '';
output += '\nMy name is ';
//line 4 "(unknown template)"
output += stash.get('first_name');
output += ' ';
//line 4 "(unknown template)"
output += stash.get('last_name');
output += '\n';;
    return context.include('wrapper.tt', { 'first_name': 'yann', 'content': output });
})();

output += '\nBottom\n';

=== WRAPPER multiple + args
--- tt
Top
[% WRAPPER wrapper.tt+wrapper2.tt life = 'good' %]
How's the life ? life is [% life %]
[% END %]
Bottom
--- js
output += 'Top\n';
//line 4 "(unknown template)"

// WRAPPER
output += (function() {
    var output = '';
output += '\nHow\'s the life ? life is ';
//line 3 "(unknown template)"
output += stash.get('life');
output += '\n';;
    var files = new Array('wrapper2.tt', 'wrapper.tt');
    for (var i = 0; i < files.length; i++) {
        output = context.include(files[i], { 'life': 'good', 'content': output });
    }
    return output;
})();

output += '\nBottom\n';

