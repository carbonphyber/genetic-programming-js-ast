//
const mutator = require('./mutator');

describe('mutator.anyBlockStatement', () => {
  test('returns an expected result object', () => {
    let rec = mutator.anyBlockStatement();
    expect(rec).toHaveProperty('type', 'BlockStatement');
    expect(rec).toHaveProperty('body');
  });
});
