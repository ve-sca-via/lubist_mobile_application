import { useMutation, useQuery } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '../client';

// ==========================================
// TYPES & INTERFACES (Mapped from auth.py)
// ==========================================

export interface LoginRequest { email?: string; password?: string; }
export interface SignupRequest { 
  email?: string; 
  password?: string; 
  full_name?: string; 
  phone?: string; 
  age?: number; 
  gender?: string; 
  user_role?: string; 
  verification_token?: string; 
}
export interface RefreshTokenRequest { refresh_token: string; }
export interface UserProfileUpdate { 
  full_name?: string; 
  phone?: string; 
  age?: number; 
  gender?: string; 
}
export interface LogoutAllRequest { password?: string; }
export interface AccountDeleteRequest {
  /** Must be the literal string "DELETE" - the backend rejects anything else. */
  confirmation: string;
  /** Identity proof: password OR verification_id + otp. Phone-first signups have
   *  no password they know, so they confirm with an OTP instead. */
  password?: string;
  verification_id?: string;
  otp?: string;
}
export interface AccountDeleteResponse {
  success: boolean;
  message: string;
  deleted_at: string;
  retained_records: Record<string, number>;
}
export interface PasswordResetRequest { email: string; }
export interface PasswordResetConfirm { token: string; new_password?: string; }

// Phone API Shared Types
export interface PhoneOTPRequest { 
  phone: string; 
  country_code?: string; 
}
export interface PhoneOTPResponse { 
  success: boolean; 
  message: string; 
  verification_id: string; 
  expires_in: number; 
  phone: string; 
  customer_name?: string; 
}
export interface PhoneVerifyRequest { 
  phone: string; 
  otp: string; 
  verification_id: string; 
}
export interface AuthTokensResponse { 
  success: boolean; 
  message: string; 
  access_token: string; 
  refresh_token: string; 
  token_type: string; 
  user: any; 
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
    mutationFn: async (data: SignupRequest) => await apiPost<any>('/api/v1/auth/signup', data)
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
    mutationFn: async () => await apiPost<PhoneOTPResponse>('/api/v1/auth/me/delete/send-otp', {}),
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
    mutationFn: async (data: PasswordResetRequest) => await apiPost<any>('/api/v1/auth/password-reset', data)
  });
}

export function usePasswordResetConfirm() {
  return useMutation({
    mutationFn: async (data: PasswordResetConfirm) => await apiPost<any>('/api/v1/auth/password-reset/confirm', data)
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
    mutationFn: async (data: PhoneVerifyRequest) => await apiPost<any>('/api/v1/auth/signup/phone/verify-otp', data)
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
    mutationFn: async (data: PhoneVerifyRequest) => await apiPost<AuthTokensResponse>('/api/v1/auth/login/phone/verify-otp', data)
  });
}

// ==========================================
// PHONE VERIFICATION HOOKS (For existing users updating profile)
// ==========================================

export function useSendVerifyPhoneOtp() {
  return useMutation({
    mutationFn: async (data: PhoneOTPRequest) => await apiPost<PhoneOTPResponse>('/api/v1/auth/verify-phone/send-otp', data)
  });
}

export function useConfirmVerifyPhoneOtp() {
  return useMutation({
    mutationFn: async (data: PhoneVerifyRequest) => await apiPost<any>('/api/v1/auth/verify-phone/confirm-otp', data)
  });
}
