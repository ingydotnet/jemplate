# ALL_T_HTML="shell(ls -1 *.t.js | perl -pe 's/js$$/html/')"
ALL_T_HTML=basics.t.html join.t.html list.t.html 
ALL_TARGETS=${ALL_T_HTML} index.html jemplate.js

all: $(ALL_T_HTML) index.html jemplate.js

index.html: template/index.html bin/render-template
	perl bin/render-template $< $@

basics.t.html: template/test.t.html bin/render-template
	perl bin/render-template $< $@

join.t.html: template/test.t.html bin/render-template
	perl bin/render-template $< $@

list.t.html: template/test.t.html bin/render-template
	perl bin/render-template $< $@

jemplate.js: jemplate
	jemplate --compile jemplate/* > $@

jemplate:
	perl bin/pull-jemplates

clean:
	rm -fr jemplate $(ALL_TARGETS)
