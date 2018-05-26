'use strict';

const escodegen = require('escodegen'),
  esprima = require('esprima'),
  _ = require('lodash'),

  mutator = require('./src/mutator');


/**
 * 
 */
(function () {
  let code = 'function isPrime() {return true;}',
    parsed = esprima.parse(code),
    newCode;
  parsed.body[0].body.body.unshift(mutator.anyExpression());
  newCode = escodegen.generate(parsed);

  console.log('generated code');
  console.log(newCode);
})();
