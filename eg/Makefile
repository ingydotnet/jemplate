PERL5LIB = ../lib

all: js/ajax.js js/hello.js js/features.js js/kittys.js

js/ajax.js: Makefile
	perl ../jemplate --compile ajax/template/* > $@

js/hello.js: Makefile
	perl ../jemplate --compile hello/templates/* > $@

js/features.js: Makefile
	perl ../jemplate --compile features/templates/* > $@

js/kittys.js: Makefile
	perl ../jemplate --compile kittys/templates/* > $@
