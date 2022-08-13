const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const generateHtmlPlugins = (templateDir, folder, ignoreScript) => {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  const htmlOutput = [];
  templateFiles.map((item) => {
    // Split names and extension
    const parts = item.split(".");
    const name = parts[0];
    const extension = parts[1];
    return htmlOutput.push(new HtmlWebpackPlugin({
      chunks: ["main", `${name}`],
      filename: folder ? `${folder}${name}.html` : `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      minify: true,
      production: true,
      inject: ignoreScript === undefined ? "body" : ignoreScript,
    }));
  });

  return htmlOutput;
};

const htmlPlugins = generateHtmlPlugins("./app/views/pages");

module.exports = {
  mode: "production",
  entry: "./app/scripts/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "scripts/app.min.js"
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
        // vendor chunk
        vendor: {
          name: 'vendor',
          // sync + async chunks
          chunks: 'all',
          // import file path containing node_modules
          test: /(node_modules)/,
        },
      },
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-proposal-object-rest-spread"]
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          }, {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          }, {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "autoprefixer",
                    {
                      // Options
                    },
                  ],
                ]
              }
            },
          }, {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.pug$/,
        use: [{
          loader: "pug-loader",
          options: {
            self: true,
          }
        }],
      },
      {
        test: /.(fonts.*).(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [{
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
          },
        }],
      },
      {
        test: /.(images.*).(png|jpe?g|gif|svg)$/,
        use: [{
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: (url, resourcePath) => {
              // console.log(url, '-', resourcePath);
              if (/(upload)/.test(resourcePath)) {
                // return `assets/images/upload/${url}`;
                return path.resolve(__dirname, resourcePath).split(`${path.sep}app${path.sep}`)[1];
              }

              return `assets/images/${url}`;
            },
            esModule: false,
          },
        }],
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'assets/styles/app.min.css',
    }),
].concat(htmlPlugins),
};