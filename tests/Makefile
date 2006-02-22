all: index.html basics.t.html

index.html: template/index.html bin/render-template
	perl bin/render-template template/index.html index.html

basics.t.html: template/test.t.html bin/render-template
	perl bin/render-template template/test.t.html basics.t.html

jemplate.js:
	jemplate --compile jemplate/* > jemplate.js
