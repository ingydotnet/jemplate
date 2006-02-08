#!/bin/sh

perl ./jemplate --compile test/hello/templates/* > test/js/hello.js
perl ./jemplate --compile test/features/templates/* > test/js/features.js
