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

declare({
  name: 'commit',
  as: serial({
    cmds: [
      shell(({vars}) => ({bin: 'eslint', flags: ['**/*.ts', '--fix', '--ignore-pattern', 'out']})),
      shell({bin: 'webpack'}),
      shell({
        bin: 'node',
        flags: [
          'node_modules/jasmine/bin/jasmine.js',
          'out/test.js',
        ],
      }),
      shell({bin: 'git', flags: ['add', '.']}),
      shell({bin: 'git', flags: ['commit', '-a']}),
    ],
  }),
});