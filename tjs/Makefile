.PHONY: all prepare-var-jt var clean help
.PHONY: test-all test test-jquery test-yui runtime runtime-jquery runtime-yui

T_JS := $(wildcard t/*t.js)
T_HTML := $(T_JS:t/%.t.js=var/%.t.html)
JEMPLATE := perl -I../lib ../jemplate
RUNTIME_JS := var/runtime.js

help:
	@echo
	@echo -e "\t$(MAKE) test-all"
	@echo
	@echo -e "\t$(MAKE) test"
	@echo -e "\t$(MAKE) test-jquery"
	@echo -e "\t$(MAKE) test-yui"
	@echo -e "\t$(MAKE) clean"
	@echo

all: var $(T_HTML) var/index.html var/runtime.js var/jt.js var/jt-greeting.js
	(cd var && ln -snf ../js . && ln -snf ../t/*.js .)

test-all:
	./bin/test-run

test: all runtime
	(cd var && ../bin/daemon -p 8081)

test-jquery: all runtime-jquery
	(cd var && ../bin/daemon -p 8081)

test-yui: all runtime-yui
	(cd var && ../bin/daemon -p 8081)

runtime:
	$(JEMPLATE) --runtime > $(RUNTIME_JS)

runtime-jquery:
	$(JEMPLATE) --runtime=jquery > $(RUNTIME_JS)

runtime-yui:
	$(JEMPLATE) --runtime=yui > $(RUNTIME_JS)

var:
	mkdir -p var
	rsync -Cav htdocs/ var/

$(T_HTML): var/%.t.html: tt/test.html t/%.t.js
	./bin/render-template $< $@

var/index.html: tt/index.html t/*.t.js
	./bin/render-template $< $@

$(RUNTIME_JS):
	$(JEMPLATE) --runtime > $(RUNTIME_JS)

var/jt.js: prepare-var-jt
	$(JEMPLATE) --compile var/jt/* > $@

var/jt-greeting.js:
	$(JEMPLATE) --compile jt-greeting --start-tag='<!' --end-tag='!>' --any-case --post-chomp > $@

prepare-var-jt:
	./bin/prepare-var-jt

clean:
	rm -rf var
