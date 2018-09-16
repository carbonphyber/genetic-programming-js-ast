//
const mutator = require('./mutator');

describe('mutator.anyReturnStatement', () => {
  test('returns an expected result object', () => {
    let rec = mutator.anyReturnStatement();
    expect(rec).toHaveProperty('type', 'ReturnStatement');
    expect(rec).toHaveProperty('argument');
  });
});
