.PHONY: all clean jemplate

ALL_T_HTML:=$(shell ls -1 ../*.t.js | perl -pe 's/js$$/html/;s/^\.\.\///')

ALL_TARGETS:=$(ALL_T_HTML) index.html jemplate.js

all: $(ALL_TARGETS)

%.t.html: template/test.html
	perl bin/render-template $< $@

index.html: template/index.html ../*.t.js
	perl bin/render-template $< $@

jemplate.js: jemplate ../*.t.js
	perl -I../../lib ../../jemplate --compile jemplate/* > $@

jemplate: ../*.t.js
	perl bin/pull-jemplates

clean:
	rm -fr $(ALL_TARGETS) jemplate/*

html:
	mkdir html
