export default {
  ignoredRouteFiles: ["**/.*"],
  serverDependencies: [
    '@rainbow-me/rainbowkit',
    '@rainbow-me/rainbowkit/wallets',
    'wagmi',
  ],

  browserNodeBuiltinsPolyfill: { 
    modules: { 
      buffer: true,
      events: true,
    } 
  }
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
};

