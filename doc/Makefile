all: html/Jemplate.html text/Jemplate.text

html/Jemplate.html: ../lib/Jemplate.pm html
	pod2html $< > $@
	rm pod2htm*.tmp

text/Jemplate.text: ../lib/Jemplate.pm text
	pod2text $< > $@

html text:
	mkdir $@

clean:
	rm -fr html text
