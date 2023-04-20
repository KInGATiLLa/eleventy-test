---
title: How to use Typescript with Eleventy?
description: How to use Typescript with Eleventy?
permalink: "/blog/{{ title | slugify }}/"
date: 2023-04-26
tags:
  - eleventy
  - typescript
---

## Intro

My third time looking at this, and finally, a simple end-to-end answer:

### If you want

- tsx templates
- a typescript eleventy file
- eleventy serve to work out of the box - with code changes working correctly, including to the config file itself
- a really simple solution

### Then do this

```json
  "scripts": {
    "dev": "node --require esbuild-register node_modules/.bin/eleventy --config=.eleventy.ts --serve",
    "build": "node --require esbuild-register node_modules/.bin/eleventy --config=.eleventy.ts"
  },
```

### .eleventy.ts

```js
// must be module.exports, not export defult.
module.exports = function (eleventyConfig: any) {
  eleventyConfig.addExtension('11ty.tsx', {
    key: '11ty.js',
  });

  // dev server doesn't spider js dependencies properly, so opt for hard browsersync with watch.
  eleventyConfig.setServerOptions({
    module: "@11ty/eleventy-server-browsersync",
    snippet: true,
    watch: true,
    server: <your output folder>
  });
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react"
    "jsxFactory": "h",
    "jsxFragmentFactory": "h.Fragment",
  }
}
```

### src/pages/index.11ty.tsx

```js
import h from "vhtml";

export const data = {
	title: "Hello world",
};

export function render() {
	return <h1>{data.title}</h1>;
}
```

### run commands

```bash
yarn add @11ty/eleventy @11ty/eleventy-server-browsersync esbuild esbuild-register vhtml @types/vhtml
```

```bash
yarn dev
```
