import {
  CompleteValidationDisplayClassMap,
  RequiredIndicatorConfig,
  ValidationDisplayClassMap,
  ValidationDisplayConfig
} from '../interfaces/validation-display.interface';
import {
  BOOTSTRAP_DISPLAY_CLASSES,
  DEFAULT_ERROR_ELEMENT_TAG,
  DEFAULT_REQUIRED_MARKER,
  GENERIC_DISPLAY_CLASSES,
  TAILWIND_DISPLAY_CLASSES
} from './validation-display.constants';

export const DEFAULT_REQUIRED_INDICATOR: RequiredIndicatorConfig = {
  mode: 'inline-suffix',
  marker: DEFAULT_REQUIRED_MARKER,
  markerClass: GENERIC_DISPLAY_CLASSES.requiredMarker
};

export const BOOTSTRAP_REQUIRED_INDICATOR: RequiredIndicatorConfig = {
  mode: 'inline-suffix',
  marker: DEFAULT_REQUIRED_MARKER,
  markerClass: BOOTSTRAP_DISPLAY_CLASSES.requiredMarker
};

export const BOOTSTRAP_TOOLTIP_REQUIRED_INDICATOR: RequiredIndicatorConfig = {
  mode: 'tooltip',
  tooltipText: 'Required field'
};

export function mergeDisplayClasses(
  base: CompleteValidationDisplayClassMap,
  overrides?: Partial<ValidationDisplayClassMap>
): CompleteValidationDisplayClassMap {
  if (!overrides) {
    return { ...base };
  }

  const merged = { ...base };
  (Object.keys(overrides) as Array<keyof ValidationDisplayClassMap>).forEach((key) => {
    const value = overrides[key];
    if (value !== undefined && value !== null && value !== '') {
      merged[key] = value;
    }
  });
  return merged;
}

/** Maps legacy flat config fields onto the typed class map. */
export function classesFromLegacyConfig(
  config: ValidationDisplayConfig,
  defaults: CompleteValidationDisplayClassMap
): CompleteValidationDisplayClassMap {
  const legacyOverrides: Partial<ValidationDisplayClassMap> = {};

  if (config.invalidClass !== undefined) {
    legacyOverrides.invalid = config.invalidClass;
  }
  if (config.errorClass !== undefined) {
    legacyOverrides.error = config.errorClass;
  }
  if (config.errorContainerClass !== undefined) {
    legacyOverrides.errorContainer = config.errorContainerClass;
  }
  if (config.requiredMarkerClass !== undefined) {
    legacyOverrides.requiredMarker = config.requiredMarkerClass;
  }

  return mergeDisplayClasses(defaults, { ...legacyOverrides, ...config.classes });
}

export function resolveRequiredIndicator(
  config: ValidationDisplayConfig,
  presetDefault: RequiredIndicatorConfig
): RequiredIndicatorConfig {
  const indicator = config.requiredIndicator ?? presetDefault;

  return {
    mode: indicator.mode ?? presetDefault.mode,
    marker: config.requiredMarker ?? indicator.marker ?? presetDefault.marker ?? DEFAULT_REQUIRED_MARKER,
    markerClass:
      config.requiredMarkerClass
      ?? indicator.markerClass
      ?? presetDefault.markerClass
      ?? GENERIC_DISPLAY_CLASSES.requiredMarker,
    tooltipText: indicator.tooltipText ?? presetDefault.tooltipText
  };
}

export function resolvePreset(config: ValidationDisplayConfig): ValidationDisplayConfig['preset'] {
  if (config.preset) {
    return config.preset;
  }

  if (config.framework === 'material') {
    return 'material';
  }

  if (config.invalidClass === BOOTSTRAP_DISPLAY_CLASSES.invalid
    || config.errorClass?.includes('bootstrap')) {
    return 'bootstrap';
  }

  if (config.errorClass?.startsWith('tw-') || config.invalidClass?.startsWith('tw-')) {
    return 'tailwind';
  }

  return config.framework ?? 'auto';
}

export function resolveValidationDisplayConfig(
  options: ValidationDisplayConfig = {}
): ValidationDisplayConfig {
  const preset = resolvePreset(options);

  if (options.strategy) {
    return { ...options, preset };
  }

  const defaults =
    preset === 'bootstrap' ? BOOTSTRAP_DISPLAY_CLASSES
    : preset === 'tailwind' ? TAILWIND_DISPLAY_CLASSES
    : GENERIC_DISPLAY_CLASSES;

  const classes = classesFromLegacyConfig(options, defaults);
  const requiredIndicator = resolveRequiredIndicator(options, DEFAULT_REQUIRED_INDICATOR);

  return {
    ...options,
    preset,
    classes,
    requiredIndicator,
    invalidClass: classes.invalid,
    errorClass: classes.error,
    errorContainerClass: classes.errorContainer,
    requiredMarkerClass: classes.requiredMarker,
    requiredMarker: requiredIndicator.marker,
    errorElementTag: options.errorElementTag ?? DEFAULT_ERROR_ELEMENT_TAG
  };
}

export function getResolvedClassMap(config: ValidationDisplayConfig): CompleteValidationDisplayClassMap {
  const preset = resolvePreset(config);
  const defaults =
    preset === 'bootstrap' ? BOOTSTRAP_DISPLAY_CLASSES
    : preset === 'tailwind' ? TAILWIND_DISPLAY_CLASSES
    : GENERIC_DISPLAY_CLASSES;

  return classesFromLegacyConfig(config, defaults);
}
