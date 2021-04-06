f = *

init:
	yarn install

test:
	$$(yarn bin)/mocha -r ts-node/register src/$(f)_test.ts --timeout 200 --slow 10 --check-leaks

doc:
	$$(yarn bin)/mocha -r ts-node/register src/csp_doc.ts

build: test compile
	
compile:
	rm -rf dist
	# $$(yarn bin)/tsc							# Node Distribution
	$$(yarn bin)/tsc --module es6 --outDir dist	# Deno Distribution
	cp src/csp.ts dist/csp.ts
	cp package.json dist/package.json
	cp readme.md dist/readme.md

publish: compile
	npm publish dist --access public

git:
	git config --global user.email $(email)

gitpod:
	gp env GIT_COMMITTER_EMAIL=$(email)
	gp env GIT_AUTHOR_EMAIL=$(email)
