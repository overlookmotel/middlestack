// --------------------
// middlestack module
// Tests
// --------------------

// modules
var chai = require('chai'),
	expect = chai.expect,
	middlestack = require('../lib/');

// init
chai.config.includeStack = true;

// tests

/* jshint expr: true */
/* global describe, it */

describe('Tests', function() {
	it('Test', function() {
		expect(middlestack).to.be.ok;
	});
});
