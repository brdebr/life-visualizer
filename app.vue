<template>
  <div class="container mx-auto min-h-[100dvh]">
    <h1 class="text-slate-600">Hello world</h1>
    <p>Today is {{ $dayjs().format('DD/MM/YYYY HH:mm') }}</p>
    <p>From my Nuxt App</p>
  </div>
</template>
