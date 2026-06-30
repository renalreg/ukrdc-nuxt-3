export default defineAppConfig({
  ui: {
    colors: {
      primary: "indigo",
      secondary: "purple",
      success: "green",
      info: "blue",
      warning: "amber",
      error: "red",
      neutral: "zinc",
    },

    badge: {
      defaultVariants: {
        variant: "subtle",
      },
    },

    button: {
      base: "inline-flex items-center justify-center rounded-md", // rounded must be explicit now
      defaultVariants: {
        size: "md",
        color: "neutral",
        variant: "outline",
      },
    },

    alert: {
      slots: {
        title: "truncate",
        description: "truncate",
      },
      defaultVariants: {
        variant: "subtle",
        color: "error",
      },
    },

    notifications: {
      slots: {
        root: "top-0 bottom-auto", // position is now a slot class
      },
    },

    // verticalNavigation → NavigationMenu in v3
    navigationMenu: {
      slots: {
        link: "text-md",
      },
    },
  },
});
