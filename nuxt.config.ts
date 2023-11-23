// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true
  },

  // Disable SSR, and build as an SPA
  ssr: false,

  // Routing workarounds
  // This is the only way I've found to get routing on a sub-path working properly
  // for SSR: false on Nuxt Bridge
  app: {
    baseURL: "/app",
    buildAssetsDir: "/app/_nuxt/",
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "UKRDC Web Client",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      {
        charset: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        hid: "description",
        name: "description",
        content: "",
      },
    ],
  },

  server: {
    host: process.env.HOST || "localhost",
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["@/assets/css/main.css"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    "~/plugins/v-calendar.client.ts",
    "~/plugins/v-tooltip.client.ts",
    "~/plugins/toast.client.ts",
    "~/plugins/vue-clickaway.client.ts",
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: false,

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ["~/modules/okta-auth/index"],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [
      "marked", // See https://github.com/markedjs/marked/issues/2265#issuecomment-1754764288
    ],
  },

  // PostCSS config
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // Build-time variables. These are resolved during the build process,
  // and can be accessed via `process.env.VAR_NAME` in the code.
  env: {
    githubRef: process.env.GITHUB_REF || "Not Available",
    githubSha: process.env.GITHUB_SHA || "Not Available",
  },

  // Okta JS config
  okta: {
    defaultProtectRoutes: true,
    redirectUri: "/login",
    postLogoutRedirectUri: "/login",
    responseType: "code",
    pkce: true,
    scopes: ["openid", "profile", "email", "offline_access"],
  },

  // Runtime configuration variables
  runtimeConfig: {
    public: {
      // Demo mode with redacted data
      demoMode: process.env.DEMO_MODE || false,
      // Custom UKRDC API config
      api: {
        host: process.env.API_HOST || "",
        protocol: process.env.API_PROTOCOL || "https",
      },
      // Okta domain
      manageAccountUrl: process.env.MANAGE_ACCOUNT_URL || "https://renalregistry.okta.com/app/UserHome",
      // Deployment environment
      deploymentEnv: process.env.DEPLOYMENT_ENV || "development",
      // Okta JS runtime config
      okta: {
        issuer: process.env.OAUTH_ISSUER,
        clientId: process.env.APP_CLIENT_ID,
      },
    }
  },

})
