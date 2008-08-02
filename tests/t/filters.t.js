var t = new Test.Jemplate();

var filters = {
    jemplate: 'jemplate_process'
};

/*
#     Failed test
#          got: "my%20file.html
# my%3Cfile%20%26%20your%3Efile.html
# my%3Cfile%20%26%20your%3Efile.html
# guitar%26amp%3Bfile.html
# guitar%26amp%3Bfile.html
# "
#     expected: "my%20file.html
# my%3Cfile%20&amp;%20your%3Efile.html
# my%3Cfile%20&amp;amp;%20your%3Efile.html
# guitar&amp;amp;file.html
# guitar&amp;amp;amp;file.html
# "

my%20file.html
my%3Cfile%20&%20your%3Efile.html
my%3Cfile%20&amp;%20your%3Efile.html
guitar&amp;file.html
guitar&amp;amp;file.html

*/

t.plan(7);
t.filters(filters);
t.run_is('jemplate', 'output');

/* Test
=== Test indent
--- jemplate
filters_indent.html
[% FILTER indent -%]
1
2
3
4
[%- END %]
#
[% FILTER indent(3) -%]
1
2
3
4
[%- END %]
#
[% FILTER indent('2') -%]
1
2
3
4
[%- END %]
#
[% FILTER indent(0) -%]
1
2
3
4
[%- END %]
#
[% text = 'The cat sat on the mat';
   text | indent('> ') | indent('+') %]
--- output
    1
    2
    3
    4
#
   1
   2
   3
   4
#
  1
  2
  3
  4
#
1
2
3
4
#
+> The cat sat on the mat
=== Test truncate
--- jemplate
filters_truncate.html
[% a = '1234567890' -%]
[% a | truncate(5)  %]
[% a | truncate(10) %]
[% a | truncate(15) %]
[% a | truncate(2)  %]
[% a = '1234567890123456789012345678901234567890' -%]
[% a | truncate  %]
--- output
12...
1234567...
1234567890
...
12345678901234567890123456789...

=== Test null
--- jemplate
filters_null.html
[%- "Ils ont les chapeaux ronds, vive la bretagne" | null -%]
--- output
=== Test uri
--- jemplate
filters_uri.html
[% "my file.html" FILTER uri %]
[% "my<file & your>file.html" FILTER uri %]
[% "my<file & your>file.html" | uri | html %]
[% "guitar&amp;file.html" | uri %]
[% "guitar&amp;file.html" | uri | html %]
--- output
my%20file.html
my%3Cfile%20%26%20your%3Efile.html
my%3Cfile%20%26%20your%3Efile.html
guitar%26amp%3Bfile.html
guitar%26amp%3Bfile.html
=== Test html 
--- jemplate
filters_html.html
[% FILTER html %]This is some html text
All the <tags> should be escaped & protected
[% END %]
[% text = "The <cat> sat on the <mat>" %]
[% text FILTER html %]
[% FILTER html %]
"It isn't what I expected", he replied.[% END %]
--- output
This is some html text
All the &lt;tags&gt; should be escaped &amp; protected


The &lt;cat&gt; sat on the &lt;mat&gt;

&quot;It isn't what I expected&quot;, he replied.

=== Test repeat
--- jemplate
filters_repeat.html
[% "foo..." FILTER repeat(5) %]
--- output
foo...foo...foo...foo...foo...

=== Test replace
--- jemplate
filters_replace.html
[%- text = "The cat sat on the mat" %]
[%- text FILTER replace(' ', '_') %]
[% text FILTER replace('sat', 'shat') +%]
[% text | replace('at', 'plat') +%]
[% text = 'The <=> operator, blah, blah' %]
[%- text | html | replace('blah', 'rhubarb') %]
--- output
The_cat_sat_on_the_mat
The cat shat on the mat
The cplat splat on the mplat
The &lt;=&gt; operator, rhubarb, rhubarb

*/
