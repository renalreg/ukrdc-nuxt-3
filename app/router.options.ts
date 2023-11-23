import type { RouterConfig } from '@nuxt/schema'
import { LoginCallback } from '@okta/okta-vue'

export default <RouterConfig> {
  // https://router.vuejs.org/api/interfaces/routeroptions.html#routes
  routes: (_routes) => {
    for (let route of _routes) {
      // Protect all non-callback routes by default
      if (route.meta === undefined) {
        route.meta = {}
      }
      // If requiresAuth hasn't been explicitly set to false, set it to true
      if (route.meta.requiresAuth !== false) {
        route.meta.requiresAuth = true
      }
    }
    // Add callback routes to filesystem routes
    return [
    ..._routes,
    { path: '/login/callback', component: LoginCallback },
  ]},
}