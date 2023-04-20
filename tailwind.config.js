/** @type {import('tailwindcss').Config} */
module.exports = {
	// corePlugins: {
	// 	preflight: false
	// },
	content: [
		"./content/**/*.{html,njk,md,js}",
		"./_includes/**/*.{html,njk,md,js}",
	],
	theme: {
		extend: {
			colors: {
				primary: "#4b32c3",
				primaryDark: "#889dfa",
			},
		},
	},
	plugins: [],
};
