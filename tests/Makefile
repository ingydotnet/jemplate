.PHONY: all clean purge jemplate

T_JS := $(wildcard t/*t.js)
T_HTML := $(T_JS:t/%.t.js=%.t.html)

ALL_TARGETS=$(T_HTML) \
	    index.html \
	    js/JemplateRuntime.js \
	    js/jemplate.js \
	    js/jemplate2.js \

JEMPLATES=t/*.t.js
JEMPLATE := perl -I../lib ../jemplate

all: $(ALL_TARGETS)

%.t.html: template/test.html
	perl bin/render-template test.html $@

index.html: template/index.html $(JEMPLATES)
	perl bin/render-template index.html $@

js/JemplateRuntime.js:
	$(JEMPLATE) --runtime=standard > $@

js/jemplate.js: jemplate $(JEMPLATES)
	$(JEMPLATE) --compile jemplate/* > $@

js/jemplate2.js: jemplate2
	$(JEMPLATE) --compile jemplate2 \
		--start-tag='<!' --end-tag='!>' --any-case --post-chomp > $@

jemplate: $(JEMPLATES)
	perl bin/pull-jemplates

clean purge:
	rm -fr $(ALL_TARGETS) jemplate/* *.t.js

html:
	mkdir html
