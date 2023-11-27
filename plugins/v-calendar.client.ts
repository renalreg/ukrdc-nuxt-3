/*
Plugin to make Vcalendar component globally available
*/

import Vcalendar from "v-calendar";
import "v-calendar/dist/style.css";

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(Vcalendar, {});
});
