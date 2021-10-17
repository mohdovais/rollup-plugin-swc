import swc from "./scripts/rollup-plugin-swc";
import resolve from "@rollup/plugin-node-resolve";

function config({ target, minify }) {
  return {
    input: "src/main.tsx",
    external: ["react", "react-dom"],

    output: {
      file: `dist/app-${target}${minify ? ".min" : ""}.js`,
      format: "umd",
      name: "MyApp",
      sourcemap: true,
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
      },
    },
    plugins: [
      resolve({ extensions: [".ts", ".tsx"] }),
      swc({ target, minify }),
    ],
  };
}

export default [
  config({ target: "es2020", minify: false }),
  config({ target: "es2020", minify: true }),
  config({ target: "es5", minify: false }),
  config({ target: "es5", minify: true }),
];
