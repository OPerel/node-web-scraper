const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

exports.config = {
  framework: 'jasmine',
  allScriptsTimeout: 50000000,
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['scraper.js'],
  capabilites : {
    browser: 'chrome'
  },
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 50000000
  },
  onPrepare: () => {
    jasmine.getEnv().addReporter(new SpecReporter());
  },
}