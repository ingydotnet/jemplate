# SYNOPSIS

    var data = Ajax.get('url/data.json');
    var elem = document.getElementById('some-div');
    elem.innerHTML = Jemplate.process('my-template.html', data);

or:

    var data = Ajax.get('url/data.json');
    var elem = document.getElementById('some-div');
    Jemplate.process('my-template.html', data, elem);

or simply:

    Jemplate.process('my-template.html', 'url/data.json', '#some-div');

or, with jQuery.js:

    jQuery.getJSON("url/data.json", function(data) {
        Jemplate.process('my-template.html', data, '#some-div');
    });

From the commandline:

    jemplate --runtime --compile path/to/jemplate/directory/ > jemplate.js

# DESCRIPTION

Jemplate is a templating framework for JavaScript that is built over
Perl's Template Toolkit (TT2).

Jemplate parses TT2 templates using the TT2 Perl framework, but with a
twist. Instead of compiling the templates into Perl code, it compiles
them into JavaScript.

Jemplate then provides a JavaScript runtime module for processing
the template code. Presto, we have full featured JavaScript
templating language!

Combined with JSON and xmlHttpRequest, Jemplate provides a really simple
and powerful way to do Ajax stuff.

# HOWTO

Jemplate comes with a command line tool call `jemplate` that you use to
precompile your templates into a JavaScript file. For example if you have
a template directory called `templates` that contains:

    > ls templates/
    body.html
    footer.html
    header.html

You might run this command:

    > jemplate --compile template/* > js/jemplates.js

This will compile all the templates into one JavaScript file.

You also need to generate the Jemplate runtime.

    > jemplate --runtime > js/Jemplate.js

Now all you need to do is include these two files in your HTML:

    <script src="js/Jemplate.js" type="text/javascript"></script>
    <script src="js/jemplates.js" type="text/javascript"></script>

Now you have Jemplate support for these templates in your HTML document.

# PUBLIC API

The Jemplate.js JavaScript runtime module has the following API method:

- Jemplate.process(template-name, data, target);

    The `template-name` is a string like `'body.html'` that is the name of
    the top level template that you wish to process.

    The optional `data` specifies the data object to be used by the
    templates. It can be an object, a function or a url. If it is an object,
    it is used directly. If it is a function, the function is called and the
    returned object is used. If it is a url, an asynchronous <Ajax.get> is
    performed. The result is expected to be a JSON string, which gets turned
    into an object.

    The optional `target` can be an HTMLElement reference, a function or a
    string beginning with a `#` char. If the target is omitted, the
    template result is returned. If it is a function, the function is called
    with the result. If it is a string, the string is used as an id to find
    an HTMLElement.

    If an HTMLElement is used (by id or directly) then the innerHTML
    property is set to the template processing result.

The Jemplate.pm Perl module has the following public class methods,
although you won't likely need to use them directly. Normally, you just
use the `jemplate` command line tool.

- Jemplate->compile\_template\_files(@template\_file\_paths);

    Take a list of template file paths and compile them into a module of
    functions. Returns the text of the module.

- Jemplate->compile\_template\_content($content, $template\_name);

    Compile one template whose content is in memory. You must provide a
    unique template name. Returns the JavaScript text result of the
    compilation.

- Jemplate->compile\_module($module\_path, \\@template\_file\_paths);

    Similar to \`compile\_template\_files\`, but prints to result to the
    $module\_path. Returns 1 if successful, undef if error.

- Jemplate->compile\_module\_cached($module\_path, \\@template\_file\_paths);

    Similar to \`compile\_module\`, but only compiles if one of the templates
    is newer than the module. Returns 1 if successful compile, 0 if no
    compile due to cache, undef if error.

# AJAX AND JSON METHODS

Jemplate comes with builtin Ajax and JSON support.

- Ajax.get(url, \[callback\]);

    Does a GET operation to the url.

    If a callback is provided, the operation is asynchronous, and the data
    is passed to the callback. Otherwise, the operation is synchronous and
    the data is returned.

- Ajax.post(url, data, \[callback\]);

    Does a POST operation to the url.

    Same callback rules as `get` apply.

- JSON.stringify(object);

    Return the JSON serialization of an object.

- JSON.parse(jsonString);

    Turns a JSON string into an object and returns the object.

# CURRENT SUPPORT

The goal of Jemplate is to support all of the Template Toolkit features
that can possibly be supported.

Jemplate now supports almost all the TT directives, including:

    * Plain text
    * [% [GET] variable %]
    * [% CALL variable %]
    * [% [SET] variable = value %]
    * [% DEFAULT variable = value ... %]
    * [% INCLUDE [arguments] %]
    * [% PROCESS [arguments] %]
    * [% BLOCK name %]
    * [% FILTER filter %] text... [% END %]
    * [% JAVASCRIPT %] code... [% END %]
    * [% WRAPPER template [variable = value ...] %]
    * [% IF condition %]
    * [% ELSIF condition %]
    * [% ELSE %]
    * [% SWITCH variable %]
    * [% CASE [{value|DEFAULT}] %]
    * [% FOR x = y %]
    * [% WHILE expression %]
    * [% RETURN %]
    * [% THROW type message %]
    * [% STOP %]
    * [% NEXT %]
    * [% LAST %]
    * [% CLEAR %]
    * [%# this is a comment %]
    * [% MACRO name(param1, param2) BLOCK %] ... [% END %]  

ALL of the string virtual functions are supported.

ALL of the array virtual functions are supported:

ALL of the hash virtual functions are supported:

MANY of the standard filters are implemented.

The remaining features will be added very soon. See the DESIGN document
in the distro for a list of all features and their progress.

# BROWSER SUPPORT

Tested successfully in:

    * Firefox Mac/Win32/Linux
    * IE 6.0
    * Safari
    * Opera
    * Konqueror

All tests run 100% successful in the above browsers.

# DEVELOPMENT

The bleeding edge code is available via Git at
git://github.com/ingydotnet/jemplate.git

You can run the runtime tests directly from
http://svn.jemplate.net/repo/trunk/tests/run/index.html or from the
corresponding CPAN or JSAN directories.

Jemplate development is being discussed at irc://irc.freenode.net/#jemplate

If you want a committer bit, just ask ingy on the irc channel.

# CREDIT

This module is only possible because of Andy Wardley's mighty Template
Toolkit. Thanks Andy. I will gladly give you half of any beers I
receive for this work. (As long as you are in the same room when I'm
drinking them ;)

# AUTHORS

Ingy döt Net <ingy@cpan.org>

(Note: I had to list myself first so that this line would go into META.yml)

Jemplate is truly a community authored project:

Ingy döt Net <ingy@cpan.org>

Tatsuhiko Miyagawa <miyagawa@bulknews.net>

Yann Kerherve <yannk@cpan.org>

David Davis <xantus@xantus.org>

Cory Bennett <coryb@corybennett.org>

Cees Hek <ceeshek@gmail.com>

Christian Hansen

David A. Coffey <dacoffey@cogsmith.com>

Robert Krimen <robertkrimen@gmail.com>

Nickolay Platonov <nickolay8@gmail.com>
