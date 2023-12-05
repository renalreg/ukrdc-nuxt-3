# In Nuxt 3, runtime configs can only be overridden using a special
# form of environment variable, prefixed with NUXT. 
# See https://nuxt.com/docs/guide/going-further/runtime-config#typing-runtime-config
# At build-time, and during development, we use environment variables with different
# names, see nuxt.config.js for a full list of environment variables used in
# the runtimeConfig.public object.
# To keep things consistent, we convert these environment variables to their
# Nuxt 3 counterparts at runtime, in production.
# Note: We need to only do this if the variable has actually been defined,
# otherwise it sets it to an empty value and blanks out the defaults 
# defined in nuxt.config.js

if [ -n "${DEPLOYMENT_ENV}" ]; then
    export NUXT_PUBLIC_SENTRY_ENVIRONMENT=${DEPLOYMENT_ENV}
    export NUXT_PUBLIC_DEPLOYMENT_ENV=${DEPLOYMENT_ENV}
fi

if [ -n "${DEMO_MODE}" ]; then
    export NUXT_PUBLIC_DEMO_MODE=${DEMO_MODE}
fi

if [ -n "${API_HOST}" ]; then
    export NUXT_PUBLIC_API_HOST=${API_HOST}
fi

if [ -n "${API_PROTOCOL}" ]; then
    export NUXT_PUBLIC_API_PROTOCOL=${API_PROTOCOL}
fi

if [ -n "${MANAGE_ACCOUNT_URL}" ]; then
    export NUXT_PUBLIC_MANAGE_ACCOUNT_URL=${MANAGE_ACCOUNT_URL}
fi

if [ -n "${OAUTH_ISSUER}" ]; then
    export NUXT_PUBLIC_OKTA_ISSUER=${OAUTH_ISSUER}
fi

if [ -n "${APP_CLIENT_ID}" ]; then
    export NUXT_PUBLIC_OKTA_CLIENT_ID=${APP_CLIENT_ID}
fi

if [ -n "${SENTRY_DSN}" ]; then
    export NUXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}
fi

node .output/server/index.mjs