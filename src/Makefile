GRAMMAR_MODULE=../lib/Jemplate/Grammar.pm
RUNTIME_MODULE=../lib/Jemplate/Runtime.pm

all: $(GRAMMAR_MODULE) $(RUNTIME_MODULE)

$(GRAMMAR_MODULE): parser
	(cd parser; ./yc)
	mv parser/Grammar.pm $@
	rm parser/Parser.output

$(RUNTIME_MODULE): Makefile Runtime.pm Jemplate.js Jemplate
	tpage Runtime.pm > $@
