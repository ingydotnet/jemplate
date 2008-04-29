.PHONY: fetch runtime

JEMPLATE_SCRIPT=../bin/jemplate
GRAMMAR_MODULE=../lib/Jemplate/Grammar.pm
RUNTIME_MODULE=../lib/Jemplate/Runtime.pm
RUNTIME_COMPACT_MODULE=../lib/Jemplate/Runtime/Compact.pm
JEMPLATE_MODULES=$(GRAMMAR_MODULE) $(RUNTIME_MODULE) $(RUNTIME_COMPACT_MODULE)

all: $(JEMPLATE_SCRIPT)

$(JEMPLATE_SCRIPT): $(JEMPLATE_MODULES) _force
	./bin/make-standalone-script ../jemplate > $@
	chmod +x $@

runtime: $(RUNTIME_MODULE) $(RUNTIME_COMPACT_MODULE)

$(GRAMMAR_MODULE): parser _force
	(cd parser; ./yc)
	mv parser/Grammar.pm $@
	rm parser/Parser.output

#$(RUNTIME_MODULE): Makefile Runtime.pm Jemplate.js Jemplate
$(RUNTIME_MODULE): lib/Jemplate/Runtime.pm _force
	tpage $< > $@

$(RUNTIME_COMPACT_MODULE): lib/Jemplate/Runtime/Compact.pm _force
	tpage $< > $@

_force:
