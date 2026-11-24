import { base44 } from '@/api/base44Client';
export const loginWithMfa = (email, password) => base44.auth.loginViaEmailPassword(email, password);
export const loginWithSocial = (provider, returnTo) => base44.auth.loginWithProvider(provider, returnTo);
export const loginWithGoogle = returnTo => loginWithSocial('google', returnTo);
export async function continueMfa() { throw new Error('MFA is not available in local demo mode.'); }
