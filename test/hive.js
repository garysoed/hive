hive.load({
  name: 'a',
  srcs: ['./a.txt'],
  output: 'number',
});

hive.load({
  name: 'b',
  srcs: ['./b.txt'],
  output: 'number',
});

hive.declare({
  name: 'plus',
  processor: './process.js',
  inputs: {
    a: 'number',
    b: 'number',
  },
  output: 'number',
});

hive.render({
  name: 'render',
  processor: './:plus',
  inputs: {
    a: './:a',
    b: './:b',
  },
  output: './output.txt',
});
