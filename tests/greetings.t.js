var t = new Test.Jemplate();

t.plan(1);

t.compile();

var j = new Jemplate();

var test1 = t.state.blocks.shift();
t.is(
    j.process('greetings', {name: 'Jesus'}),
    test1.data.output,
    test1.name
);

/* Test
=== Include files with path names.
--- output
English: Howdy Jesus. How are you?

Spanish: Hola Jesus. Como estas?

*/
