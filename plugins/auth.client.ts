import { OktaAuth } from '@okta/okta-auth-js'
import OktaVue from '@okta/okta-vue'
import { navigationGuard } from '@okta/okta-vue'

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const runtimeOptions = runtimeConfig.public.okta;

  const oktaAuth = new OktaAuth({
    issuer: runtimeOptions.issuer,
    clientId: runtimeOptions.clientId,
    redirectUri: window.location.origin + '/app/login/callback',
    postLogoutRedirectUri: window.location.origin + '/app',
    scopes: ["openid", "profile", "email", "offline_access"],
    responseType: "code",
    pkce: true,
  })

  const router = useRouter();
  router.beforeEach(navigationGuard)

  nuxtApp.vueApp.use(OktaVue, { oktaAuth });
})