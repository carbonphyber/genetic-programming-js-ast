/* eslint-env node, jest */

const mutator = require('./mutator');

describe('mutator.anyConditional', () => {
  test('returns an expected result object', () => {
    const rec = mutator.anyConditional();
    expect(rec).toHaveProperty('type', 'ConditionalExpression');
    expect(rec).toHaveProperty('test');
    expect(rec).toHaveProperty('consequent');
    expect(rec).toHaveProperty('alternate');
  });
});
