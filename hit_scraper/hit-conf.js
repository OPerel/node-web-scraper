const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const tsNode = require('ts-node');

exports.config = {
  framework: 'jasmine',
  allScriptsTimeout: 50000000,
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./scraper.ts'],
  capabilites : {
    browser: 'chrome'
  },
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 50000000
  },
  onPrepare: () => {
    tsNode.register({
      project: require('path').join(__dirname, '../tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter());
  },
}
