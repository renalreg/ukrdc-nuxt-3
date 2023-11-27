## Todo

- [ ] Re-implement sentry (https://www.lichter.io/articles/nuxt3-sentry-recipe/?ref=github-sentry-support-issue)

- [ ] Fix ESLint issues

### System

- [x] Fix system configuration/support variables (replace all $config instances with useRuntimeConfig())

### Auth

- [x] Fix post logout URL
- [x] Re-enable auth background service
- [x] Fix API auth handler
- [x] Fix profile attributes (getUser, see profile page)

### Components

- [x] Fix dropdown menus (e.g. export on Codes page, Add Membership button)
- [x] Fix collapse sections (e.g. advanced search settings)
- [x] Fix toggle tabs (e.g. Work Item status selector)
- [x] Fix checkbox models (e.g. data files status filter)
- [ ] Fix name display component
- [ ] Fix BaseCardDescriptionList style
- [ ] Move all paginator components into card footer
- [ ] Check all `sensitive` class components
- [ ] Fix all tooltips on buttons with tooltip= attribute
- [ ] (Eventually) fix https://github.com/nathanreyes/v-calendar/issues/1415
- [ ] _Maybe_ replace in-house paginator with https://ui.nuxt.com/navigation/pagination#props

- [ ] Replace all components available in NuxtUI with their NuxtUI versions

### Model

- [x] Fix all custom input components v-model
  - [x] Data files national ID filter

### v-calendar

- [ ] https://github.com/nathanreyes/v-calendar/issues/1415

### Popover/alerts

- [x] Fix alert style/size

### Deployment

- [ ] Add docker image using new deployment method (https://github.com/renalreg/ukrdc-nuxt/blob/9c393c79ae8f840c5c6a8ef38857c0172aa1f172/start.sh and https://github.com/renalreg/ukrdc-nuxt/blob/9c393c79ae8f840c5c6a8ef38857c0172aa1f172/Dockerfile)
- [ ] Add back github actions

### Minor UI fixes

- [ ] Fix sidebar open transition

### Nice-to-have new stuff

- [ ] Something to add separating commas to big numbers
