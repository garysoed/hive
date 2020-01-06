load({
  name: 'a',
  srcs: ['./a.txt'],
  output: 'number',
});

load({
  name: 'b',
  srcs: ['./b.txt'],
  output: 'number',
});

declare({
  name: 'plus',
  processor: './process.js',
  inputs: {
    a: type.number,
    b: type.number,
  },
});

render({
  name: 'render',
  processor: './:plus',
  inputs: {
    a: './:a',
    b: './:b',
  },
  output: './output.txt',
});
