all: html/Jemplate.html text/Jemplate.text

html/Jemplate.html: ../lib/Jemplate.pm
	pod2html ../lib/Jemplate.pm > html/Jemplate.html
	rm pod2htm*.tmp

text/Jemplate.text: ../lib/Jemplate.pm
	pod2text ../lib/Jemplate.pm > text/Jemplate.text


