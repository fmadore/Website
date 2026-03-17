import postcssGlobalData from '@csstools/postcss-global-data';
import postcssCustomMedia from 'postcss-custom-media';

export default {
	plugins: [
		// 1. Make the variables available to every file
		postcssGlobalData({
			files: ['./src/styles/base/media.css']
		}),
		// 2. Transform the @media (--md) syntax into standard CSS
		postcssCustomMedia()
	]
};
