export type PerformanceControlType =
  | 'text'
  | 'email'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'select'
  | 'textarea'
  | 'radio';

export interface PerformanceFieldDef {
  id: string;
  type: PerformanceControlType;
  label: string;
  propertyPath: string;
  groupName: string;
  policyName: string;
  selectOptions?: string[];
  radioOptions?: { value: string; label: string }[];
  dependsOn?: string;
}

export interface PerformanceSectionMeta {
  id: string;
  title: string;
  groupName: string;
  policyName: string;
  fields: PerformanceFieldDef[];
}

export interface PerformanceConfig {
  sectionCount: number | null;
  controlsPerSection: number | null;
  seed: number;
}

export interface PerformanceMetrics {
  generatedAt?: string;
  generationMs: number;
  renderMs: number;
  totalSections: number;
  totalControls: number;
  totalValidators: number;
  estimatedDirectives: number;
  lastValidateAllMs?: number;
  lastSubmitMs?: number;
  controlsPerSecond?: number;
}

export class PerformanceFormModel {
  config: PerformanceConfig = {
    sectionCount: null,
    controlsPerSection: null,
    seed: 42
  };

  sections: Record<string, Record<string, unknown>> = {};

  validationResults?: Array<{ propertyName: string; error: { message: string } }>;
  requiredResults?: Array<{ propertyName: string; isRequired: boolean; hasRequiredError: boolean }>;
  perfConfig?: { isValid: boolean; isInValid: boolean; isEvaluated?: boolean };
  performance?: { isValid: boolean; isInValid: boolean; isEvaluated?: boolean; errors?: unknown[] };
}
