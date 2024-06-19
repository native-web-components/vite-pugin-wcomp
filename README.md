# vite-plugin-wcomp

A Vite plugin to load web components of wcomp;

## Installation

```bash
npm install vite-plugin-wcomp
```

## Usage

```javascript
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import wcomp from "vite-plugin-wcomp";

export default defineConfig({
  plugins: [
    wcomp({
      cacheDir: fileURLToPath(new URL(".", import.meta.url)), // Cache directory
      prexfix: "wc-",
    }),
  ],
});
```
