ALL_T_HTML:=$(shell ls -1 *.t.js | perl -pe 's/js$$/html/')

ALL_TARGETS:=$(ALL_T_HTML) index.html jemplate.js

all: $(ALL_T_HTML) index.html jemplate.js

%.t.html: template/test.html bin/render-template
	perl bin/render-template $< $@

index.html: template/index.html bin/render-template *.t.js
	perl bin/render-template $< $@

jemplate.js: jemplate *.t.js
	perl -I../lib ../jemplate --compile jemplate/* > $@

jemplate: *.t.js
	perl bin/pull-jemplates

clean:
	rm -fr jemplate $(ALL_TARGETS)
