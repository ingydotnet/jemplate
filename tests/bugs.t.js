var t = new Test.Jemplate();
t.plan(1);
t.pass('XXX - Finish writing this test file');

/* Test
=== Foo
--- xxx
yyy

*/
// NODE CLASS

/*
=item * val = getName()

This returns the name assigned to this object by the serverside code.

If no name has been set, then this will return "E<lt>no nameE<gt>".

*/

/*
,getName: function () { return this.name ? this.name : '<no name>'; } */

/*

-----------------------------------------
// JEMPLATE CALL

while(!iterator.atEnd()) {
  var node = iterator.get();
  tableBody += Jemplate.process('nl_table_row.html', { node: node, mode: this.mode });
}
this.viewer.innerHTML += tableBody;

------------------------------------------
// TEMPLATE

<tr>
  <td>
    <a href="" id="node-[% node.id %]-list-item">
    [% node.getName() %] - [% node.name %]
    </a>
  </td>
  [% IF mode == 'updated' %]
  <td id="node-[% node.id %]-list-timestamp">
    [% node.updated_on_formatted %]
  </td>
  [% END %]
</tr>

-------------------------------------------

// node.getName() outputs nothing, but node.name outputs correctly. the getName() method definitely works.

*/
