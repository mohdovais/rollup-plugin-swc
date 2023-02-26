import { createFilter } from "@rollup/pluginutils";
import { transform } from "@swc/core";
import { applyDefaults, createSwcOptions, excludeHelpers } from "./utils";

import type {
	Options as SwcCoreOptions,
	JscConfig,
	ParserConfig
} from "@swc/core";
import type { FilterPattern } from "@rollup/pluginutils";
import type { Plugin, RenderedChunk } from "rollup";

const defaultExtensions = ["js", "jsx", "ts", "tsx", "mjs", "cjs"];
const tsRegExr = /\.tsx?$/;
const jsxRegExr = /\.[jt]sx$/;

function transformWithSwc(
	code: string,
	filename: string,
	options: SwcCoreOptions,
) {
	const isTypeScript = tsRegExr.test(filename);
	const isJSX = jsxRegExr.test(filename);

	const parser: ParserConfig = isTypeScript
		? { syntax: "typescript", tsx: isJSX }
		: { syntax: "ecmascript", jsx: isJSX };

	if (options.jsc != null) {
		options.jsc.parser = parser;
	}
	options.filename = filename;


	return transform(code, options);
}

interface PlginSwcConfig {
	inlcude?: FilterPattern;
	exclude?: FilterPattern;
	minify?: boolean;
	extensions?: string[];
	jscConfig?: JscConfig;
	replace?: Record<string, string>;
	plugin?: SwcCoreOptions["plugin"];
}

function swcPlugin(config: PlginSwcConfig = {}): Plugin {
	const {
		extensions = defaultExtensions,
		exclude,
		inlcude,
		minify = false,
		replace = {},
		jscConfig = {},
		plugin,
	} = config;

	const rollupFilter = createFilter(inlcude, excludeHelpers(exclude));
	// rome-ignore lint/style/useTemplate: <explanation>
	const extensionRegExp = new RegExp("\\.(" + extensions.join("|") + ")$");
	const filter = (id: string) => extensionRegExp.test(id) && rollupFilter(id);
	const swcOptions = createSwcOptions({
		minify,
		jsc: applyDefaults(jscConfig as Record<string, unknown>, {
			transform: {
				optimizer: {
					globals: {
						vars: replace,
					},
				},
			},
		}),
	});

	return {
		name: "swc-core",

		async transform(source: string, id: string) {
			if (!filter(id)) {
				return null;
			}

			const options: SwcCoreOptions = JSON.parse(JSON.stringify(swcOptions));

			options.minify = false;
			options.plugin = plugin;
			if (options.jsc != null) {
				options.jsc.minify = { compress: false, mangle: false };
				options.jsc.externalHelpers = true;
			}

			const result = await transformWithSwc(source, id, options);

			return result;
		},

		async renderChunk(source: string, chunk: RenderedChunk) {
			if (minify) {
				const { fileName } = chunk;
				const options: SwcCoreOptions = JSON.parse(JSON.stringify(swcOptions));

				options.minify = true;
				if (options.jsc != null) {
					options.jsc.externalHelpers = false;
					options.jsc.target = "es2022";
					options.jsc.transform = {};
				}

				return await transformWithSwc(source, fileName, options);
			}

			return null;
		},
	};
}

export {  swcPlugin };
