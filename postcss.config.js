import postcssPresetEnv from 'postcss-preset-env';
import postcssImport from 'postcss-import';
import postcssNesting from 'postcss-nesting';
import postcssCustomMedia from 'postcss-custom-media';
import postcssLogical from 'postcss-logical';
import postcssGlobalData from '@csstools/postcss-global-data';

export default {
	plugins: [
		postcssImport(),
		postcssGlobalData({
			files: ['./src/styles/base/media-queries.css']
		}),
		postcssCustomMedia({ preserve: false }),
		postcssNesting(),
		postcssLogical(),
		postcssPresetEnv({
			stage: 1,
			features: {
				'nesting-rules': false,
				'custom-media-queries': false,
				'logical-properties-and-values': false,
				'media-query-ranges': true,
				'focus-visible-pseudo-class': false
			},
			autoprefixer: {
				grid: 'autoplace'
			}
		})
	]
};
