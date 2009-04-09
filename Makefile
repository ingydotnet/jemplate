all: js/jemplate.js site-data.json

js/jemplate.js: jemplates Makefile
	jemplate --runtime --compile $< > $@

site-data.json: site-data.yaml Makefile
	perl -MYAML -MJSON \
		-e 'print objToJson(YAML::LoadFile(shift(@ARGV)))' \
		$< > $@

clean:
	rm -f js/jemplate.js site-data.json

