export interface DocSection {
  id: string;
  title: string;
  summary: string;
  bullets?: string[];
  code?: string;
}

export const DOC_SECTIONS: DocSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    summary: 'Policy Validation is a policy-based validation library for Angular template-driven forms. Validation rules live in reusable policy classes; the policyValidator directive wires controls to those policies and display strategies render errors for any UI framework.',
    bullets: [
      'Declarative policies instead of scattered Validators in components',
      'Supports conditional required fields via dependency expressions',
      'Form groups and policy groups for section/page-level status badges',
      'Pluggable ValidationDisplayStrategy (Bootstrap, Material, Tailwind/generic)'
    ]
  },
  {
    id: 'installation',
    title: 'Installation & Setup',
    summary: 'Install the library, import ValidationModule, register policies at startup, and configure a display strategy matching your UI toolkit.',
    code: `// app.module.ts
ValidationModule.forRoot({
  invalidClass: 'is-invalid',
  errorClass: 'invalid-feedback d-block',
  errorContainerClass: 'policy-validation-error-container',
  requiredMarkerClass: 'policy-validation-required-marker text-danger'
})

// validation.providers.ts (APP_INITIALIZER)
validationProvider.register('SampleForm', new SampleFormValidationPolicy());
validationProvider.registerFormGroupPolicy('mainForm', 'SampleForm');`
  },
  {
    id: 'policies',
    title: 'Validation Policies',
    summary: 'A ValidationPolicy describes all validators for a form or section. Implement addValidations(validatorHelper) and return an array of Validator instances built with fluent helpers.',
    bullets: [
      'One policy per logical form (SampleForm, PersonalInfo, PerfSection0, ...)',
      'Property paths are dot-notation on the model (personal.firstName, sections.section0.f1)',
      'Conditional rules: validatorHelper.validateFor(path, dependencyExpression)',
      'Policies are registered by name via ValidationProviderService.register()'
    ]
  },
  {
    id: 'directive',
    title: 'policyValidator Directive',
    summary: 'Attach policyValidator to native controls or fieldsets. The directive registers the control with its form group, runs field validation on blur/change, and delegates error rendering to the active display strategy.',
    code: `<input
  [(ngModel)]="model.email"
  policyValidator
  [validateModel]="'form.email'"
  [actualModel]="model"
  [withPolicy]="'SampleForm'"
  groupName="mainForm"
/>`
  },
  {
    id: 'groups',
    title: 'Form Groups & Policy Groups',
    summary: 'groupName on policyValidator ties fields to a form group badge (policy-validation-group-status). Policy groups aggregate multiple sections for page-level status and summaries.',
    bullets: [
      'registerFormGroupPolicy(groupName, policyName) links badge to policy',
      'registerPolicyGroup(key, { policies, formGroups }) for multi-section pages',
      'evaluateFormGroup() updates a single badge; evaluatePolicies() runs many policies',
      'updatePolicyGroupStatus() refreshes the combined page badge'
    ]
  },
  {
    id: 'display',
    title: 'Display Strategies',
    summary: 'ValidationDisplayStrategy controls how invalid states and messages appear in the DOM. Ship strategies for Bootstrap and Material, or use GenericValidationDisplayStrategy with your own CSS classes (e.g. Tailwind).',
    bullets: [
      'BootstrapValidationDisplayStrategy - is-invalid, invalid-feedback',
      'MaterialValidationDisplayStrategy - mat-error, mat-form-field-invalid',
      'GenericValidationDisplayStrategy - configurable classes (Tailwind-friendly)',
      'DefaultValidationDisplayStrategy - auto-detects Material in the DOM'
    ]
  },
  {
    id: 'components',
    title: 'Status & Summary Components',
    summary: 'Reusable UI components read validation state from the model. They subscribe to validation refresh events and work with OnPush change detection.',
    bullets: [
      'policy-validation-group-status - Valid / Invalid / Not validated badge',
      'policy-validation-group-summary - errors for one form group',
      'policy-validation-policy-group-status - combined badge across sections',
      'policy-validation-summary - all errors on the model after showAllErrors'
    ]
  },
  {
    id: 'api',
    title: 'ValidationProviderService API',
    summary: 'Central registry and orchestration service for policies, groups, and validation runs.',
    bullets: [
      'register(name, policy) / replacePolicy(name, policy) for static vs dynamic forms',
      'validateAll(model, policyName, { showAllErrors, evaluateGroups })',
      'evaluatePolicies(model, policyNames, policyGroupKey?)',
      'clearValidationState(model, policyNames) / notifyValidationRefresh(model)'
    ]
  },
  {
    id: 'demo-guide',
    title: 'Using This Demo',
    summary: 'Use the left navigation to switch UI frameworks. Each framework page has tabs for Sample, Complex, and Performance forms. Validation policies are shared; only markup and display strategies change.',
    bullets: [
      'Bootstrap - native controls + BootstrapValidationDisplayStrategy',
      'Angular Material - mat-form-field + MaterialValidationDisplayStrategy',
      'Tailwind - utility classes + GenericValidationDisplayStrategy',
      'Performance tab generates thousands of controls to benchmark validation'
    ]
  }
];
