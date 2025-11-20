const postcssGlobalData = require('@csstools/postcss-global-data');
const postcssCustomMedia = require('postcss-custom-media');

module.exports = {
	plugins: [
		// 1. Make the variables available to every file
		postcssGlobalData({
			files: ['./src/styles/base/media.css']
		}),
		// 2. Transform the @media (--md) syntax into standard CSS
		postcssCustomMedia()
	]
};
