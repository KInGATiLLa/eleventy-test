require("dotenv").config();
const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const htmlmin = require("html-minifier");
const markdownItAnchor = require("markdown-it-anchor");
/*
Eleventy plugins
*/
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
/*
PostCSS Tailwindcss
*/
const postcss = require("postcss");
const postcssImport = require("postcss-import");
const tailwindcss = require("tailwindcss");
const tailwindcssNesting = require("tailwindcss/nesting");
const autoprefixer = require("autoprefixer");

const prod = process.env.NODE_ENV === "production";

/** @param {import("@11ty/eleventy").UserConfig} config */
module.exports = function (config) {
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	// config.addPassthroughCopy({
	// 	"./public/": "/assets/",
	// 	"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css",
	// });

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline.
	config.addWatchTarget("content/**/*.{svg,gif,webp,png,jpeg}");

	// App plugins
	config.addPlugin(require("./eleventy.config.drafts.js"));
	config.addPlugin(require("./eleventy.config.images.js"));

	// Official plugins
	config.addPlugin(pluginRss);
	config.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 },
	});
	config.addPlugin(pluginNavigation);
	config.addPlugin(EleventyHtmlBasePlugin);

	config.addPlugin(pluginBundle, {
		toFileDirectory: "assets/css",
		transforms: [
			async function (content) {
				if (this.type === "css") {
					const { css } = await postcss([
						postcssImport({
							path: ["./public/css", "./node_modules"],
						}),
						tailwindcssNesting,
						tailwindcss,
						autoprefixer,
					]).process(content, {
						from: this.page.inputPath,
						to: null,
					});
					if (prod) {
						const { styles } = new CleanCSS({}).minify(css);
						return styles;
					}
					return css;
				}
				// if (prod && this.type === "js") {

				// }
				return content;
			},
		],
	});

	// Filters
	// config.addFilter("cssmin", function (code) {
	// 	console.log("code :>> ", code);

	// 	return new CleanCSS({}).minify(code).styles;
	// });

	config.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
			format || "dd LLLL yyyy"
		);
	});

	config.addFilter("htmlDateString", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
	});

	// Get the first `n` elements of a collection.
	config.addFilter("head", (array, n) => {
		if (!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if (n < 0) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	config.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return all the tags used in a collection
	config.addFilter("getAllTags", (collection) => {
		let tagSet = new Set();
		for (let item of collection) {
			(item.data.tags || []).forEach((tag) => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	config.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(
			(tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1
		);
	});

	config.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(
			(tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1
		);
	});

	config.addFilter("log", function log(...items) {
		// console.log("this.page :>> ", this.page);
		// console.log("this.eleventy :>> ", this.eleventy);

		return console.log(items);
	});

	config.addFilter("json", function json(items) {
		// console.log("this.page :>> ", this.page);
		// console.log("this.eleventy :>> ", this.eleventy);

		return `
			<pre>
				${JSON.stringify(items, null, 2)}
			</pre>
		`;
	});

	// Customize Markdown library settings:
	config.amendLibrary("md", (mdLib) => {
		mdLib.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "header-anchor",
				symbol: "#",
				ariaHidden: false,
			}),
			level: [1, 2, 3, 4],
			slugify: config.getFilter("slugify"),
		});
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// config.setServerPassthroughCopyBehavior("passthrough");

	if (prod) {
		config.addTransform("htmlmin", function (content) {
			// Prior to Eleventy 2.0: use this.outputPath instead
			if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
				let minified = htmlmin.minify(content, {
					useShortDoctype: true,
					removeComments: true,
					collapseWhitespace: true,
				});
				return minified;
			}
			return content;
		});
	}

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: ["md", "njk", "html", "liquid"],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: "content", // default: "."
			includes: "../_includes", // default: "_includes"
			data: "../_data", // default: "_data"
			output: "dist",
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
	};
};
