function TheName(name) {
    this.name = name;
}

TheName.prototype.getName = function() {
   return this.name;
}

TheName.prototype.setName = function(name) {
   this.name = name;
}

var theName = new TheName('larry');

// Begin test
var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process',
    context: 'evaluate'
};

t.plan(4);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== Basic hash
--- jemplate
myhashname.html
[%- JAVASCRIPT -%]
stash.set( "object", { name: 'Wally' } );
[%- END -%]
Hello, [% object.name %]
--- output
Hello, Wally

=== Object attribute
--- jemplate
myobjectnameattr.html
[%- JAVASCRIPT -%]
stash.set( "object", new TheName('Larry') );
[%- END -%]
Hello, [% object.name %]
--- output
Hello, Larry

=== Object accessor
--- jemplate
myobjectnameac.html
[%- JAVASCRIPT -%]
var obj = new TheName('Bally');
stash.set( "objectName", obj.getName() );
[%- END -%]
Hello, [% objectName %]
--- output
Hello, Bally

=== Basic accessor2
--- jemplate
myobjectnameac2.html
[%- JAVASCRIPT -%]
stash.set( "object", new TheName('Mally') );
[%- END -%]
Hello, [% object.getName() %]
--- output
Hello, Mally

*/
