import { useMutation, useQuery } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '../client';
import type { ApiRequestBody, Schema, WithFields } from '../types';

// ==========================================
// TYPES - derived from the generated backend contract (see services/api/types.ts).
// Edit the backend schema + `npm run api:types`, not these aliases.
// ==========================================

export type LoginRequest = Schema<'LoginRequest'>;
export type SignupRequest = Schema<'SignupRequest'>;
export type SignupResponse = Schema<'SignupResponse'>;
export type RefreshTokenRequest = Schema<'RefreshTokenRequest'>;
export type UserProfileUpdate = ApiRequestBody<'/api/v1/auth/me', 'put'>;
export type LogoutAllRequest = Schema<'LogoutAllRequest'>;
/** `confirmation` must be the literal string "DELETE"; identity proof is password OR verification_id + otp. */
export type AccountDeleteRequest = Schema<'AccountDeleteRequest'>;
export type AccountDeleteResponse = Schema<'AccountDeleteResponse'>;
export type PasswordResetRequest = Schema<'PasswordResetRequest'>;
export type PasswordResetConfirm = Schema<'PasswordResetConfirm'>;

// Phone API shared types
export type PhoneOTPRequest = Schema<'PhoneLoginSendOTPRequest'>;
export type PhoneOTPResponse = Schema<'PhoneLoginSendOTPResponse'>;
export type PhoneVerificationSendResponse = Schema<'PhoneVerificationSendOTPResponse'>;
export type PhoneVerifyRequest = Schema<'PhoneLoginVerifyOTPRequest'>;
export type PhoneVerificationConfirmResponse = Schema<'PhoneVerificationConfirmResponse'>;

// The contract types `user` as a free-form object (the profile row), so it is
// widened to `any` here for the screens that read role/name off it.
export type AuthTokensResponse = WithFields<Schema<'LoginResponse'>, { user: any }>;
export type PhoneLoginResponse = WithFields<Schema<'PhoneLoginVerifyOTPResponse'>, { user: any }>;

/** `/auth/signup/phone/verify-otp` has no declared response model; this is what it returns. */
export interface PhoneSignupVerifyResponse {
  success: boolean;
  message?: string;
  verification_token: string;
  [k: string]: any;
}

// ==========================================
// CORE AUTH HOOKS (Email/Password)
// ==========================================

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => await apiPost<AuthTokensResponse>('/api/v1/auth/login', data)
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: SignupRequest) => await apiPost<SignupResponse>('/api/v1/auth/signup', data)
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async (data: RefreshTokenRequest) => await apiPost<any>('/api/v1/auth/refresh', data)
  });
}

// ==========================================
// USER PROFILE HOOKS (Requires Token)
// ==========================================

export function useGetUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => await apiGet<any>('/api/v1/auth/me'),
  });
}

export function useUpdateUserProfile() {
  return useMutation({
    mutationFn: async (data: UserProfileUpdate) => await apiPut<any>('/api/v1/auth/me', data)
  });
}

// ==========================================
// LOGOUT & PASSWORD HOOKS
// ==========================================

export function useLogout() {
  return useMutation({
    mutationFn: async () => await apiPost<any>('/api/v1/auth/logout', {})
  });
}

export function useLogoutAll() {
  return useMutation({
    mutationFn: async (data: LogoutAllRequest) => await apiPost<any>('/api/v1/auth/logout-all', data)
  });
}

/** Sends a deletion-confirmation OTP to the phone already on the account. */
export function useSendAccountDeletionOtp() {
  return useMutation({
    mutationFn: async () => await apiPost<PhoneVerificationSendResponse>('/api/v1/auth/me/delete/send-otp', {}),
  });
}

/**
 * Permanently deletes the signed-in user's account (Google Play requirement).
 * Irreversible - the caller must sign the user out afterwards.
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (data: AccountDeleteRequest) =>
      await apiDelete<AccountDeleteResponse>('/api/v1/auth/me', data),
  });
}

export function usePasswordReset() {
  return useMutation({
    mutationFn: async (data: PasswordResetRequest) => await apiPost<Schema<'PasswordResetResponse'>>('/api/v1/auth/password-reset', data)
  });
}

export function usePasswordResetConfirm() {
  return useMutation({
    mutationFn: async (data: PasswordResetConfirm) => await apiPost<Schema<'PasswordResetConfirmResponse'>>('/api/v1/auth/password-reset/confirm', data)
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async () => await apiPost<any>('/api/v1/auth/resend-verification', {})
  });
}

// ==========================================
// PHONE SIGNUP HOOKS (Unauthenticated)
// ==========================================

export function useSendSignupPhoneOtp() {
  return useMutation({
    mutationFn: async (data: PhoneOTPRequest) => await apiPost<PhoneOTPResponse>('/api/v1/auth/signup/phone/send-otp', data)
  });
}

export function useVerifySignupPhoneOtp() {
  return useMutation({
    mutationFn: async (data: PhoneVerifyRequest) => await apiPost<PhoneSignupVerifyResponse>('/api/v1/auth/signup/phone/verify-otp', data)
  });
}

// ==========================================
// PHONE LOGIN HOOKS (Unauthenticated)
// ==========================================

export function useSendPhoneOtp() {
  return useMutation({
    mutationFn: async (data: PhoneOTPRequest) => await apiPost<PhoneOTPResponse>('/api/v1/auth/login/phone/send-otp', data)
  });
}

export function useVerifyPhoneOtp() {
  return useMutation({
    mutationFn: async (data: PhoneVerifyRequest) => await apiPost<PhoneLoginResponse>('/api/v1/auth/login/phone/verify-otp', data)
  });
}

// ==========================================
// PHONE VERIFICATION HOOKS (For existing users updating profile)
// ==========================================

export function useSendVerifyPhoneOtp() {
  return useMutation({
    mutationFn: async (data: PhoneOTPRequest) => await apiPost<PhoneVerificationSendResponse>('/api/v1/auth/verify-phone/send-otp', data)
  });
}

export function useConfirmVerifyPhoneOtp() {
  return useMutation({
    mutationFn: async (data: PhoneVerifyRequest) => await apiPost<PhoneVerificationConfirmResponse>('/api/v1/auth/verify-phone/confirm-otp', data)
  });
}
