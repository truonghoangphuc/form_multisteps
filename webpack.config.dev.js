const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
      minify: false,
      production: false,
      inject: ignoreScript === undefined ? "body" : ignoreScript,
    }));
  });

  return htmlOutput;
};

const htmlPlugins = generateHtmlPlugins("./app/views/pages");

module.exports = {
  mode: "development",
  entry: "./app/scripts/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.min.js"
  },
  watchOptions: {
    ignored: ["test"],
  },
  devServer: {
    host: "0.0.0.0",
    port: process.env.PORT || 3100,
    static: "./app",
    open: true,
    hot: true,
    https: {
      key: fs.readFileSync("cert.key"),
      cert: fs.readFileSync("cert.crt"),
      ca: fs.readFileSync("ca.crt"),
    }, 
    allowedHosts: [
      "form.development",
    ],
  },
  devtool: "source-map",
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
            loader: "style-loader"
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
  plugins: [].concat(htmlPlugins),
};