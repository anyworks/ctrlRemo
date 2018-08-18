module.exports = () => {
  return {
    files: [
      'index.js',
      "public/index.html"
    ],
    tests: [
      'tests/*Spec.js'
    ],
    "testFramework"  : "jasmine",
    env: {
      type: 'node'
    },
    debug: true,
    hints: {
      commentAutoLog: 'out:'
    }
  };
};
