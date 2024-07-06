# vite-plugin-wcomp

A Vite plugin to load web components of wcomp;

## Installation

```bash
pnpm install vite-plugin-wcomp -D
```

## Usage

```javascript
import { defineConfig } from "vite";
// pnpm i @types/node vite-plugin-wcomp -D
import { fileURLToPath, URL } from "node:url";\
import { wcomp } from "vite-plugin-wcomp";

export default defineConfig({
  plugins: [
    // vue({
    //   template: {
    //     compilerOptions: {
    //       isCustomElement: (tag: any) => tag.startsWith('wc-')
    //     }
    //   }
    // }),
    // wcomp({
    //   cacheDir: fileURLToPath(new URL("./wcomp_modules", import.meta.url)),
    //   prefix: "wc-",
    // }),
    wcomp()
  ],
});
```

demo: .vue
```vue
<script setup lang="ts">
import { ref } from "vue";
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
  <wc-json-view>{{ data }}</wc-json-view>
</tempate>
```
