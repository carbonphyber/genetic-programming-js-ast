/* eslint-env node */

const flatten = require('lodash/flatten');
const map = require('lodash/map');
const range = require('lodash/range');
const sample = require('lodash/sample');
const shuffle = require('lodash/shuffle');
const union = require('lodash/union');

let anyExpression;

const createWeightedArray = (len, fill) => new Array(len).fill(fill);

const LOGICAL_OPERATORS = flatten([
  createWeightedArray(1, '&&'),
  createWeightedArray(1, '||'),
]);

const BINARY_OPERATORS = flatten([
  createWeightedArray(7, '==='),
  createWeightedArray(5, '!=='),
  createWeightedArray(5, '=='),
  createWeightedArray(4, '!='),
  createWeightedArray(4, '<'),
  createWeightedArray(4, '<='),
  createWeightedArray(4, '>='),
  createWeightedArray(4, '>'),
  createWeightedArray(7, '||'),
  createWeightedArray(1, '&'),
  createWeightedArray(3, '|'),
  createWeightedArray(3, '^'),
  createWeightedArray(1, '<<'),
  createWeightedArray(1, '>>'),
  createWeightedArray(1, '>>>'),
  createWeightedArray(6, '%'),
  createWeightedArray(4, '+'),
  createWeightedArray(4, '-'),
  createWeightedArray(2, '/'),
  createWeightedArray(2, '*'),
  createWeightedArray(1, '**'),
  createWeightedArray(1, 'in'),
  createWeightedArray(1, 'instanceof'),
]);

const UNARY_OPERATORS = flatten([
  createWeightedArray(10, '!'),
  createWeightedArray(3, '+'),
  createWeightedArray(5, '-'),
  createWeightedArray(3, '~'),
  createWeightedArray(1, '++'),
  createWeightedArray(1, '--'),
  createWeightedArray(3, 'typeof'),
  createWeightedArray(1, 'void'),
  createWeightedArray(1, 'delete'),
]);

const BINARY_ASSIGNMENT_OPERATORS = flatten([
  createWeightedArray(11, '='),
  createWeightedArray(5, '+='),
  createWeightedArray(5, '-='),
  createWeightedArray(1, '**='),
  createWeightedArray(1, '*='),
  createWeightedArray(1, '/='),
  createWeightedArray(1, '%='),
  createWeightedArray(1, '<<='),
  createWeightedArray(1, '>>='),
  createWeightedArray(1, '>>>='),
  createWeightedArray(1, '&='),
  createWeightedArray(1, '^='),
  createWeightedArray(1, '|='),
]);

const STRINGS = flatten([
  createWeightedArray(1, 'foo'),
  createWeightedArray(1, 'bar'),
  createWeightedArray(1, 'foobar'),
  createWeightedArray(1, 'undefined'),
  createWeightedArray(1, 'boolean'),
  createWeightedArray(1, 'number'),
  createWeightedArray(1, 'string'),
  createWeightedArray(1, 'object'),
]);

const NUMERIC_COEFFICIENT = range(16);

const NUMERIC_POSITIVE = flatten([
  createWeightedArray(2, false),
  createWeightedArray(3, true),
]);

const toIdentifier = function toIdentifier(l) {
  return {
    type: 'Identifier',
    name: l,
  };
};

const toLiteral = function toLiteral(l) {
  return {
    type: 'Literal',
    value: l,
    raw: JSON.stringify(l),
  };
};

const anyBoolean = function anyBoolean() {
  const v = sample([false, true]);
  return toLiteral(v);
};

const anyNull = function anyNull() {
  return toLiteral(null);
};

const anyUndefined = function anyUndefined() {
  return toIdentifier(undefined);
};

const anyNaN = function anyNaN() {
  return toLiteral(NaN);
};

const anyInfinity = function anyInfinity() {
  return toLiteral(Infinity);
};

const anyString = function anyString() {
  const v = sample(STRINGS);
  return toLiteral(v);
};

const anyNumber = function anyNumber() {
  const v = sample(NUMERIC_COEFFICIENT);

  const isPositive = sample(NUMERIC_POSITIVE);

  const ret = toLiteral(v);
  return isPositive
    ? ret
    : {
      type: 'UnaryExpression',
      operator: '-',
      argument: ret,
      prefix: true,
    };
};

const UNARY_OPERANDS = flatten([
  createWeightedArray(3, anyBoolean),
  createWeightedArray(3, anyNumber),
  createWeightedArray(1, anyString),
]);

const anyBinaryOperation = function anyBinaryOperation() {
  const v = sample(BINARY_OPERATORS);
  return {
    type: 'BinaryExpression',
    operator: v,
    left: anyExpression(),
    right: anyExpression(),
  };
};


const anyLogicalExpression = function anyLogicalExpression() {
  const v = sample(LOGICAL_OPERATORS);
  return {
    type: 'LogicalExpression',
    operator: v,
    left: anyExpression(),
    right: anyExpression(),
  };
};

const ARGUMENTS_INDEXES = flatten([
  createWeightedArray(5, 0),
  createWeightedArray(4, 1),
  createWeightedArray(2, 2),
]);

const anyParameterExpression = function anyParameterExpression() {
  return {
    type: 'MemberExpression',
    computed: true,
    object: {
      type: 'Identifier',
      name: 'arguments',
    },
    property: toLiteral(sample(ARGUMENTS_INDEXES)),
  };
};

const anyUnaryOperation = function anyUnaryOperation() {
  const v = sample(UNARY_OPERATORS);

  const operand = sample(UNARY_OPERANDS)();
  return {
    type: 'UnaryExpression',
    operator: v,
    argument: operand,
    prefix: true,
  };
};

const BLOCK_STATEMENT_QUANTITIES = flatten([
  createWeightedArray(15, 1),
  createWeightedArray(5, 2),
  createWeightedArray(2, 3),
]);

const CONDITIONAL_TESTS = flatten([
  createWeightedArray(3, anyBoolean),
  createWeightedArray(2, anyNumber),
  createWeightedArray(2, anyString),
  createWeightedArray(4, anyBinaryOperation),
  createWeightedArray(1, anyLogicalExpression),
  createWeightedArray(1, anyUnaryOperation),
]);

const CONDITIONAL_CONSEQUENTS = flatten([
  createWeightedArray(1, anyBoolean),
  createWeightedArray(1, anyNumber),
  createWeightedArray(1, anyString),
  createWeightedArray(1, anyBinaryOperation),
  createWeightedArray(1, anyLogicalExpression),
  createWeightedArray(1, anyUnaryOperation),
]);

const CONDITIONAL_ALTERNATES = flatten([
  createWeightedArray(1, anyBoolean),
  createWeightedArray(1, anyNumber),
  createWeightedArray(1, anyString),
  createWeightedArray(1, anyBinaryOperation),
  createWeightedArray(1, anyLogicalExpression),
  createWeightedArray(1, anyUnaryOperation),
]);

const anyConditional = function anyConditional() {
  const exA = sample(CONDITIONAL_TESTS);
  const exB = sample(CONDITIONAL_CONSEQUENTS);
  const exC = sample(CONDITIONAL_ALTERNATES);
  return {
    type: 'ConditionalExpression',
    test: exA(),
    consequent: exB(),
    alternate: exC(),
  };
};

const EXPRESSIONS = flatten([
  createWeightedArray(4, anyParameterExpression),
  createWeightedArray(2, anyBoolean),
  createWeightedArray(4, anyNumber),
  createWeightedArray(1, anyString),
  createWeightedArray(2, anyNull),
  createWeightedArray(1, anyUndefined),
  createWeightedArray(1, anyNaN),
  createWeightedArray(1, anyInfinity),
  createWeightedArray(10, anyBinaryOperation),
  createWeightedArray(1, anyLogicalExpression),
  createWeightedArray(1, anyUnaryOperation),
  createWeightedArray(2, anyConditional),
]);

// can't `const` this func as there is a "chicken or the egg paradox"
anyExpression = () => {
  const ex = sample(EXPRESSIONS);
  return ex();
};

const anyExpressionStatement = function anyExpressionStatement() {
  return {
    type: 'ExpressionStatement',
    expression: anyExpression(),
  };
};

const anyReturnStatement = function anyReturnStatement() {
  return {
    type: 'ReturnStatement',
    argument: anyExpression(),
  };
};

const anyBlockStatement = function anyBlockStatement() {
  const BLOCK_STATEMENTS = flatten([
    createWeightedArray(1, anyReturnStatement),
    createWeightedArray(1, anyBlockStatement),
    createWeightedArray(1, anyLogicalExpression),
    createWeightedArray(4, anyExpressionStatement),
  ]);
  const numOfStatements = sample(BLOCK_STATEMENT_QUANTITIES);


  const pickAStatement = () => (sample(BLOCK_STATEMENTS)());
  return {
    type: 'BlockStatement',
    body: map(range(0, numOfStatements), pickAStatement),
  };
};


const anyIfStatement = function anyIfStatement() {
  const IF_STATEMENT_CONSEQUENTS = flatten([
    createWeightedArray(1, anyBlockStatement),
    createWeightedArray(1, anyIfStatement),
    createWeightedArray(1, anyLogicalExpression),
    createWeightedArray(4, anyExpressionStatement),
  ]);


  const IF_STATEMENT_ALTERNATES = flatten([
    createWeightedArray(1, anyBlockStatement),
    createWeightedArray(1, anyIfStatement),
    createWeightedArray(1, anyLogicalExpression),
    createWeightedArray(4, anyExpressionStatement),
  ]);
  const ret = {
    type: 'IfStatement',
    test: anyExpression(),
    consequent: sample(IF_STATEMENT_CONSEQUENTS)(),
  };
    // only define an `else` in some cases
  if (sample([false, true])) {
    ret.alternate = sample(IF_STATEMENT_ALTERNATES)();
  }
  return ret;
};


//

const shuffleSomething = function shuffleSomething(entity) {
  let ret = entity;
  const pos = Math.floor(Math.random() * ret.length);

  if (!ret[pos]) {
    return ret;
  } if (sample([true, false])) {
    // shuffle a term
    ret = shuffle(ret);
  } else if (ret[pos].type === 'BlockStatement') {
    ret[pos].body = shuffle(ret[pos].body);
  } else if (ret[pos].type === 'IfStatement') {
    const c = ret[pos].consequent;
    const a = ret[pos].alternate;
    ret[pos].consequent = a;
    ret[pos].alternate = c;
  } else if (ret[pos].type === 'LogicalExpression' || ret[pos].type === 'BinaryExpression') {
    const l = ret[pos].left;
    const r = ret[pos].right;
    ret[pos].right = l;
    ret[pos].left = r;
  } else {
    // shuffle a branch from the subbranch of the AST
    ret = shuffle(ret);
  }
  return ret;
};


//

const deleteSomething = function deleteSomething(entity) {
  let ret = entity;
  const pos = Math.floor(Math.random() * ret.length);

  if (!ret[pos] || sample([true, false])) {
    // delete a term
    ret = ret.splice(pos, 1);
  } else if (ret[pos].type === 'BlockStatement') {
    ret[pos].body.splice(Math.floor(Math.random() * ret[pos].body.length), 1);
  } else if (ret[pos].type === 'IfStatement') {
    ret[pos].alternate = null;
  } else {
    // delete a branch from the subbranch of the AST
    ret = ret.splice(pos, 1);
  }
  return ret;
};


//

const insertSomething = function insertSomething(entity) {
  let ret = entity;
  // update a term
  const pos = sample(range(ret.length));
  const newElem = anyBlockStatement();

  if (ret.length < 1) {
    ret.push(newElem);
  } else if (!ret[pos]) {
    ret[pos] = newElem;
  } else if (sample([true, false])) {
    // insert a term
    if (pos === 0) {
      ret = union([newElem], ret);
    } else if (pos === ret.length) {
      ret = union(ret, [newElem]);
    } else {
      ret = union(ret.slice(0, pos + 1), [newElem], ret.slice(pos + 1));
    }
  } else if (ret[pos].type === 'BlockStatement') {
    ret = ret[pos].body;
    if (pos === 0) {
      ret = union([newElem], ret);
    } else if (pos === ret.length) {
      ret = union(ret, [newElem]);
    } else {
      ret = union(ret.slice(0, pos + 1), [newElem], ret.slice(pos + 1));
    }
  } else {
    // delete a branch from the subbranch of the AST
    // eslint-disable-next-line no-lonely-if
    if (pos === 0) {
      ret = union([newElem], ret);
    } else if (pos === ret.length) {
      ret = union(ret, [newElem]);
    } else {
      ret = union(ret.slice(0, pos + 1), [newElem], ret.slice(pos + 1));
    }
  }

  return ret;
};


//

const updateSomething = function updateSomething(entity) {
  let ret = entity;

  // update a term
  // const sampleOf2 = sample([0, 1]);
  const sampleOf3 = sample([0, 1, 2]);
  const sampleOf4 = sample([0, 1, 2, 3]);
  const sampleOf6 = sample([0, 1, 2, 3, 4, 5]);

  // console.log('updateSomething: ', JSON.stringify(ret, null, 4));

  if (!ret) {
    return ret;
  } if (Array.isArray(ret)) {
    const pos = sample(range(ret.length));
    ret[pos] = updateSomething(ret[pos]);
  } else if (ret.type === 'BlockStatement') {
    // randomly pick to either modify the top-level node or a node inside of it
    if (sampleOf3 === 0) {
      ret = anyBlockStatement();
    } else if (sampleOf3 === 1) {
      if (ret.body.length > 0) {
        // randomly pick one element of the body array
        const posLvl2 = sample(range(ret.body.length));
        // recursion
        ret.body[posLvl2] = updateSomething(ret.body[posLvl2]);
      }
    } else if (sampleOf3 === 2) {
      ret = sample(ret.body);
    }
  } else if (ret.type === 'ReturnStatement') {
    // randonly pick to either modify the top-level node or a node inside of it
    if (sampleOf3 === 0) {
      ret = anyReturnStatement();
    } else if (sampleOf3 === 1) {
      ret.argument = anyExpression();
    } else if (sampleOf3 === 2) {
      ret = ret.argument;
    }
  } else if (ret.type === 'ExpressionStatement') {
    if (sampleOf3 === 0) {
      ret = anyExpressionStatement();
    } else if (sampleOf3 === 1) {
      ret.expression = anyExpression();
    } else if (sampleOf3 === 2) {
      ret = ret.expression;
    }
  } else if (ret.type === 'ConditionalExpression') {
    if (sampleOf6 === 0) {
      ret = anyConditional();
    } else if (sampleOf6 === 1) {
      ret.test = sample(CONDITIONAL_TESTS);
    } else if (sampleOf6 === 2) {
      ret.consequent = anyBlockStatement();
    } else if (sampleOf6 === 3) {
      ret.alternate = anyBlockStatement();
    } else if (sampleOf6 === 4) {
      ret = ret.consequent;
    } else if (sampleOf6 === 5) {
      ret = ret.alternate;
    }
  } else if (ret.type === 'IfStatement') {
    if (sampleOf6 === 0) {
      ret = anyIfStatement();
    } else if (sampleOf6 === 1) {
      ret.test = anyExpression();
    } else if (sampleOf6 === 2) {
      ret.consequent = anyBlockStatement();
    } else if (sampleOf6 === 3) {
      ret.alternate = anyBlockStatement();
    } else if (sampleOf6 === 4) {
      ret = ret.consequent;
    } else if (sampleOf6 === 5) {
      ret = ret.alternate;
    }
  } else if (ret.type === 'BinaryExpression') {
    if (sampleOf6 === 0) {
      ret = anyBinaryOperation();
    } else if (sampleOf6 === 1) {
      ret.operator = sample(BINARY_OPERATORS);
    } else if (sampleOf6 === 2) {
      ret.left = anyExpression();
    } else if (sampleOf6 === 3) {
      ret.right = anyExpression();
    } else if (sampleOf6 === 4) {
      ret = ret.left;
    } else if (sampleOf6 === 5) {
      ret = ret.right;
    }
  } else if (ret.type === 'LogicalExpression') {
    if (sampleOf6 === 0) {
      ret = anyLogicalExpression();
    } else if (sampleOf6 === 1) {
      ret.operator = sample(LOGICAL_OPERATORS);
    } else if (sampleOf6 === 2) {
      ret.left = anyExpression();
    } else if (sampleOf6 === 3) {
      ret.right = anyExpression();
    } else if (sampleOf6 === 4) {
      ret = ret.left;
    } else if (sampleOf6 === 5) {
      ret = ret.right;
    }
  } else if (ret.type === 'UnaryExpression') {
    if (sampleOf4 === 0) {
      ret = anyExpression();
    } else if (sampleOf4 === 1) {
      ret.operator = sample(UNARY_OPERATORS);
    } else if (sampleOf4 === 2) {
      ret.operand = sample(UNARY_OPERANDS)();
    } else if (sampleOf4 === 3) {
      ret = ret.operand;
    }
  } else if (ret.type === 'Literal' || ret.type === 'Identifier') {
    ret = anyExpression();
  }

  return ret;
};

module.exports = {
  anyBoolean,
  anyNumber,
  anyString,

  anyBinaryOperation,
  anyUnaryOperation,

  anyConditional,

  anyParameterExpression,
  anyExpression,

  anyExpressionStatement,
  anyReturnStatement,
  anyBlockStatement,
  anyIfStatement,

  BINARY_OPERATORS,
  UNARY_OPERATORS,
  BINARY_ASSIGNMENT_OPERATORS,

  CONDITIONAL_TESTS,
  CONDITIONAL_CONSEQUENTS,
  CONDITIONAL_ALTERNATES,

  shuffleSomething,
  deleteSomething,
  insertSomething,
  updateSomething,
};
