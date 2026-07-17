'use strict';

const fs = require('node:fs');
const { Glob } = require('glob');

/**
 * Karma 6 reads the legacy Glob#found and Glob#statCache properties. The workspace
 * intentionally pins a supported modern glob release, so adapt that API at test
 * configuration time instead of installing Karma's deprecated glob 7 dependency.
 */
function applyKarmaGlobCompatibility() {
  if (!Object.getOwnPropertyDescriptor(Glob.prototype, 'found')) {
    Object.defineProperty(Glob.prototype, 'found', {
      configurable: true,
      get() {
        return this.walkSync().map((filePath) => filePath.replaceAll('\\', '/'));
      }
    });
  }

  if (!Object.getOwnPropertyDescriptor(Glob.prototype, 'statCache')) {
    Object.defineProperty(Glob.prototype, 'statCache', {
      configurable: true,
      get() {
        return new Proxy(Object.create(null), {
          get(target, filePath) {
            if (typeof filePath !== 'string') {
              return undefined;
            }

            target[filePath] ??= fs.statSync(filePath);
            return target[filePath];
          }
        });
      }
    });
  }
}

module.exports = { applyKarmaGlobCompatibility };
