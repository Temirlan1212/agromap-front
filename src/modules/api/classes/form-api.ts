import { FormGroup } from '@angular/forms';
import { IFormState } from '../models/form-state.model';

export class FormApi {
  constructor() {}

  getState(form: FormGroup): IFormState {
    const value = form.getRawValue();
    const valid = form.valid;
    const touched = form.touched;
    form.markAllAsTouched();

    return { value, valid, touched };
  }

  setError(error: Record<string, any>, form: FormGroup): void {
    const errors = Object.entries(error).map(([k, v]) => [k.trim(), v]);

    for (const [field, e] of errors) {
      const pathArr = this.getArrayFromStringPath(field as string);
      let formControl: any = form;

      for (let path of pathArr) {
        if (formControl.controls[path] !== undefined) {
          formControl = formControl.controls[path];
        }
      }

      if (formControl != null) {
        formControl.setErrors(e);
      }
    }

    form.setErrors(Object.fromEntries(errors));
  }

  private getArrayFromStringPath(path: string): string[] {
    const result: string[] = [];

    for (let item of path.split('.')) {
      for (let splitted of item.split(/\[(.*?)\]/g)) {
        if (splitted.length > 0) {
          result.push(splitted);
        }
      }
    }

    return result;
  }
}
