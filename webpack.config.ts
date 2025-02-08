import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { fileURLToPath } from 'url'
import CompressionPlugin from 'compression-webpack-plugin'
import type { Configuration as WebpackConfig } from 'webpack'
import type { Configuration as DevServerConfig } from 'webpack-dev-server'
import webpack from 'webpack'
import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'development') {
	dotenv.config({ path: '.env.local' })
}

//! Change this fallback if running Docker locally
const serverAddress = process.env.EXPOSED_SERVER_ADDRESS ?? 'https://messenger-1094272270680.europe-west4.run.app'

// Merge both Configuration types
interface Configuration extends WebpackConfig {
	devServer?: DevServerConfig
}

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
		new webpack.DefinePlugin({
			"process.env.EXPOSED_SERVER_ADDRESS": JSON.stringify(serverAddress),
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

export default (_, argv: { mode?: string }): Configuration => {
	if (argv.mode === 'development') {
		return { ...commonConfig, ...devConfig }
	}

	if (argv.mode === 'production') {
		return { ...commonConfig, ...prodConfig }
	}

	return commonConfig
}
