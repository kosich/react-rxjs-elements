module.exports = function rxjsExternalsFactory() {
  return function rxjsExternals({ context, request }, callback) {
    if (request.match(/^rxjs(\/|$)/)) {
      var parts = request.split('/');
      if (parts.length > 2) {
        console.warn('webpack-rxjs-externals no longer supports v5-style deep imports like rxjs/operator/map etc. It only supports rxjs v6 pipeable imports via rxjs/operators or from the root.');
      }

      return callback(null, {
        root: parts,
        commonjs: request,
        commonjs2: request,
        amd: request
      });
    }

    callback();
  };
}
