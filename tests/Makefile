all: basics.t.html join.t.html index.html jemplate.js

index.html: template/index.html bin/render-template
	perl bin/render-template template/index.html index.html

basics.t.html: template/test.t.html bin/render-template
	perl bin/render-template template/test.t.html basics.t.html

join.t.html: template/test.t.html bin/render-template
	perl bin/render-template template/test.t.html join.t.html

jemplate.js:
	jemplate --compile jemplate/* > jemplate.js
