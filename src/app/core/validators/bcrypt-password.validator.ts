import { ValidatorFn } from '@angular/forms';

export const bcryptPasswordValidator: ValidatorFn = (control) =>
  new TextEncoder().encode(control.value ?? '').length > 72 ? { bcryptPassword: true } : null;
