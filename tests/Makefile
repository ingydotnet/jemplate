.PHONY: all clean purge

RENDERER:=$(shell echo `js-cpan Test/Base/bin/render-template`)
TEST_TEMPLATE:=$(shell echo `js-cpan Test/Base/template/test.html`)
INDEX_TEMPLATE:=$(shell echo `js-cpan Test/Base/template/index.html`)
TEST_LOCAL=template/test.html
INDEX_LOCAL=template/index.html

MD5SUM=perl -MDigest::MD5 -e \
    'open X,shift;$$d=Digest::MD5->new;$$d->addfile(*X);print $$d->hexdigest'

TEST_TEMPLATE_MD5=$(word 1,$(shell $(MD5SUM) $(TEST_TEMPLATE)))
TEST_LOCAL_MD5=$(word 1,$(shell $(MD5SUM) $(TEST_LOCAL)))
INDEX_TEMPLATE_MD5=$(word 1,$(shell $(MD5SUM) $(INDEX_TEMPLATE)))
INDEX_LOCAL_MD5=$(word 1,$(shell $(MD5SUM) $(INDEX_LOCAL)))

ALL_T_HTML:=$(shell ls -1 t/*.t.js | perl -pe 's/js$$/html/;s/^t\///')

ALL_DIRS:=lib template

ALL_TARGETS:=$(ALL_T_HTML) index.html

ALL_LIBS= \
	lib/Test/Base.js \
	lib/Test/Builder.js \
	lib/Test/Harness.js \
	lib/Test/Harness/Browser.js \

all: $(ALL_DIRS) $(ALL_TARGETS) $(ALL_LIBS)

clean:
	rm -fr $(ALL_TARGETS) $(ALL_LIBS)
	if [ "$(TEST_TEMPLATE_MD5)" = \
     "$(TEST_LOCAL_MD5)" ]; then rm -f $(TEST_LOCAL); fi
	if [ "$(INDEX_TEMPLATE_MD5)" = \
     "$(INDEX_LOCAL_MD5)" ]; then rm -f $(INDEX_LOCAL); fi
	-find $(ALL_DIRS) -depth -type d | xargs rmdir 2> /dev/null


purge: clean
	rm Makefile config.yaml

%.t.html: $(TEST_LOCAL)
	perl $(RENDERER) $(notdir $<) $(@:%.t.html=t/%.t.js) > $@

index.html: $(INDEX_LOCAL) t/*.t.js
	perl $(RENDERER) $(notdir $<) $(@:%.t.html=t/%.t.js) > $@

lib/Test/Base.js: lib/Test
	cp -f `js-cpan Test.Base` $@
# 	ln -s ../../../lib/Test/Base.js $@

lib/Test/Builder.js: lib/Test
	cp -f `js-cpan Test.Builder` $@

lib/Test/Harness.js: lib/Test
	cp -f `js-cpan Test.Harness` $@

lib/Test/Harness/Browser.js: lib/Test/Harness
	cp -f `js-cpan Test.Harness.Browser` $@

lib lib/Test lib/Test/Harness:
	mkdir -p $@

$(TEST_LOCAL):
	cp -f $(TEST_TEMPLATE) $@

$(INDEX_LOCAL):
	cp -f $(INDEX_TEMPLATE) $@

template:
	mkdir -p $@
