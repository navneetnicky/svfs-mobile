module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@services": "./src/services",
            "@store": "./src/store",
            "@hooks": "./src/hooks",
            "@lib": "./src/lib",
            "@ui": "./src/components/ui",
          },
        },
      ],
    ],
  };
};
