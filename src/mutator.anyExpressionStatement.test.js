//
const mutator = require('./mutator');

describe('mutator.anyExpressionStatement', () => {
  test('returns an expected result object', () => {
    let rec = mutator.anyExpressionStatement();
    expect(rec).toHaveProperty('type', 'ExpressionStatement');
    expect(rec).toHaveProperty('expression');
  });
});
