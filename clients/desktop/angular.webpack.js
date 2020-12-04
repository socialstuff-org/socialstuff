/**
 * Custom angular webpack configuration
 */

module.exports = (config, options) => {
  config.target = 'electron-renderer';


  if (options.fileReplacements) {
    for (let fileReplacement of options.fileReplacements) {
      if (fileReplacement.replace !== 'src/environments/environment.ts') {
        continue;
      }

      let fileReplacementParts = fileReplacement['with'].split('.');
      if (fileReplacementParts.length > 1 && ['web'].indexOf(fileReplacementParts[1]) >= 0) {
        config.target = 'web';
      }
      break;
    }
  }

  const IGNORES = [
    'crypto',
    'fs',
    'fs/promises',
    'net',
    'path',
  ];

  config.externals = [
    function (context, request, callback) {
      if (IGNORES.indexOf(request) >= 0) {
        return callback(null, 'require(\'' + request + '\')');
      }
      return callback();
    },
  ];

  return config;
};
