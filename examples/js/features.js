if (typeof(Jemplate) == 'undefined')
    throw('Jemplate.js must be loaded before any Jemplate template files');

Jemplate.templateMap['body.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "body.html"
output += context.process('header.html');
output += '\n\n';
//line 6 "body.html"

// FOREACH 
(function() {
    var list = [ 3, 6, 9 ];
    list = new Jemplate.Iterator(list);
    var retval = list.get_first();
    var value = retval[0];
    var done = retval[1];
    var oldloop;
    try { oldloop = stash.get('loop') } finally {}
    stash.set('loop', list);
    try {
        while (! done) {
            stash['x'] = value;
output += '\n';
//line 4 "body.html"
output += context.process('hacker.html', { 'name': 'miyagawa', 'number': 42 });
output += '\n';
//line 5 "body.html"
output += context.process('hacker.html', { 'name': 'ingy', 'number': 69 });
output += '\n';;
            retval = list.get_next();
            var value = retval[0];
            var done = retval[1];
        }
    }
    catch(e) {
        throw(context.set_error(e, output));
    }
    stash.set('loop', oldloop);
})();

output += '\n\n';
//line 8 "body.html"
output += context.process('footer.html');
output += '\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['footer.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
output += '<center><h3>The End</h3></center>\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['hacker.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
//line 1 "hacker.html"
if (stash.get('number') % 2) {
output += 'Hello';
}
else {
output += 'Goodbye';
}

output += ' ';
//line 1 "hacker.html"
output += stash.get('name');
output += '!!\n<hr>\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

Jemplate.templateMap['header.html'] = function(context) {
    if (! context) throw('Jemplate function called without context\n');
    var stash = context.stash;
    var output = '';

    try {
output += '<h1>Enter the Dragons</h1>\n<hr>\n';
    }
    catch(e) {
        var error = context.set_error(e, output);
        throw(error);
    }

    return output;
}

