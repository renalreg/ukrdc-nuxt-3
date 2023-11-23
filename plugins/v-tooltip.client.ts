import FloatingVue from "floating-vue";

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(FloatingVue);
})