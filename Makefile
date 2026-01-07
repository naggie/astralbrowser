all: deps build

build:
	rm -rf public/build
	mkdir -p public/build
	./node_modules/.bin/svelte-check
	npm run build
	# disable eslint as this is a built product
	sed -i'' '1s;^;/* stylelint-disable */\n;' public/build/astralbrowser.css
	sed -i'' '1s;^;/* eslint-disable */\n;' public/build/astralbrowser.js
	# I was confused for a day before I realised the built code was RE-ENABLING LINTING. WTF
	sed -i'' 's;eslint-enable;eslint-disable;g' public/build/astralbrowser.js

deps:
	npm install

dev_server:
	npm run dev

demo: deps build
	FAKEINDEX_NOAUTOINDEX=1 test -d ./public/tree || ./etc/fakeindex.py
	cp ./etc/DEMO-README.md ./public/tree/README.md
	nginx -c $(shell pwd)/etc/nginx.conf -p $(shell pwd)

pages: deps build
	test ! -d public/tree || rm -rf public/tree
	FAKEINDEX_DELETEFILES=1 ./etc/fakeindex.py
	cp ./etc/DEMO-README.md ./public/tree/README.md
	cp ./etc/demo-index.json ./public/tree/index.html
