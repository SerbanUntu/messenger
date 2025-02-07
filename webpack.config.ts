import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { fileURLToPath } from 'url'
import CompressionPlugin from 'compression-webpack-plugin'
import type { Configuration } from 'webpack'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const commonConfig: Configuration = {
	entry: './src/index.js',
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [
					'style-loader',
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: ['postcss-preset-env', 'autoprefixer', '@tailwindcss/postcss'],
							},
						},
					},
				],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(js|jsx|ts|tsx)$/i,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env',
							['@babel/preset-react', { runtime: 'automatic' }],
							'@babel/preset-typescript',
						],
					},
				},
			},
		],
	},
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx'],
		alias: {
			'@': path.resolve(__dirname),
		},
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
		clean: true,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.html',
			favicon: './public/favicon.ico',
		}),
		new CompressionPlugin({
			filename: '[path][base].br',
			algorithm: 'brotliCompress',
			test: /\.(js|css|html|svg)$/,
			compressionOptions: {
				level: 11
			},
			threshold: 10240,
			minRatio: 0.8,
			deleteOriginalAssets: false,
		}),
	],
}

const devConfig: Configuration = {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		static: './dist',
		historyApiFallback: true,
	},
	optimization: {
		runtimeChunk: 'single',
	},
}

const prodConfig: Configuration = {
	mode: 'production',
	devtool: 'source-map',
}

export default (_, argv): Configuration => {
	if (argv.mode === 'development') {
		return { ...commonConfig, ...devConfig }
	}

	if (argv.mode === 'production') {
		return { ...commonConfig, ...prodConfig }
	}

	return commonConfig
}
