'use strict';

const { configureKarma } = require('./karma.shared.conf.cjs');

module.exports = (config) => configureKarma(config, 'angular-demo');
