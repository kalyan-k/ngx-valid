export interface ISampleForm {
    TextInput: string;
    EmailInput: string;
    PasswordInput: string;
    NumberInput: string;
    DateInput: string;
    Checkbox: boolean;
    Radiobox: string;
    Dropdown: string;
    Textarea: string;
}

export class SampleForm implements ISampleForm {
    TextInput: string;
    EmailInput: string;
    PasswordInput: string;
    NumberInput: string;
    DateInput: string;
    Checkbox: boolean;
    Radiobox: string;
    Dropdown: string;
    Textarea: string;

    constructor() {
        this.TextInput = "";
        this.EmailInput = "";
        this.PasswordInput = "";
        this.NumberInput = "";
        this.DateInput = "";
        this.Checkbox = false;
        this.Radiobox = "";
        this.Dropdown = "";
        this.Textarea = "";
    }
}
