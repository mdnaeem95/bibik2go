import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface FormFieldProps extends Omit<TextFieldProps, 'onChange'> {
  name: string;
  value: string | number;
  error?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  value,
  error,
  onChange,
  required,
  label,
  ...rest
}) => (
  <TextField
    name={name}
    value={value}
    onChange={onChange}
    error={!!error}
    helperText={error}
    required={required}
    label={label}
    fullWidth
    {...rest}
  />
);