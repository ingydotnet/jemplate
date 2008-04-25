.PHONY: all clean jemplate

ALL_T_HTML:=$(shell ls -1 ../*.t.js | perl -pe 's/js$$/html/;s/^\.\.\///')

ALL_TARGETS:=$(ALL_T_HTML) index.html JemplateRuntime.js jemplate.js jemplate2.js

all: $(ALL_TARGETS)
	ln -fs ../Test .
	ln -fs ../*.t.js .
	ln -fs ../jquery*.js .

%.t.html: template/test.html
	perl bin/render-template $< $@

index.html: template/index.html ../*.t.js
	perl bin/render-template $< $@

JemplateRuntime.js:
	perl -I../../lib ../../jemplate --runtime=yui > $@
#	perl -I../../lib ../../jemplate --runtime > $@

jemplate.js: jemplate ../*.t.js
	perl -I../../lib ../../jemplate --compile jemplate/* > $@

jemplate2.js: jemplate2
	perl -I../../lib ../../jemplate --compile jemplate2 \
		--start-tag='<!' --end-tag='!>' --any-case --post-chomp > $@

jemplate: ../*.t.js
	perl bin/pull-jemplates

clean:
	rm -fr $(ALL_TARGETS) jemplate/* *.t.js Test

html:
	mkdir html
