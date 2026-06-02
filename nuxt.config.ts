import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: false,
  },

  // Disable SSR, and build as an SPA
  ssr: false,

  // Base app configuration
  app: {
    baseURL: "/app",
    buildAssetsDir: "/_nuxt",
    // Global page headers
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

  // We lack proper dark mode support, so lock to light theme for now at least
  colorMode: {
    preference: "light",
  },

  // Vue compiler options
  vue: {
    compilerOptions: {
      // Preserve whitespace in templates
      // We use this a _lot_ when joining strings together
      whitespace: "preserve",
    },
  },

  // Generate sourcemap
  sourcemap: true,

  // Vite bundler options
  vite: {
    optimizeDeps: {
      include: ["plotly.js-dist-min"],
    },
    plugins: [
      // Put the Sentry vite plugin after all other plugins
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      }),
    ],
  },

  // Build Configuration
  build: {
    transpile: [
      "marked", // See https://github.com/markedjs/marked/issues/2265#issuecomment-1754764288
    ],
  },

  // Global CSS
  css: ["@/assets/css/main.css"],

  // Modules
  modules: ["@nuxt/ui"],

  // Plugins to run before rendering page
  plugins: [
    "~/plugins/v-calendar.client.ts",
    "~/plugins/auth.client.ts",
    "~/plugins/sentry.client.ts",
    "~/plugins/sentry-usercontext.client.ts",
  ],

  // Auto import components
  components: false,

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
        protocol: process.env.API_PROTOCOL || "https",
      },
      // Okta domain
      manageAccountUrl: process.env.MANAGE_ACCOUNT_URL || "https://sso.ukkidney.org/app/UserHome",
      // Okta JS runtime config
      okta: {
        issuer: process.env.OAUTH_ISSUER,
        clientId: process.env.APP_CLIENT_ID,
      },
      // Sentry runtime config
      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.DEPLOYMENT_ENV || "development",
      },
    },
  },
});
