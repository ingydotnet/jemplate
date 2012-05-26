.PHONY: fetch runtime js

JEMPLATE_SCRIPT=../bin/jemplate
JEMPLATE_STANDALONE_SCRIPT=../jemplate
GRAMMAR_MODULE=../lib/Jemplate/Grammar.pm
RUNTIME_MODULE=../lib/Jemplate/Runtime.pm
RUNTIME_COMPACT_MODULE=../lib/Jemplate/Runtime/Compact.pm
JEMPLATE_MODULES=$(GRAMMAR_MODULE) $(RUNTIME_MODULE) $(RUNTIME_COMPACT_MODULE)

all: js $(JEMPLATE_STANDALONE_SCRIPT)

js:
	$(MAKE) -C js

$(JEMPLATE_STANDALONE_SCRIPT): $(JEMPLATE_MODULES) _force
	./bin/make-standalone-script $(JEMPLATE_SCRIPT) > $@
	chmod +x $@

$(GRAMMAR_MODULE): parser _force
	(cd parser; ./yc)
	mv parser/Grammar.pm $@
	rm parser/Parser.output

$(RUNTIME_MODULE): lib/Jemplate/Runtime.pm _force
	bin/tpage $< > $@

$(RUNTIME_COMPACT_MODULE): lib/Jemplate/Runtime/Compact.pm _force
	bin/tpage $< > $@

_force:
