import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { defu } from "defu";

const moduleDefaults = {
  namespace: "oktaAuth",
  defaultProtectRoutes: false,
};

export default defineNuxtModule({
  setup(_, nuxt) {
    // Merge options with defaults
    const buildtimeOptionsWithDefaults = defu(nuxt.options.okta, moduleDefaults);

    // Merge runtime config with buildtime options
    nuxt.options.runtimeConfig.public.okta = defu(nuxt.options.runtimeConfig.public.okta, buildtimeOptionsWithDefaults)

    // Create resolver to resolve relative paths
    const { resolve } = createResolver(import.meta.url)

    // Add the plugin
    addPlugin(resolve("./plugin.client.js"));
  },
});

