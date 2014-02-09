var t = new Test.Jemplate();

t.plan(3);

t.compile();

var j = new Jemplate();
var jVAR = new Jemplate({VARIABLES:{who:'Beaver'}});

var test1 = t.state.blocks.shift();
t.is(
    j.process('hello', {who: 'Wally'}),
    test1.data.output,
    test1.name
);

var test2 = t.state.blocks.shift();
t.is(
    jVAR.process('hello'),
    test2.data.output,
    test2.name
);

var test3 = t.state.blocks.shift();
t.is(
    jVAR.process('hello', {who: 'Wally'}),
    test3.data.output,
    test3.name
);


/* Test
=== Test without VARIABLES set in config hash
--- output
Hello, Wally!
=== Test with VARIABLES set in config hash
--- output
Hello, Beaver!
=== Test with VARIABLES set in config hash being overridden by local var
--- output
Hello, Wally!

*/
