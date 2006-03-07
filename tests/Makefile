.PHONY: deps run-files

all: deps run-files

deps: run
	cp -r ../../jsan/Test-Base/sample/run/lib run/lib
	cp -r ../../jsan/Test-Base/sample/run/bin run/bin
	cp -r ../../jsan/Test-Base/sample/run/template run/template

run:
	mkdir $@

run-files:
	make -C run clean all
