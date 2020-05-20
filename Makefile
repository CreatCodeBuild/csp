init:
	yarn install

test:
	$$(yarn bin)/mocha -r ts-node/register src/csp_test.ts

build: test compile
	
compile:
	rm -rf dist
	# $$(yarn bin)/tsc							# Node Distribution
	$$(yarn bin)/tsc --module es6 --outDir dist	# Deno Distribution
