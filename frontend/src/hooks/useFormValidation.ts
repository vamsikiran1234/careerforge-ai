import { useState, useCallback } from 'react';

// Validation rule types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: string) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormValues {
  [key: string]: string;
}

// Built-in validation functions
const validationFunctions = {
  required: (value: string): ValidationResult => ({
    isValid: value.trim().length > 0,
    error: value.trim().length === 0 ? 'This field is required' : undefined,
  }),

  minLength: (value: string, min: number): ValidationResult => ({
    isValid: value.length >= min,
    error: value.length < min ? `Must be at least ${min} characters` : undefined,
  }),

  maxLength: (value: string, max: number): ValidationResult => ({
    isValid: value.length <= max,
    error: value.length > max ? `Must be no more than ${max} characters` : undefined,
  }),

  pattern: (value: string, pattern: RegExp): ValidationResult => ({
    isValid: pattern.test(value),
    error: !pattern.test(value) ? 'Invalid format' : undefined,
  }),

  email: (value: string): ValidationResult => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailPattern.test(value),
      error: !emailPattern.test(value) ? 'Please enter a valid email address' : undefined,
    };
  },

  custom: (value: string, customFn: (value: string) => boolean | string): ValidationResult => {
    const result = customFn(value);
    if (typeof result === 'boolean') {
      return {
        isValid: result,
        error: !result ? 'Invalid value' : undefined,
      };
    }
    return {
      isValid: false,
      error: result,
    };
  },
};

// Validate a single field
export const validateField = (value: string, rules: ValidationRule): ValidationResult => {
  if (rules.required) {
    const requiredResult = validationFunctions.required(value);
    if (!requiredResult.isValid) return requiredResult;
  }

  // Skip other validations if field is empty and not required
  if (!rules.required && value.trim().length === 0) {
    return { isValid: true };
  }

  if (rules.minLength !== undefined) {
    const minLengthResult = validationFunctions.minLength(value, rules.minLength);
    if (!minLengthResult.isValid) return minLengthResult;
  }

  if (rules.maxLength !== undefined) {
    const maxLengthResult = validationFunctions.maxLength(value, rules.maxLength);
    if (!maxLengthResult.isValid) return maxLengthResult;
  }

  if (rules.email) {
    const emailResult = validationFunctions.email(value);
    if (!emailResult.isValid) return emailResult;
  }

  if (rules.pattern) {
    const patternResult = validationFunctions.pattern(value, rules.pattern);
    if (!patternResult.isValid) return patternResult;
  }

  if (rules.custom) {
    const customResult = validationFunctions.custom(value, rules.custom);
    if (!customResult.isValid) return customResult;
  }

  return { isValid: true };
};

// Form validation hook
export interface UseFormValidationProps {
  initialValues: FormValues;
  validationRules: { [key: string]: ValidationRule };
}

export const useFormValidation = ({ initialValues, validationRules }: UseFormValidationProps) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateSingleField = useCallback((name: string, value: string) => {
    const rules = validationRules[name];
    if (!rules) return { isValid: true };

    return validateField(value, rules);
  }, [validationRules]);

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((fieldName) => {
      const value = values[fieldName] || '';
      const result = validateSingleField(fieldName, value);
      
      if (!result.isValid && result.error) {
        newErrors[fieldName] = result.error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, validateSingleField]);

  const handleChange = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Validate field on change if it has been touched
    if (touched[name]) {
      const result = validateSingleField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: result.error || '',
      }));
    }
  }, [touched, validateSingleField]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate field on blur
    const value = values[name] || '';
    const result = validateSingleField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: result.error || '',
    }));
  }, [values, validateSingleField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFieldError,
    isValid: Object.keys(errors).every(key => !errors[key]),
  };
};

// Common validation rules
export const commonRules = {
  required: { required: true },
  email: { required: true, email: true },
  password: { 
    required: true, 
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  name: { 
    required: true, 
    minLength: 2, 
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
  },
  phone: {
    required: true,
    pattern: /^\+?[\d\s\-\(\)]+$/,
  },
};

export default useFormValidation;
