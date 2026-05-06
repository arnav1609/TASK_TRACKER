const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// These packages ship ESM `.mjs` or `build/modern` files that use `import.meta.env`
// which Metro's web bundler cannot handle. We intercept their imports and force
// Metro to use each package's `main` field (CJS build) instead.
const CJS_FORCE_PACKAGES = {
  'zustand': path.resolve(__dirname, 'node_modules/zustand/index.js'),
  '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query/build/legacy/index.cjs'),
  '@tanstack/query-core': path.resolve(__dirname, 'node_modules/@tanstack/query-core/build/legacy/index.cjs'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (CJS_FORCE_PACKAGES[moduleName]) {
    const filePath = CJS_FORCE_PACKAGES[moduleName];
    if (fs.existsSync(filePath)) {
      return { filePath, type: 'sourceFile' };
    }
  }

  // Also redirect zustand subpaths (e.g. zustand/middleware) to CJS
  if (moduleName.startsWith('zustand/')) {
    const subPath = moduleName.slice('zustand/'.length);
    const cjsPath = path.resolve(__dirname, 'node_modules/zustand', subPath + '.js');
    if (fs.existsSync(cjsPath)) {
      return { filePath: cjsPath, type: 'sourceFile' };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
