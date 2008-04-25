var t = new Test.Jemplate();

t.plan(3);

t.compile();

var j = new Jemplate();

var test1 = t.state.blocks.shift();
t.is(
    j.process('hello', {name: 'Wally'}),
    test1.data.output,
    test1.name
);

var test2 = t.state.blocks.shift();
t.is(
    j.process('hello'),
    test2.data.output,
    test2.name
);

var j = new Jemplate({DEBUG_UNDEF: true});
try {
    j.process('hello', {namexxx: 'Bogey'});
}
catch(e) {
    t.is(
        String(e),
        "undefined value found while using DEGUG_UNDEF",
        "undefined value throws error"
    );
}

/* Test
=== Test second jemplate file (jemplate2.js)
--- output
Hello, Wally!
=== Test undefined value
--- output
Hello, !

*/
