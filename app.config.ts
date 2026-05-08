export default defineAppConfig({
  ui: {
    colors: {
      primary: "indigo",
      neutral: "zinc", // replaces "gray" + "cool"
      red:'red',
      purple:'purple',
      blue:'blue',
      green:'green', // legacy colours should use errorr success where possible going forward
      amber:'amber',
      black:'black',
      white:'white',
      gray:"zinc"
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
        color: "primary",
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
