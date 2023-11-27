/*
Injects a $toast object into the Vue instance and context,
allowing programatic toast creation.
*/

import BaseToast from "~/components/base/BaseToast.vue";
import { spawn } from "~/helpers/domUtils";

const containerClasses = [
  "z-40",
  "fixed",
  "inset-0",
  "flex",
  "flex-col-reverse",
  "items-end",
  "justify-center",
  "px-4",
  "py-6",
  "pointer-events-none",
  "sm:p-6",
  "sm:items-end",
  "sm:justify-end",
];

export const toastProgrammatic = {
  show(props: Record<string, unknown>) {
    if (typeof props === "string") props = { message: props };
    return spawn("toasts", props, BaseToast);
  },
  success(message: string) {
    return spawn("toasts", { type: "success", message }, BaseToast);
  },
  info(message: string) {
    return spawn("toasts", { type: "info", message }, BaseToast);
  },
  danger(message: string) {
    return spawn("toasts", { type: "danger", message }, BaseToast);
  },
  warning(message: string) {
    return spawn("toasts", { type: "warning", message }, BaseToast);
  },
  denied(message: string) {
    return spawn("toasts", { type: "denied", message }, BaseToast);
  },
};

export default defineNuxtPlugin((_) => {
  // Create a div to hold created toasts
  const toasts = document.createElement("div");
  containerClasses.forEach((c) => toasts.classList.add(c));
  toasts.setAttribute("id", "toasts");
  document.body.appendChild(toasts);

  return {
    provide: {
      toast: toastProgrammatic,
    },
  };
});
