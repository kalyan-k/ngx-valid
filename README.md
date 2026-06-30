# ngx-valid

Angular validation library with policy-based rules and pluggable error display.

## Workspace Structure

```
ngx-valid/
├── projects/
│   ├── core/              # Publishable library (npm: ngx-valid)
│   └── demo-app/          # Demo application
├── angular.json
└── package.json
```

## Development

```bash
# Install dependencies
npm install

# Build the library (required before serving demo)
npm run build-core

# Run demo app
npm start

# Build library in watch mode (separate terminal)
npm run build-core -- --watch --configuration development
```

## Demo Routes

| Route | Description |
|-------|-------------|
| `/sample-form` | Single form with all HTML control types |
| `/complex-form` | Multiple forms with nested models and conditional validation |

## Library Documentation

See [projects/core/README.md](projects/core/README.md) for API documentation and usage examples.

## License

MIT
