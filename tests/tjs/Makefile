.PHONY: all prepare-var-jt var clean help
.PHONY: test-all test test-jquery test-yui runtime runtime-jquery runtime-yui

T_JS := $(wildcard ../t/*t.js)
T_HTML := $(T_JS:../t/%.t.js=var/%.t.html)
JEMPLATE := perl -I../../lib ../../jemplate
RUNTIME_JS := var/runtime.js

help:
	@echo
	@echo -e "\t$(MAKE) test-all"
	@echo
	@echo -e "\t$(MAKE) test"
	@echo -e "\t$(MAKE) test-jquery"
	@echo -e "\t$(MAKE) test-yui"
	@echo
	@echo -e "\t$(MAKE) run"
	@echo -e "\t$(MAKE) clean"
	@echo

all: \
	var \
	var/test.html \
	var/lib \
	var/js \
	var/t \
	$(T_HTML) \
	var/index.html \
	var/runtime.js \
	var/jt.js \
	var/jt-greeting.js

var/lib:
	(cd var && ln -s ../../lib lib)

var/js:
	(cd var && ln -s ../../js js)

var/t:
	(cd var && ln -s ../../t t)

test-all:
	(cd ../bin && ../test-run)

test: all runtime run

test-jquery: all runtime-jquery run

test-yui: all runtime-yui run

run:
	(cd var && ../../bin/daemon -p 8081)

runtime:
	$(JEMPLATE) --runtime=standard > $(RUNTIME_JS)

runtime-jquery:
	$(JEMPLATE) --runtime=jquery > $(RUNTIME_JS)

runtime-yui:
	$(JEMPLATE) --runtime=yui > $(RUNTIME_JS)

var:
	mkdir -p var

var/test.html:
	(cd var && ln -s ../../t/test.html)

$(T_HTML): var/%.t.html: ../template/test.html ../t/%.t.js
	../bin/render-template test.html $@

var/index.html: ../template/index.html ../t/*.t.js
	../bin/render-template index.html $@

$(RUNTIME_JS):
	$(JEMPLATE) --runtime > $(RUNTIME_JS)

var/jt.js: prepare-var-jt
	$(JEMPLATE) --compile var/jt/* > $@

var/jt-greeting.js:
	$(JEMPLATE) --compile ../jemplate2 --start-tag='<!' --end-tag='!>' --any-case --post-chomp > $@

prepare-var-jt:
	../bin/prepare-var-jt

clean:
	rm -rf var
