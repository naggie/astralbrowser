all: deps build

build:
	rm -rf public/build
	npm run build
	touch public/build/astralbrowser.css # may not exist
	sed -i'' '1s;^;/* stylelint-disable */\n;' public/build/astralbrowser.css
	sed -i'' '1s;^;/* eslint-disable */\n;' public/build/astralbrowser.js

deps:
	npm install

dev_server:
	npm run dev
