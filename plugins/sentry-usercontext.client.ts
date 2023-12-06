/*
Automatically set and clear the Sentry usercontext based on auth status.
*/
import { type AuthState } from "@okta/okta-auth-js";
import { useAuth } from "@okta/okta-vue";
import * as Sentry from "@sentry/vue";

export default defineNuxtPlugin((_) => {
  const $okta = useAuth();

  // When auth state changes, update sentry user context
  function _handleAuthStateUpdate(newAuthState: AuthState | null) {
    if (newAuthState && newAuthState.isAuthenticated) {
      const rawIdToken = $okta.getIdToken();
      const idToken = rawIdToken ? $okta.token.decode(rawIdToken) : null;
      Sentry.setUser({
        id: idToken?.payload.sub,
        email: idToken?.payload.email,
        fullName: idToken?.payload.name,
      });
    } else {
      Sentry.setUser(null);
    }
  }

  // Populate Sentry user
  _handleAuthStateUpdate($okta.authStateManager.getAuthState());

  // Subscribe to auth state changes
  $okta.authStateManager.subscribe(_handleAuthStateUpdate);
});
