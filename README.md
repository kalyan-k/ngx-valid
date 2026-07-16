# ngx-valid

Angular validation library with policy-based rules and pluggable error display.

## Recommended Project Shape

Keep this as a single Angular workspace:

```text
ngx-valid/
|-- projects/
|   |-- core/       # Library source. npm package name: ngx-valid
|   `-- demo-app/   # Private demo application
|-- angular.json
|-- package.json    # Private workspace package
`-- dist/ngx-valid/ # Generated publish artifact
```

This is the best fit right now because the demo app should stay close to the library and exercise the same public API that npm consumers use. The root package is private, so it cannot be published by mistake. Only the compiled library artifact in `dist/ngx-valid` is intended for npm.

Split the demo into a separate repository only if it needs its own deployment cadence, issue tracker, or dependencies that become noisy for library development. Use a larger monorepo/workspaces setup only when you add more publishable packages.

## Development

```bash
npm install

# Build the publishable library only
npm run build:lib

# Serve the demo app
npm start

# Watch the library in a separate terminal while developing
npm run watch:lib

# Build the demo app after building the library
npm run build:demo
```

The demo imports from `ngx-valid`, not from an internal `core` alias, so it behaves like a real consumer of the npm package.

## Publishing

Before publishing, update the version in `projects/core/package.json`.

```bash
# Verify the files npm would publish
npm run pack:lib

# Publish the package to npmjs.com
npm run publish:lib
```

The publish script builds the library in Angular partial compilation mode and publishes `dist/ngx-valid`.

## Library Documentation

See [projects/core/README.md](projects/core/README.md) for installation, API usage, and examples.

## License

MIT - see [LICENSE](LICENSE).
