import { useState } from 'react';

export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName]);
      if (error) newErrors[fieldName] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      const error = validate(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validate(fieldName, values[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

// Validation rules
export const validationRules = {
  email: [
    (value) => !value ? 'Email is required' : '',
    (value) => !/\S+@\S+\.\S+/.test(value) ? 'Invalid email format' : ''
  ],
  password: [
    (value) => !value ? 'Password is required' : '',
    (value) => value.length < 6 ? 'Password must be at least 6 characters' : ''
  ],
  phone: [
    (value) => !value ? 'Phone is required' : '',
    (value) => !/^\+250\d{9}$/.test(value) ? 'Invalid phone format (+250XXXXXXXXX)' : ''
  ],
  required: [
    (value) => !value ? 'This field is required' : ''
  ]
};