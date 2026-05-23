const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./bot.js",
  target: "node",
  mode: "production",
  externals: [nodeExternals()], // Do not bundle node_modules
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bot.bundle.js",
  },
  resolve: {
    extensions: [".js"],
  },
};
