.PHONY: all clean jemplate

ALL_T_HTML:=$(shell ls -1 ../t/*.t.js | perl -pe 's/js$$/html/;s/.*\///')

ALL_TARGETS=$(ALL_T_HTML) index.html JemplateRuntime.js jemplate.js jemplate2.js

JEMPLATES=../t/*.t.js
JEMPLATE=../../jemplate
LIB=../../LIB

all: $(ALL_TARGETS)

%.t.html: template/test.html
	perl bin/render-template $< $@

index.html: template/index.html $(JEMPLATES)
	perl bin/render-template $< $@

JemplateRuntime.js:
	perl -I$(LIB) $(JEMPLATE) --runtime=yui > $@
#	perl -I$(LIB) $(JEMPLATE) --runtime > $@

jemplate.js: jemplate $(JEMPLATES)
	perl -I$(LIB) $(JEMPLATE) --compile jemplate/* > $@

jemplate2.js: jemplate2
	perl -I$(LIB) $(JEMPLATE) --compile jemplate2 \
		--start-tag='<!' --end-tag='!>' --any-case --post-chomp > $@

jemplate: $(JEMPLATES)
	perl bin/pull-jemplates

clean:
	rm -fr $(ALL_TARGETS) jemplate/* *.t.js

html:
	mkdir html
