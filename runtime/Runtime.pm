package Jemplate::Runtime;
use strict;
use warnings;

sub main {
    <<'...';
[% INCLUDE Jemplate.js -%]
...
}

sub xxx {
    <<'...';
[% INCLUDE Jemplate/XXX.js -%]
...
}

sub ajax {
    <<'...';
[% INCLUDE Jemplate/Ajax.js -%]
...
}

sub json {
    <<'...';
[% INCLUDE Jemplate/JSON.js -%]
...
}

1;
