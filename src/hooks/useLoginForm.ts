import { useState } from 'react';

export interface LoginErrors {
  userId?: string;
  password?: string;
  phone?: string;
}

const USER_ID_REGEX = /^[A-Za-z0-9_]{3,32}$/;

export function useLoginForm() {
  const [userId, setUserIdRaw] = useState('');
  const [password, setPasswordRaw] = useState('');
  const [phone, setPhoneRaw] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});

  const setUserId = (value: string) => {
    setUserIdRaw(value);
    if (errors.userId) setErrors((prev) => ({ ...prev, userId: undefined }));
  };

  const setPassword = (value: string) => {
    setPasswordRaw(value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
  };

  const setPhone = (value: string) => {
    setPhoneRaw(value.replace(/\D/g, '').slice(0, 14));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const validateUserId = (): string | undefined => {
    const trimmed = userId.trim();
    if (!trimmed) return 'Enter your user ID';
    if (!USER_ID_REGEX.test(trimmed)) return 'User ID must be 3-32 letters, numbers or underscores';
    return undefined;
  };

  const validatePassword = (): string | undefined => {
    if (!password) return 'Enter your password';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const validatePhone = (): string | undefined => {
    if (phone.replace(/\D/g, '').length < 6) return 'Enter your phone number';
    return undefined;
  };

  const submitLogin = (requirePhone: boolean): boolean => {
    const next: LoginErrors = {};
    const userIdError = validateUserId();
    if (userIdError) next.userId = userIdError;
    const passwordError = validatePassword();
    if (passwordError) next.password = passwordError;
    if (requirePhone) {
      const phoneError = validatePhone();
      if (phoneError) next.phone = phoneError;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitRegister = (): boolean => {
    const next: LoginErrors = {};
    const userIdError = validateUserId();
    if (userIdError) next.userId = userIdError;
    const passwordError = validatePassword();
    if (passwordError) next.password = passwordError;
    const phoneError = validatePhone();
    if (phoneError) next.phone = phoneError;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitReset = (): boolean => {
    const next: LoginErrors = {};
    const userIdError = validateUserId();
    if (userIdError) next.userId = userIdError;
    const phoneError = validatePhone();
    if (phoneError) next.phone = phoneError;
    const passwordError = validatePassword();
    if (passwordError) next.password = passwordError;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const clearErrors = () => setErrors({});

  return {
    userId,
    setUserId,
    password,
    setPassword,
    phone,
    setPhone,
    errors,
    clearErrors,
    submitLogin,
    submitRegister,
    submitReset,
  };
}
