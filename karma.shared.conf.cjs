'use strict';

const path = require('node:path');
const { applyKarmaGlobCompatibility } = require('./tools/karma-glob-compat.cjs');
const persistentTestResultsReporter = require('./tools/testing/persistent-test-results-reporter.cjs');

applyKarmaGlobCompatibility();

function configureKarma(config, projectName) {
  const sourceRoots = {
    core: path.join(__dirname, 'packages', 'core'),
    angular: path.join(__dirname, 'packages', 'angular'),
    'angular-demo': path.join(__dirname, 'apps', 'angular-demo')
  };
  const sourceRoot = sourceRoots[projectName];
  if (!sourceRoot) {
    throw new Error(`Unknown Karma project: ${projectName}`);
  }

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      persistentTestResultsReporter,
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false,
      jasmine: {
        random: true,
        seed: '20260715'
      }
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    persistentTestResultsReporter: {
      projectName,
      outputDir: path.join(__dirname, 'reports', projectName),
      sourceRoot
    },
    coverageReporter: {
      dir: path.join(__dirname, 'reports', projectName, 'coverage'),
      subdir: '.',
      fixWebpackSourcePaths: true,
      reporters: [
        { type: 'text-summary' },
        { type: 'html' },
        { type: 'lcovonly', file: 'lcov.info' },
        { type: 'json-summary', file: 'coverage-summary.json' }
      ],
      check: {
        global: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'persistent-test-results'],
    browsers: ['ChromeHeadlessLocal'],
    customLaunchers: {
      ChromeHeadlessLocal: {
        base: 'ChromeHeadless',
        flags: ['--disable-gpu']
      },
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      }
    },
    browserDisconnectTolerance: 2,
    browserNoActivityTimeout: 30000,
    captureTimeout: 120000,
    restartOnFileChange: true
  });
}

module.exports = { configureKarma };
