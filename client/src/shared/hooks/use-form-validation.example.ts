/**
 * Example usage of form validation hooks
 * This file demonstrates the recommended pattern for using form validation
 */

import { useFormField } from "./use-form-validation";
import { required, positiveNumber, email, minLength } from "@/shared/utils/form-validation";

/**
 * Example: Simple form with individual field hooks
 */
export function ExampleForm() {
  // Use individual useFormField hooks for each field
  const nameField = useFormField({
    initialValue: "",
    validate: (value) => combineValidations(required(value), minLength(value, 3)),
  });

  const emailField = useFormField({
    initialValue: "",
    validate: email,
  });

  const ageField = useFormField({
    initialValue: 0,
    validate: positiveNumber,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Touch all fields to show errors
    nameField.setTouched();
    emailField.setTouched();
    ageField.setTouched();

    // Check if form is valid
    if (nameField.isValid && emailField.isValid && ageField.isValid) {
      // Submit form
      console.log({
        name: nameField.value,
        email: emailField.value,
        age: ageField.value,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          value={nameField.value}
          onChange={(e) => nameField.setValue(e.target.value)}
          onBlur={() => nameField.setTouched()}
        />
        {nameField.error && <span>{nameField.error}</span>}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={emailField.value}
          onChange={(e) => emailField.setValue(e.target.value)}
          onBlur={() => emailField.setTouched()}
        />
        {emailField.error && <span>{emailField.error}</span>}
      </div>

      <div>
        <label>Age</label>
        <input
          type="number"
          value={ageField.value}
          onChange={(e) => ageField.setValue(Number(e.target.value) || 0)}
          onBlur={() => ageField.setTouched()}
        />
        {ageField.error && <span>{ageField.error}</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

// Import combineValidations
import { combineValidations } from "@/shared/utils/form-validation";

