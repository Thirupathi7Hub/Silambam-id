// Supabase Auth helpers — replaces src/firebase/auth.js
import { supabase } from './config';

// ── Wrap Supabase user to match Firebase shape ──
// Firebase: user.uid   →   Supabase: user.id
const _wrap = (data) => ({
  ...data,
  user: data.user ? { ...data.user, uid: data.user.id } : null,
});

/**
 * Register new user with email and password
 * Returns { user, session, error }
 */
export const registerWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return _wrap(data); // { user: { ...uid }, session }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return _wrap(data); // { user: { ...uid }, session }
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/dashboard' },
  });
  if (error) throw error;
  return data;
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-password',
  });
  if (error) throw error;
};

/**
 * Subscribe to auth state changes
 * Returns an unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  // Add .uid alias so all app code using user.uid works (Supabase uses user.id)
  const wrapUser = (user) => user ? { ...user, uid: user.id } : null;

  // onAuthStateChange fires immediately with INITIAL_SESSION on page load
  // Do NOT also call getSession() — that causes a double-callback race condition
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(wrapUser(session?.user ?? null));
  });

  return () => subscription.unsubscribe();
};

/**
 * Get the currently logged in user
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export { supabase as auth };
