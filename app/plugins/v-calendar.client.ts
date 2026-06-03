/*
Plugin to make Vcalendar component globally available
*/

import "v-calendar/dist/style.css";

import Vcalendar from "v-calendar";

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(Vcalendar, {});
});
