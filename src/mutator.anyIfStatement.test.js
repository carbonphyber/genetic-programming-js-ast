//
const mutator = require('./mutator');

describe('mutator.anyIfStatement', () => {
  test('returns an expected result object', () => {
    let rec = mutator.anyIfStatement();
    expect(rec).toHaveProperty('type', 'IfStatement');
    expect(rec).toHaveProperty('test');
    expect(rec).toHaveProperty('consequent');
  });
});
