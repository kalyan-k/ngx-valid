# Angular Best Practices

## Register once per feature

Register stable policies during feature initialization. Use `replacePolicy()` only for generated fields.

## Keep paths aligned

`validateModel`, policy paths, and model shape must describe the same property.

## Prefer display strategies

Use a display strategy for CSS classes and error containers instead of duplicating markup in every control.

## Clean up dynamic registrations

Lazy-loaded features and generated forms should unregister policies, groups, and stale validation state when they are destroyed.

## Performance

Validate focused fields during interaction and whole policies during submit. For large generated forms, build policy metadata once per generation and validate groups when possible.

## Testing

Test directives, summaries, group status, invalid classes, and valid submission behavior.
