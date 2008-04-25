.PHONY: fetch runtime

GRAMMAR_MODULE=../lib/Jemplate/Grammar.pm
RUNTIME_MODULE=../lib/Jemplate/Runtime.pm
RUNTIME_COMPACT_MODULE=../lib/Jemplate/Runtime/Compact.pm

all: $(GRAMMAR_MODULE) $(RUNTIME_MODULE) $(RUNTIME_COMPACT_MODULE)

runtime: $(RUNTIME_MODULE) $(RUNTIME_COMPACT_MODULE)

$(GRAMMAR_MODULE): parser
	(cd parser; ./yc)
	mv parser/Grammar.pm $@
	rm parser/Parser.output

#$(RUNTIME_MODULE): Makefile Runtime.pm Jemplate.js Jemplate
$(RUNTIME_MODULE): Runtime.pm _force
	tpage Runtime.pm > $@

$(RUNTIME_COMPACT_MODULE): Runtime_Compact.pm _force
	tpage Runtime_Compact.pm > $@

_force:
