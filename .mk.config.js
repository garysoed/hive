declare({
  name: 'link',
  as: shell({
    bin: 'npm',
    flags: [
      'link',
      'dev',
      'devbase',
      'gs-testing',
      'gs-types',
      'grapevine',
    ],
  }),
});

declare({
  name: 'jasmine',
  as: shell({
    bin: 'node',
    flags: [
      'node_modules/jasmine/bin/jasmine.js',
      'out/test.js',
    ],
  }),
});