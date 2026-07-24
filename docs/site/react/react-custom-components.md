# Custom Components

The adapter is intentionally not tied to package-owned visual controls. A custom component needs a value, a change callback, blur/touch behavior, and accessible error state.

## Generic custom control

```tsx
const field = useValidationField(form, 'department');

<DepartmentPicker
  id={field.id}
  value={String(field.value ?? '')}
  invalid={field.invalid}
  describedBy={field.invalid ? field.messageId : undefined}
  onChange={(value) => {
    void form.setFieldValue('department', value, true);
  }}
  onBlur={() => {
    form.touchField('department');
    void field.validate();
  }}
/>
<ValidationMessage id={field.messageId} errors={field.visibleErrors} />
```

## Design-system example

For Material UI, Chakra UI, Ant Design, or a similar library, map:

- `field.value` to the component's value prop.
- `field.invalid` to its error/invalid prop.
- `field.messageId` to the component's described-by/input-props API.
- the library's value callback to `form.setFieldValue`.
- its blur callback to `form.touchField` and optional `field.validate`.

Do not spread native `inputProps` into a component whose change callback does not receive a DOM event. Use the explicit mapping above.

## Forwarded refs and focus

The adapter does not own input refs. Forward refs through the custom component and focus the first invalid control from the submit invalid callback or validation summary.

## Accessible labels

Keep a visible label associated with the actual focusable input. The package supplies error relationships but cannot infer a design system's label structure.
