const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');
const config = getDefaultConfig(__dirname);
// Allow expo-sqlite's wasm worker to be bundled as an asset on web
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const isSymlink = fs.lstatSync(nodeModulesPath).isSymbolicLink();
if (isSymlink) {
  const realNodeModules = fs.realpathSync(nodeModulesPath);
  config.watchFolders = [realNodeModules];
  config.resolver.nodeModulesPaths = [realNodeModules];
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName.startsWith('./opt/hostedapp')) {
      moduleName = moduleName.replace(/^\.\//, '/');
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}
module.exports = config;
