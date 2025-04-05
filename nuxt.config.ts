// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image'
  ],

  css: [
    'bootstrap/dist/css/bootstrap.min.css' // Подключаем Bootstrap
  ],

  build: {
    transpile: ['bootstrap'] // Обеспечиваем правильную транспиляцию Bootstrap
  }
})
