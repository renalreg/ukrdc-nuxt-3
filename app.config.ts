export default defineAppConfig({
  // NuxtUI styling
  ui: {
    primary: "indigo",
    gray: "cool",
    button: {
      base: "inline-flex items-center justify-center",
      default: {
        size: "md",
        color: "white",
        variant: "solid",
      },
    },
    alert: {
      title: "truncate",
      description: "truncate",
      default: {
        variant: "subtle",
        color: "primary",
      },
    },
    notifications: {
      position: "top-0 bottom-auto",
    },
    verticalNavigation: {
      size: "text-md",
    },
  },
});
