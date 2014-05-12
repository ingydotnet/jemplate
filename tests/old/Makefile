.PHONY: deps run-files

INGY_JSAN_CODE=../../../ingy/jsan

all: run-files

deps: run
	cp -r $(INGY_JSAN_CODE)/Test-Base/sample/run/lib/ run/lib/
	cp -r $(INGY_JSAN_CODE)/Test-Base/sample/run/bin/ run/bin/
	cp -r $(INGY_JSAN_CODE)/Test-Base/sample/run/template/ run/template/

run:
	mkdir $@

run-files:
	make -C run clean all
