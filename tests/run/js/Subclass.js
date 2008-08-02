/*==============================================================================
Subclass - Define a Class potentially as a Subclass in JavaScript

DESCRIPTION:



AUTHORS:

    Ingy döt Net <ingy@cpan.org>

COPYRIGHT:

Copyright Ingy döt Net 2006. All rights reserved.

Subclass.js is free software. 

This library is free software; you can redistribute it and/or modify it
under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation; either version 2.1 of the License, or (at
your option) any later version.

This library is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser
General Public License for more details.

    http://www.gnu.org/copyleft/lesser.txt

 =============================================================================*/

/*==============================================================================
Subclass - this can be used to create new classes
 =============================================================================*/

Subclass = function(name, base) {
    if (!name) die("Can't create a subclass without a name");

    var parts = name.split('.');
    var subclass = window;
    for (var i = 0; i < parts.length; i++) {
        if (! subclass[parts[i]])
            subclass[parts[i]] = function() {
                try { this.init() } catch(e) {}
            };
        subclass = subclass[parts[i]];
    }

    if (base) {
        var baseclass = eval('new ' + base + '()');
        subclass.prototype = baseclass;
        subclass.prototype.baseclass = base;
        subclass.prototype.superfunc = Subclass.generate_superfunc();
    }
    subclass.prototype.classname = name;
    return subclass.prototype;
}

Subclass.generate_superfunc = function() {
    return function(func) {
        var p;
        var found = false;
        var caller_func = arguments.callee.caller;
        for (var b = this.classname; b; b = p.baseclass) {
            p = eval(b + '.prototype');
            if (! found) {
                if (p[func] && p[func] == caller_func)
                    found = true;
                continue;
            }
            if (p[func] && p[func] != caller_func)
                return p[func];
        }
        die(
            "No superfunc function for: " + func + "\n" +
            "baseclass was: " + this.baseclass + "\n" +
            "caller was: " + arguments.callee.caller
        );
    }
}

/*

=head1 NAME

Subclass - Define a class or subclass

=cut

*/
