var expect  = require('chai').expect;
var pwstr = require('passwd-strength');
var insecurity = require('./mod_insecurity')

describe("Redirection Security Unit Tests", function() {
  it("Redirection outside whitelist is forbidden", function(done) {
    expect(insecurity.isRedirectAllowed('https://www.evilsite.local')).to.be.false
    done()
  });
  it("Redirection outside whitelist with whitelisted URL as a parameter is forbidden", function(done) {
    expect(insecurity.isRedirectAllowed('https://evilsite.local/?https://github.com/bkimminich/juice-shop')).to.be.false
    done()
  });
  it("Redirection outside whitelist with whitelisted URL separated by null byte is forbidden", function(done) {
    expect(insecurity.isRedirectAllowed('https://evilsite.local/\0https://github.com/bkimminich/juice-shop')).to.be.false
    done()
  });
});

describe("Crypto Secret Strength", function() {
  it("Resist JWT Brute Force - Secret Strength > 100", function(done) {
    expect(pwstr(insecurity.defaultSecret)).to.be.at.least(100)
    done()
  });
});
