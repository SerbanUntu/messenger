import { merge } from 'webpack-merge'
import common from './webpack.common.js'

export default merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		static: './dist',
		historyApiFallback: true,
	},
	optimization: {
		runtimeChunk: 'single',
	},
})
