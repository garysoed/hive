import {test, should, assert} from '@gs-testing/main';
import { parse } from './grammar';

test('grammar', () => {
  should.only(`handle parsing comments`, () => {
    const INPUT = `
# Comment 1

    # Comment 2
`;
    parse(INPUT);
    assert(() => parse(INPUT)).toNot.throw();
  });
});
