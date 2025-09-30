const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const webpack = require("webpack")

const CODE_JAVA_HOST = process.env.CODE_JAVA_HOST || "http://localhost:8085"

module.exports = {
  entry: path.resolve(__dirname, "..", "src", "index.tsx"),
  output: {
    filename: "static/js/[name].[contenthash].js",
    path: path.resolve(__dirname, "..", "dist"),
    clean: true,
    publicPath: "/"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader"
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "..", "public", "index.html"),
      favicon: false
    }),
    new webpack.DefinePlugin({
      "process.env.CODE_JAVA_HOST": JSON.stringify(CODE_JAVA_HOST)
    })
  ]
}
