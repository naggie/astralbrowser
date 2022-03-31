all: deps build

build:
	rm -rf public/build
	mkdir -p public/build
	echo ' ' > public/build/astralbrowser.css # may not exist due to https://github.com/darionco/rollup-plugin-web-worker-loader/issues/60
	npm run build
	sed -i'' '1s;^;/* stylelint-disable */\n;' public/build/astralbrowser.css
	sed -i'' '1s;^;/* eslint-disable */\n;' public/build/astralbrowser.js

deps:
	npm install

dev_server:
	npm run dev
