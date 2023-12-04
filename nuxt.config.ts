// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: false,
  },

  // Disable SSR, and build as an SPA
  ssr: false,

  // Routing workarounds
  // This is the only way I've found to get routing on a sub-path working properly
  // for SSR: false on Nuxt Bridge
  app: {
    baseURL: "/app",
    buildAssetsDir: "/app/_nuxt/",
    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
      title: "UKRDC Web Client",
      link: [{ rel: "icon", type: "image/x-icon", href: "/app/favicon.ico" }],
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
      ],
    },
  },

  // Vue compiler options
  vue: {
    compilerOptions: {
      // Preserve whitespace in templates
      // We use this a _lot_ when joining strings together
      whitespace: "preserve",
    },
  },

  // Vite bundler options
  vite: {
    optimizeDeps: {
      include: ["plotly.js-dist-min"],
    },
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["@/assets/css/main.css"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ["~/plugins/v-calendar.client.ts"],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: false,

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ["@nuxt/ui"],

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

  // Runtime configuration variables
  runtimeConfig: {
    // We don't use SSR, so all runtime config needs to be public to be useful to us
    public: {
      git: {
        githubRef: process.env.GITHUB_REF || "Not Available",
        githubSha: process.env.GITHUB_SHA || "Not Available",
      },
      // Deployment environment
      deploymentEnv: process.env.DEPLOYMENT_ENV || "development",
      // Demo mode with redacted data
      demoMode: process.env.DEMO_MODE,
      // Custom UKRDC API config
      api: {
        host: process.env.API_HOST,
        protocol: "https",
      },
      // Okta domain
      manageAccountUrl: "https://sso.ukkidney.org/app/UserHome",
      // Okta JS runtime config
      okta: {
        issuer: process.env.OAUTH_ISSUER,
        clientId: process.env.APP_CLIENT_ID,
      },
    },
  },
});
