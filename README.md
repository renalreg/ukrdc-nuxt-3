# ukrdc-nuxt-3

## Developer Installation

### Prerequisites

- Create a `.env` file (see below):
- Ensure a local UKRDC-FastAPI instance is running locally (see <https://github.com/renalreg/ukrdc-fastapi>)

### Installation

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Environment variables

### Build-time

- `GITHUB_REF` - GitHub ref for automatic error reporting
- `GITHUB_SHA` - GitHub SHA for automatic error reporting
- `SENTRY_DSN` - (Secret) Sentry DSN for automatic error reporting
- `SENTRY_AUTH_TOKEN` - (Secret) Sentry auth token for release publishing
- `SENTRY_ORG` - Sentry organisation name
- `SENTRY_PROJECT` - Sentry project name

### Run-time

- `DEPLOYMENT_ENV` - Deployment environment,used for system and error reporting. Defaults to 'development'.
- `API_HOST` - UKRDC API host. Defaults to null, which means same host will be used. Useful for local development.
- `API_PROTOCOL` - UKRDC API protocol. Defaults to https. Useful for local development.
- `OAUTH_ISSUER` - Okta OAuth issuer
- `APP_CLIENT_ID` - Okta OAuth client ID
- `MANAGE_ACCOUNT_URL` - Okta account management URL. Defaults to https://renalregistry.okta.com/app/UserHome.
- `DEMO_MODE` - Enable demo mode, redacting sensitive information. Defaults to false. See details below.

#### Demo mode

Demo mode is enabled by setting `DEMO_MODE` to a truthy value (e.g. "true", 1). This will attempt to redact sensitive information from the UI, such as patient names, NHS numbers, and addresses.

Demo mode is not intended to be a security feature, but rather a way to show the UI without exposing sensitive information.
It only masks information visually, and does not prevent the information from being accessed through inspection such as the browser developer tools.

This should **not** be used in any context other than a controlled demonstration by the developers.

See our [internal Confluence documentation](https://renalregistry.atlassian.net/wiki/spaces/UDF/pages/2502721559/Sensitive+Data+and+Demo+Mode) for further information.

## Developer notes

### Versioning, releases, and deployments

See our [internal Confluence documentation](https://renalregistry.atlassian.net/wiki/spaces/UDF/pages/2516680711/Releases+and+Deployment) for up-to-date guidelines on versioning, releases, and deployment.

## Suggested Development Environment

- Visual Studio Code
- [Volar extension (Vue language support)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Prettier extension (Code formatter)](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

### Manually running ESLint and Prettier

ESLint and Prettier should be handled separately.

To check your code without changing anything, run:

```
npm run eslint:check
npm run prettier:check
```

or

```
npm run check
```

To fix the issues, run:

```
npm run eslint:fix
npm run prettier:fix
```

or

```
npm run fix
```

### (No) Server-side rendering

One often cited advantage to using Nuxt over Vue is server-side rendering. However, we don't use it in this project.
SSR offers no significant advantage to us, since we don't care about SEO, and disabling it massively simplifies the code.
This is because Nuxt modules/plugins need to support both client and server-side rendering.

Take, for example, authentication. Okta offer a really nice JS library to simplify authentication with their service, however making this library compatible with SSR would be a huge amount of work. This is why Nuxt modules like nuxt-auth exist. Authentication states need to be passed to the server, for example as cookies, so that the server can then send API requests as the user, render the content, and send the rendered page back to the client.

Enabling SSR would essentially limit us to using libraries that have been converted into universal Nuxt modules, and in the case of nuxt-auth (for example), this caused more problems than it solved.

Instead, we disable SSR entirely, and make use of the wealth of client-side JS libraries throughout our code.
Removing our reliance on Nuxt modules is an ongoing process, but has already been useful.

Although we disable server-side rendering and build a "traditional" Vue single-page application, we make use of the internal Nuxt server to allow runtime configuration of the application. The Nuxt server essentially populates the SPA with runtime variables before serving it unrendered to the client, just like a normal Vue application.
