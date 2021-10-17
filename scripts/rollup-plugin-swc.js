import swc from "@swc/core";

const regexp_typescript = /\.tsx?$/;
const regexp_jsx = /\.[jt]sx$/;

const randomId = Date.now().toString(32);
const createElement = "createElement$" + randomId;
const Fragment = "Fragment$" + randomId;
const virtual_module_name = "virtual$" + randomId;
const virtaul_module = `import * as React from "react";
export const ${createElement} = React.createElement;
export const ${Fragment} = React.Fragment;
`;
const import_virtual = `import { ${createElement}, ${Fragment} } from "${virtual_module_name}";`;

function transpile_with_swc(config) {
  const { code, fileName, target = "es5" } = config;
  const jsx = regexp_jsx.test(fileName);

  const parser = regexp_typescript.test(fileName)
    ? {
        syntax: "typescript",
        tsx: jsx,
      }
    : {
        syntax: "ecmascript",
        jsx,
      };

  return swc.transform((jsx ? import_virtual : "") + code, {
    filename: fileName,
    sourceMaps: true,

    jsc: {
      parser,
      target,
      externalHelpers: true,
      transform: {
        react: {
          pragma: createElement,
          pragmaFrag: Fragment,
        },
      },
    },
  });
}

function minify_with_swc(options) {
  const { code, fileName, sourcemap, target, minify: config } = options;

  let minify;

  if (config === true) {
    minify = {
      compress: {
        dead_code: true,
        computed_props: true,
        conditionals: true,
        unused: true,
      },
      mangle: true,
    };
  } else {
    const { compress = {}, mangle = {} } = config;
    minify = { compress, mangle };
  }

  return swc.transform(code, {
    filename: fileName,
    sourceMaps: sourcemap,
    jsc: {
      target,
      minify,
    },
    minify: true,
  });
}

export default function pluginSwc(config = {}) {
  const { minify = true, target } = config;

  return {
    name: "swc",
    resolveId(source) {
      if (source === virtual_module_name) {
        return source;
      }
      return null;
    },
    load(source) {
      if (source === virtual_module_name) {
        return virtaul_module;
      }
      return null;
    },
    async transform(code, fileName) {
      if (!regexp_typescript.test(fileName)) {
        return null;
      }

      return await transpile_with_swc({ code, fileName, target });
    },
    async renderChunk(code, chunk, outputOptions) {
      const { fileName } = chunk;
      const { sourcemap } = outputOptions;

      if (minify) {
        return await minify_with_swc({
          code,
          fileName,
          sourcemap,
          target,
          minify,
        });
      }

      return null;
    },
  };
}
