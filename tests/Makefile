all: basics.t.html join.t.html list.t.html index.html jemplate.js

index.html: template/index.html bin/render-template
	perl bin/render-template template/index.html index.html

basics.t.html: template/test.t.html bin/render-template
	perl bin/render-template template/test.t.html basics.t.html

join.t.html: template/test.t.html bin/render-template
	perl bin/render-template template/test.t.html join.t.html

list.t.html: template/test.t.html bin/render-template
	perl bin/render-template template/test.t.html list.t.html

jemplate.js: jemplate/*
	jemplate --compile jemplate/* > jemplate.js
