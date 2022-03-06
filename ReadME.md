# rollup-plugin-swc2

An opiniated swc wrapper plugin for Rollup.

This plugin utilizes most of the @swc/core functionlities (except CSS; see rollup-plugin-parcel-css):

1. convert latest EcmaScript into backward compatible version of JavaScript
2. transpile TypeScript to JavaScript (though still need Typescript for types check)
3. transpile JSX
4. replace targeted variabled in files while transpiling; e.g. replace `process.env.NODE_ENV` with "production" / "development" etc.
5. minify: mangle and compress output
6. [experimental] transpile CommonJS module to ESM module (kind of rollup-plugin-commonjs replacement)

## Install

```console
npm i rollup-plugin-swc2 -D
```

## Usage

> default plugin target EcmaScript specification is es2020.

```javascript
import { swcPlugin } from "rollup-plugin-swc2";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/app.js",
    format: "umd",
  },
  plugins: [
    nodeResolve({
      extensions: [".js", ".json", ".tsx", ".ts"],
    }),
    swcPlugin({
      jscConfig: { target: "es5" },
      minify: true,
      commonjs: true,
    }),
  ],
};
```

## Options

```typescript
import type { FilterPattern } from "@rollup/pluginutils";
import type { JscConfig } from "@swc/core";

interface SwcPluginConfig {
  inlcude?: FilterPattern;
  exclude?: FilterPattern;
  minify?: boolean;
  extensions?: string[];
  jscConfig?: JscConfig;
  replace?: Record<string, string>;
  commonjs: boolean;
}
```

### include

A pattern which specifies the files to to act upon. By default all files defined by onfiguration `extensions` are targeted.

Type: `Array<string | RegExp> | string | RegExp | null`

Default: `null`

### exclude

A pattern which specifies the files to to be ignored by plugin. By default no files defined by configuration `extensions` are ignored.

Type: `Array<string | RegExp> | string | RegExp | null`

Default: `null`

### minify

Minify code using [@swc/core minification](https://swc.rs/docs/configuration/minification)

Type: `boolean`

Default: `false`

By default it uses following @swc/core config. Advance config can be provided using `jscConfig`

```javascript
options.jsc.minify = { compress: true, mangle: true };
```

### extensions

Specifies the extensions of file to act upon.

Type: `Array<string>`

Default: `["js", "jsx", "ts", "tsx", "mjs", "cjs"]`

> Note: The file extensions don't contain `.` dot

### jscConfig

Provides jsc configuration to @swc/core. See [JscConfig](https://swc.rs/docs/configuration/compilation) for more details

Type: `JscConfig`

Default: `{}`

### replace

Replace targeted variables in files while transpiling.

Type: `Record<string, string>`

example

```javascript
swcPlugin({
  replace: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
```

### commonjs

An experimental swc plugin written in JavaScript to convert commonjs modules to esm modules. Please be aware that not all edge cases are tested but basic React application is working.

Type: `boolean`

Default: `false`

This feature require npm package `swc-plugin-cjs2esm`. Please install package manually:

```console
npm i swc-plugin-cjs2esm -D
```

## JSX

The plugin identifies JSX file based on extensions `.jsx` and `.tsx` and convert using [JSX Runtime](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) introduced in React 17 instead of `React.createElement`.

**classic** runtime transformation can be acheived using JscConfig:

```javascript
swcPlugin({
  jscConfig: {
    transform: {
      react: {
        runtime: "classic",
      },
    },
  },
});
```

JSX prgma and pragmaFrag can also be provided using `jscConfig.transform.react`. e.g. preact:

```javascript
swcPlugin({
  jscConfig: {
    transform: {
      react: {
        runtime: "classic",
        pragma: "h",
      },
    },
  },
});
```
