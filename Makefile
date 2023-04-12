develop:
	npx webpack serve

install:
	npm ci

build:
	NODE_ENV=production npx webpack

test:
	npm run test

test-e2e:
	npm run test-e2e

lint:
	npx eslint .

.PHONY: test
