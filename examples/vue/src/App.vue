<script setup lang="ts">
import { ref } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

const data = ref({
  name: "John",
  age: 30,
  address: {
    city: "New York",
    postalCode: "10001",
  },
  hobbies: ["reading", "travelling"],
  isActive: true,
  data: [1, 2, 3],
  test: null,
});
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  <wc-json-view>{{ data }}</wc-json-view>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
