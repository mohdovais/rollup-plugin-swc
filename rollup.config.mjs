const external = ["@rollup/pluginutils", "@swc/core", "node:path"];

/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = [
	{
		input: "transpiled/index.js",
		output: {
			file: "dist/index.mjs",
		},
		external,
	},
	{
		input: "transpiled/index.js",
		output: {
			file: "dist/index.js",
			format: "cjs",
		},
		external,
	},
];

export default config;
