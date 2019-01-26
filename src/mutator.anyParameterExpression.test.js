/* eslint-env node, jest */

const mutator = require('./mutator');

describe('mutator.anyParameterExpression', () => {
  test('returns an expected result object', () => {
    const rec = mutator.anyParameterExpression();
    expect(rec).toHaveProperty('type', 'MemberExpression');
    expect(rec).toHaveProperty('computed');
    expect(rec).toHaveProperty('object');
    expect(rec).toHaveProperty('property');
  });
});
