/*
Plugin to make Vcalendar component globally available
*/

import Vcalendar from "v-calendar";

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(Vcalendar, {});
})