.PHONY: got_rhino check fetch compact clean

CURL := curl
JS := $(shell which rhino)
JAVA := java
RM := rm

DOT_JS := ajax-jquery.js ajax-xhr.js ajax-yui.js json-json2-internal.js json-json2.js json-yui.js json2.js kernel.js xhr-gregory.js xhr-ilinsky.js xxx.js

DOT_COMPACT_JS := $(DOT_JS:%.js=%.compact.js)

all: got_rhino check

check: $(DOT_COMPACT_JS) $(DOT_JS)
	for file in $^; do $(JS) -e "window={Function:{prototype:{}},document:{}};Jemplate={};" $$file && echo $$file pass; done

got_rhino:
	@if [ -z "$(JS)" ]; then echo "ERROR: The 'rhino' executable is required"; exit 1; fi

compact: $(DOT_COMPACT_JS)

$(DOT_COMPACT_JS): %.compact.js: %.js
	$(JAVA) -jar yuicompressor.jar $< -o $@

fetch: xhr-gregory.js xhr-ilinsky.js json2.js

xhr-gregory.js:
	$(CURL) http://www.scss.com.au/scripts/xmlhttprequest.js -o $@

xhr-ilinsky.js:
	$(CURL) http://xmlhttprequest.googlecode.com/svn/trunk/source/XMLHttpRequest.js -o $@

json2.js:
	$(CURL) http://www.json.org/json2.js -o $@

clean:
	$(RM) -f $(DOT_COMPACT_JS)
