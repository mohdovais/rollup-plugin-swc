//@ts-check
import { swcPlugin } from "../dist/index.mjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs"

export default {
  input: "./tests/tsx/main.tsx",
  output: {
    dir: "test-builds/tsx",
    entryFileNames: "app.js",
    manualChunks(id) {
      if (id.includes("node_modules")) {
        return "vendor";
      }
    },
  },

  plugins: [
    nodeResolve({
      extensions: [".js", ".json", ".tsx", ".ts"],
    }),
    commonjs(),
    swcPlugin({ minify: true }),
  ],
};
