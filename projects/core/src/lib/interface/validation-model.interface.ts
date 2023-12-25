export interface ValidationModel {
    validationResults: Array<{ propertyName: string, error: Error }>;
    requiredResults: Array<{}>;
    formGroup: { [key: string]: {} };
}
