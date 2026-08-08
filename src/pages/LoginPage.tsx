import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { RoleOption } from '../components/auth/RoleOption';
import { TextField } from '../components/auth/TextField';
import { CountryCodeSelect } from '../components/auth/CountryCodeSelect';
import { useAuth, ROLES, type Role } from '../context/AuthContext';
import { useLoginForm } from '../hooks/useLoginForm';
import { api, ApiError } from '../api/client';
import { COUNTRY_CODES } from '../data/countryCodes';

interface LoginPageProps {
  readonly className?: string;
}

export const LoginPage: React.FC<LoginPageProps> = () => {
  const { role, roleInfo, login, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(role);
  const [registerMode, setRegisterMode] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [countryCode, setCountryCode] = useState(() => {
    const us = COUNTRY_CODES.find((entry) => entry.code === '+1');
    return us ? '+1' : (COUNTRY_CODES[0]?.code ?? '+1');
  });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const {
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
  } = useLoginForm();

  const homeFor = (nextRole: Role): string => (nextRole === 'authority' ? '/admin' : '/home');
  const fullPhone = `${countryCode}${phone}`;

  const handleSelectRole = (nextRole: Role) => {
    setSelectedRole(nextRole);
    setRegisterMode(false);
    setResetMode(false);
    setFormError(null);
    setSuccessMsg(null);
    clearErrors();
  };

  const handleCitizenLogin = async () => {
    if (!submitLogin(true)) return;
    setBusy(true);
    setFormError(null);
    setSuccessMsg(null);
    try {
      const result = await api.login(userId.trim(), password, fullPhone);
      login('user', result.token, result.user.username ?? result.user.email);
      navigate(homeFor('user'));
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Failed to log in');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!submitRegister()) return;
    setBusy(true);
    setFormError(null);
    setSuccessMsg(null);
    try {
      const result = await api.register({ username: userId.trim(), password, phone: fullPhone });
      login('user', result.token, result.user.username ?? result.user.email);
      navigate(homeFor('user'));
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Failed to create account');
    } finally {
      setBusy(false);
    }
  };

  const handleAuthorityLogin = async () => {
    if (!submitLogin(false)) return;
    setBusy(true);
    setFormError(null);
    setSuccessMsg(null);
    try {
      const result = await api.login(userId.trim(), password);
      login('authority', result.token, result.user.username ?? result.user.email);
      navigate(homeFor('authority'));
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Failed to log in');
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    if (!submitReset()) return;
    setBusy(true);
    setFormError(null);
    setSuccessMsg(null);
    try {
      const result = await api.resetPassword({
        identifier: userId.trim(),
        phone: fullPhone,
        new_password: password,
      });
      setSuccessMsg(result.message);
      setResetMode(false);
      clearErrors();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Failed to reset password');
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = () => {
    logout();
    setSelectedRole(null);
    setRegisterMode(false);
    setResetMode(false);
    setFormError(null);
    setSuccessMsg(null);
    clearErrors();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-2 md:py-4 bg-surface shadow-sm h-16 md:h-20">
        <div className="flex items-center gap-3">
          <Icon name="account_balance" className="text-primary text-3xl" />
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-primary tracking-tight">
            CivicLens AI
          </h1>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:block">
          Civic Engagement, Powered by AI
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-margin-mobile py-10 pt-24 md:pt-28">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (selectedRole === 'authority') {
              void handleAuthorityLogin();
            } else if (registerMode) {
              void handleRegister();
            } else if (resetMode) {
              void handleResetPassword();
            } else {
              void handleCitizenLogin();
            }
          }}
          className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/20 p-6 md:p-8 flex flex-col gap-6"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="account_balance" filled className="text-3xl text-primary" />
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {registerMode ? 'Create your account' : resetMode ? 'Reset your password' : 'Sign in to CivicLens'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {resetMode
                ? 'Verify your user ID and phone number to set a new password.'
                : 'Select your account type, then enter your credentials.'}
            </p>
          </div>

          {role && roleInfo ? (
            <div className="flex items-center justify-between gap-3 bg-surface-container rounded-lg px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <Icon name={roleInfo.icon} className="text-primary text-[22px]" />
                <div className="min-w-0">
                  <span className="block font-label-sm text-label-sm text-on-surface-variant">Signed in as</span>
                  <span className="block font-title-md text-title-md text-on-surface">{roleInfo.label}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="font-label-sm text-label-sm text-primary hover:underline whitespace-nowrap"
              >
                Sign out
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            {ROLES.map((info) => (
              <RoleOption
                key={info.id}
                title={`Login as ${info.label}`}
                description={info.description}
                icon={info.icon}
                selected={selectedRole === info.id}
                onSelect={() => handleSelectRole(info.id)}
              />
            ))}
          </div>

          <div className="border-t border-outline-variant/30 pt-5 flex flex-col gap-4">
            {selectedRole === 'authority' ? (
              <>
                <TextField
                  id="user-id"
                  label="User ID"
                  icon="badge"
                  value={userId}
                  onChange={setUserId}
                  placeholder="Enter your user ID"
                  autoComplete="username"
                  error={errors.userId}
                />
                <TextField
                  id="password"
                  label="Password"
                  type="password"
                  icon="lock"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={errors.password}
                />
                <p className="font-label-sm text-label-sm text-on-surface-variant -mt-2">
                  Demo credentials: admin / civic2026
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {resetMode ? 'Reset your citizen account' : registerMode ? 'Create your citizen account' : 'Citizen account'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (resetMode) {
                        setResetMode(false);
                      } else {
                        setRegisterMode((prev) => !prev);
                      }
                      setFormError(null);
                      setSuccessMsg(null);
                      clearErrors();
                    }}
                    className="font-label-sm text-label-sm text-primary hover:underline"
                  >
                    {resetMode
                      ? 'Back to sign in'
                      : registerMode
                        ? 'Already have an account? Log in'
                        : 'New here? Create an account'}
                  </button>
                </div>
                <TextField
                  id="user-id"
                  label="User ID"
                  icon="badge"
                  value={userId}
                  onChange={setUserId}
                  placeholder={registerMode ? 'Choose a user ID' : 'Enter your user ID'}
                  autoComplete="username"
                  error={errors.userId}
                />
                <TextField
                  id="password"
                  label={resetMode ? 'New Password' : 'Password'}
                  type="password"
                  icon="lock"
                  value={password}
                  onChange={setPassword}
                  placeholder={
                    registerMode ? 'Create a password' : resetMode ? 'Enter a new password' : 'Enter your password'
                  }
                  autoComplete={registerMode || resetMode ? 'new-password' : 'current-password'}
                  error={errors.password}
                />
                {!registerMode && !resetMode ? (
                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetMode(true);
                        setFormError(null);
                        setSuccessMsg(null);
                        clearErrors();
                      }}
                      className="font-label-sm text-label-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : null}
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <div className="mt-5 shrink-0">
                      <CountryCodeSelect value={countryCode} onChange={setCountryCode} error={Boolean(errors.phone)} />
                    </div>
                    <div className="flex-1">
                      <TextField
                        id="phone"
                        label="Phone Number"
                        type="tel"
                        inputMode="numeric"
                        icon="phone"
                        value={phone}
                        onChange={setPhone}
                        placeholder="Enter your phone number"
                        autoComplete="tel-national"
                        error={errors.phone}
                      />
                    </div>
                  </div>
                  {!errors.phone ? (
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      {resetMode
                        ? 'We\'ll verify the phone number on file for this account.'
                        : 'Your phone number will be required every time you sign in.'}
                    </p>
                  ) : null}
                </div>
              </>
            )}

            {successMsg ? (
              <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-4 py-3">
                <Icon name="check_circle" className="text-primary text-[18px] shrink-0" />
                <p className="font-label-sm text-label-sm text-primary">{successMsg}</p>
              </div>
            ) : null}

            {formError ? (
              <div className="flex items-center gap-2 bg-error-container rounded-lg px-4 py-3">
                <Icon name="error" className="text-error text-[18px] shrink-0" />
                <p className="font-label-sm text-label-sm text-error">{formError}</p>
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!selectedRole || busy}
            className={`w-full px-6 py-3.5 rounded-lg font-body-lg text-body-lg font-bold flex items-center justify-center gap-2 transition-all ${
              selectedRole && !busy
                ? 'bg-primary text-on-primary shadow-md hover:bg-primary/90 active:scale-[0.98]'
                : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
            }`}
          >
            {busy ? 'Please wait…' : selectedRole === 'authority' || (!registerMode && !resetMode) ? 'Login' : registerMode ? 'Create Account' : 'Reset Password'}
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>

          <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
            By continuing you agree to the CivicLens Terms of Service.
          </p>
        </form>
      </main>
    </div>
  );
};
