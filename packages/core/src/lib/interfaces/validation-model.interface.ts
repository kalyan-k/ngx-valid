import { FormGroupStatus } from './validation-result.interface';

export interface ValidationModel {
    validationResults?: Array<{ propertyName: string; error: { message: string } }>;
    requiredResults?: Array<{ propertyName: string; isRequired: boolean; hasRequiredError: boolean }>;
    [groupName: string]: FormGroupStatus | unknown;
}

export { FormGroupStatus };
