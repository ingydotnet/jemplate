#!/bin/sh

perl ./jemplate --compile examples/hello/templates/* > examples/js/hello.js
perl ./jemplate --compile examples/features/templates/* > examples/js/features.js
