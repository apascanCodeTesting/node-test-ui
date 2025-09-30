const path = require("path")
const common = require("./webpack.common")

module.exports = {
  ...common,
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    static: {
      directory: path.resolve(__dirname, "..", "public")
    },
    port: 3100,
    historyApiFallback: true,
    client: {
      overlay: false
    }
  }
}
