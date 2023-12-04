import { OktaAuth } from "@okta/okta-auth-js";
import OktaVue, { navigationGuard } from "@okta/okta-vue";

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const runtimeOptions = runtimeConfig.public.okta;

  const oktaAuth = new OktaAuth({
    issuer: runtimeOptions.issuer,
    clientId: runtimeOptions.clientId,
    redirectUri: window.location.origin + "/app/login/callback",
    postLogoutRedirectUri: window.location.origin + "/app",
    scopes: ["openid", "profile", "email", "offline_access"],
    responseType: "code",
    pkce: true,
  });

  // Set up router navigation guard
  const router = useRouter();
  router.beforeEach(navigationGuard);

  // Enable background service for token refresh
  oktaAuth.start();

  nuxtApp.vueApp.use(OktaVue, { oktaAuth });
});
