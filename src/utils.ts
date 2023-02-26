import type { FilterPattern } from "@rollup/pluginutils";
import type { Options as SwcCoreOptions } from "@swc/core";
import path from "node:path";

type Key = string | number | symbol;

function excludeHelpers(exclude?: FilterPattern) {
  const excludeArray = Array.isArray(exclude)
    ? exclude
    : exclude == null
      ? []
      : [exclude];

  excludeArray.push(
    new RegExp(path.join("node_modules", "@swc", "helpers"), "i")
  );
  return excludeArray;
}

const _toString = Object.prototype.toString;

function isObject(item: unknown): item is Record<Key, unknown> {
  return _toString.call(item) === "[object Object]"
}

function applyDefaults<T extends Record<string, unknown>>(config: Partial<T> | undefined, defaults: T) {
  if (config == null) return defaults;
  for (var key in defaults) {
    const defaultValue = defaults[key];
    if (isObject(defaultValue)) {
      // @ts-ignore
      config[key] = applyDefaults(config[key], defaultValue);
    }
    else if (config[key] === undefined) config[key] = defaultValue;
  }
  return config;
}


function createSwcOptions(options: SwcCoreOptions = {}): SwcCoreOptions {
  const minify = options.minify === true;
  const defaults: SwcCoreOptions = {
    sourceMaps: true,
    jsc: {
      externalHelpers: true,
      target: "es2022",
      loose: false,
      transform: {
        react: {
          runtime: "automatic",
        },
        optimizer: {
          simplify: false,
          globals: {
            vars: {
              "process.env.NODE_ENV": JSON.stringify(
                minify ? "production" : "development"
              ),
            },
          },
        },
      },
      minify: minify
        ? {
          compress: true,
          mangle: true,
        }
        : {},
    },
  };

  return applyDefaults(options as Record<string, unknown>, defaults as Record<string, unknown>);
}

function runtimeRequire<T>(module: string) {
  try {
    require.resolve(module);
    return require(module) as T;
  } catch (e) {
    throw `Module ${module} is not installed. Please run "npm i ${module} -D"`;
  }
}

export { applyDefaults, excludeHelpers, createSwcOptions, runtimeRequire };
