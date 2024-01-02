const testNode = shell({
  bin: 'node',
  flags: [
    'node_modules/jasmine/bin/jasmine.js',
    'out/test.js',
  ],
});
const webpack = shell({bin: 'webpack'});

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
  name: 'test',
  as: parallel({
    cmds: [webpack, testNode],
  }),
});

declare({
  name: 'commit',
  as: serial({
    cmds: [
      shell(() => ({bin: 'eslint', flags: ['**/*.ts', '--fix', '--ignore-pattern', 'out']})),
      shell({bin: 'webpack'}),
      testNode,
      shell({bin: 'git', flags: ['add', '.']}),
      shell({bin: 'git', flags: ['commit', '-a']}),
    ],
  }),
});