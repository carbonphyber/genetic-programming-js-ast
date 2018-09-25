'use strict';

//
const flatten = require('lodash/flatten'),
  map = require('lodash/map'),
  range = require('lodash/range'),
  sample = require('lodash/sample'),
  shuffle = require('lodash/shuffle'),
  union = require('lodash/union'),

  createWeightedArray = (len, fill) => {
    return new Array(len).fill(fill);
  },

  LOGICAL_OPERATORS = flatten([
    createWeightedArray(1, '&&'),
    createWeightedArray(1, '||'),
  ]),
  BINARY_OPERATORS = flatten([
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
  ]),
  UNARY_OPERATORS = flatten([
    createWeightedArray(5, '!'),
    createWeightedArray(4, '+'),
    createWeightedArray(4, '-'),
    createWeightedArray(1, '~'),
    createWeightedArray(1, '++'),
    createWeightedArray(1, '--'),
    createWeightedArray(3, 'typeof'),
    createWeightedArray(1, 'void'),
    createWeightedArray(1, 'delete'),
  ]),
  BINARY_ASSIGNMENT_OPERATORS = flatten([
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
  ]),

  toIdentifier = function (l) {
    return {
        "type": "Identifier",
        "name": l,
      };
  },

  toLiteral = function (l) {
    return {
        "type": "Literal",
        "value": l,
        "raw": JSON.stringify(l),
      };
  },

  anyBoolean = function () {
    let v = sample([false, true]);
    return toLiteral(v);
  },

  anyNull = function () {
    return toLiteral(null);
  },

  anyUndefined = function () {
    return toIdentifier(undefined);
  },

  anyNaN = function () {
    return toLiteral(NaN);
  },

  anyInfinity = function () {
    return toLiteral(Infinity);
  },

  NUMERIC_COEFFICIENT = range(16),
  NUMERIC_POSITIVE = flatten([
    createWeightedArray(2, false),
    createWeightedArray(3, true),
  ]),

  anyNumber = function () {
    let v = sample(NUMERIC_COEFFICIENT),
      isPositive = sample(NUMERIC_POSITIVE),
      ret = toLiteral(v);
    return isPositive ?
      ret :
      {
        "type": "UnaryExpression",
        "operator": "-",
        "argument": ret,
        "prefix": true
      };
  },

  STRINGS = flatten([
    createWeightedArray(1, 'foo'),
    createWeightedArray(1, 'bar'),
    createWeightedArray(1, 'foobar'),
    createWeightedArray(1, 'undefined'),
    createWeightedArray(1, 'boolean'),
    createWeightedArray(1, 'number'),
    createWeightedArray(1, 'string'),
    createWeightedArray(1, 'object'),
  ]),

  anyString = function () {
    let v = sample(STRINGS);
    return toLiteral(v);
  },

  anyBinaryOperation = function () {
    let v = sample(BINARY_OPERATORS);
    return {
        "type": "BinaryExpression",
        "operator": v,
        "left": anyExpression(),
        "right": anyExpression()
      };
  },

  anyLogicalExpression = function () {
    let v = sample(LOGICAL_OPERATORS);
    return {
        "type": "LogicalExpression",
        "operator": v,
        "left": anyExpression(),
        "right": anyExpression()
      };
  },

  UNARY_OPERANDS = flatten([
    createWeightedArray(3, anyBoolean),
    createWeightedArray(3, anyNumber),
    createWeightedArray(1, anyString),
  ]),

  anyUnaryOperation = function () {
    let v = sample(UNARY_OPERATORS),
      operand = sample(UNARY_OPERANDS)();
    return {
        type: 'UnaryExpression',
        operator: v,
        argument: operand,
        prefix: true
      };
  },

  CONDITIONAL_TESTS = flatten([
    createWeightedArray(3, anyBoolean),
    createWeightedArray(2, anyNumber),
    createWeightedArray(2, anyString),
    createWeightedArray(4, anyBinaryOperation),
    createWeightedArray(1, anyLogicalExpression),
    createWeightedArray(1, anyUnaryOperation),
  ]),
  CONDITIONAL_CONSEQUENTS = flatten([
    createWeightedArray(1, anyBoolean),
    createWeightedArray(1, anyNumber),
    createWeightedArray(1, anyString),
    createWeightedArray(1, anyBinaryOperation),
    createWeightedArray(1, anyLogicalExpression),
    createWeightedArray(1, anyUnaryOperation),
  ]),
  CONDITIONAL_ALTERNATES = flatten([
    createWeightedArray(1, anyBoolean),
    createWeightedArray(1, anyNumber),
    createWeightedArray(1, anyString),
    createWeightedArray(1, anyBinaryOperation),
    createWeightedArray(1, anyLogicalExpression),
    createWeightedArray(1, anyUnaryOperation),
  ]),

  anyConditional = function () {
    let exA = sample(CONDITIONAL_TESTS),
      exB = sample(CONDITIONAL_CONSEQUENTS),
      exC = sample(CONDITIONAL_ALTERNATES);
    return {
        "type": "ConditionalExpression",
        "test": exA(),
        "consequent": exB(),
        "alternate": exC(),
      };
  },

  ARGUMENTS_INDEXES = flatten([
    createWeightedArray(5, 0),
    createWeightedArray(4, 1),
    createWeightedArray(2, 2),
  ]),

  anyParameterExpression = function () {
    return {
        "type": "MemberExpression",
        "computed": true,
        "object": {
          "type": "Identifier",
          "name": "arguments"
        },
        "property": toLiteral(sample(ARGUMENTS_INDEXES)),
      };
  },

  EXPRESSIONS = flatten([
    createWeightedArray(3, anyParameterExpression),
    createWeightedArray(2, anyBoolean),
    createWeightedArray(1, anyNumber),
    createWeightedArray(1, anyString),
    createWeightedArray(1, anyNull),
    createWeightedArray(1, anyUndefined),
    createWeightedArray(1, anyNaN),
    createWeightedArray(1, anyInfinity),
    createWeightedArray(3, anyBinaryOperation),
    createWeightedArray(1, anyLogicalExpression),
    createWeightedArray(1, anyUnaryOperation),
    createWeightedArray(1, anyConditional),
  ]),

  anyExpression = function () {
    let ex = sample(EXPRESSIONS);
    return ex();
  },

  anyExpressionStatement = function () {
    return {
        "type": "ExpressionStatement",
        "expression": anyExpression(),
      };
  },

  anyReturnStatement = function () {
    return {
        "type": "ReturnStatement",
        "argument": anyExpression(),
      };
  },

  BLOCK_STATEMENT_QUANTITIES = flatten([
    createWeightedArray(15, 1),
    createWeightedArray(5, 2),
    createWeightedArray(2, 3),
  ]),

  anyBlockStatement = function () {
    const BLOCK_STATEMENTS = flatten([
      createWeightedArray(1, anyReturnStatement),
      createWeightedArray(1, anyBlockStatement),
      createWeightedArray(1, anyLogicalExpression),
      createWeightedArray(4, anyExpressionStatement),
    ]);
    let num_of_statements = sample(BLOCK_STATEMENT_QUANTITIES),
      pick_a_statement = () => (sample(BLOCK_STATEMENTS)());
    return {
        "type": "BlockStatement",
        "body": map(range(0, num_of_statements), pick_a_statement)
      };
  },

  anyIfStatement = function () {
    const IF_STATEMENT_CONSEQUENTS = flatten([
        createWeightedArray(1, anyBlockStatement),
        createWeightedArray(1, anyIfStatement),
        createWeightedArray(1, anyLogicalExpression),
        createWeightedArray(4, anyExpressionStatement),
      ]),
      IF_STATEMENT_ALTERNATES = flatten([
        createWeightedArray(1, anyBlockStatement),
        createWeightedArray(1, anyIfStatement),
        createWeightedArray(1, anyLogicalExpression),
        createWeightedArray(4, anyExpressionStatement),
      ]);
    let ret = {
        "type": "IfStatement",
        "test": anyExpression(),
        "consequent": sample(IF_STATEMENT_CONSEQUENTS)(),
      };
    // only define an `else` in some cases
    if (sample([false, true])) {
      ret.alternate = sample(IF_STATEMENT_ALTERNATES)();
    }
    return ret;
  },

  // 
  shuffleSomething = function (entity) {
    let pos = Math.floor(Math.random() * entity.length);

    if (sample([true, false])) {
      // shuffle a term
      entity = shuffle(entity);
    } else {
      if ('BlockStatement' === entity[pos].type) {
        entity[pos].body = shuffle(entity[pos].body);

      } else if ('IfStatement' === entity[pos].type) {
        let c = entity[pos].consequent;
        let a = entity[pos].alternate;
        entity[pos].consequent = a;
        entity[pos].alternate = c;

      } else if ('LogicalExpression' === entity[pos].type || 'BinaryExpression' === entity[pos].type) {
        let l = entity[pos].left;
        let r = entity[pos].right;
        entity[pos].right = l;
        entity[pos].left = r;

      } else {
        // shuffle a branch from the subbranch of the AST
        entity = shuffle(entity);
      }
    }
    return entity;
  },

  // 
  deleteSomething = function (entity) {
    let pos = Math.floor(Math.random() * entity.length);

    if (sample([true, false])) {
      // delete a term
      entity.splice(pos, 1);
    } else {
      if ('BlockStatement' === entity[pos].type) {
        entity[pos].body.splice(Math.floor(Math.random() * entity[pos].body.length), 1);

      } else if ('IfStatement' === entity[pos].type) {
        entity[pos].alternate = null;

      } else {
        // delete a branch from the subbranch of the AST
        entity.splice(pos, 1);
      }
    }
    return entity;
  },

  // 
  insertSomething = function (entity) {
      // update a term
      let pos = Math.floor(Math.random() * entity.length),
        newElem;

      newElem = anyBlockStatement();
      if (sample([true, false])) {
        // insert a term
        if (pos === 0) {
          entity = union([newElem], entity);
        } else if (pos === entity.length) {
          entity = union(entity, [newElem]);
        } else {
          entity = union(entity.slice(0, pos + 1), [newElem], entity.slice(pos + 1));
        }
      } else {
        if ('BlockStatement' === entity[pos].type) {
          entity = entity[pos].body;
          if (pos === 0) {
            entity = union([newElem], entity);
          } else if (pos === entity.length) {
            entity = union(entity, [newElem]);
          } else {
            entity = union(entity.slice(0, pos + 1), [newElem], entity.slice(pos + 1));
          }

        } else {
          // delete a branch from the subbranch of the AST
          if (pos === 0) {
            entity = union([newElem], entity);
          } else if (pos === entity.length) {
            entity = union(entity, [newElem]);
          } else {
            entity = union(entity.slice(0, pos + 1), [newElem], entity.slice(pos + 1));
          }
        }
      }

      return entity;
  },

  // 
  updateSomething = function (entity) {
      // update a term
      const sampleOf2 = sample([0, 1]),
        sampleOf3 = sample([0, 1, 2]),
        sampleOf4 = sample([0, 1, 2, 3]);

      // console.log('updateSomething: ', JSON.stringify(entity, null, 4));

      if (Array.isArray(entity)) {
        const pos = sample(range(entity.length));
        entity[pos] = updateSomething(entity[pos]);
      } else if ('BlockStatement' === entity.type) {
        // randomly pick to either modify the top-level node or a node inside of it
        if (0 === sampleOf2) {
          entity = anyBlockStatement();
        } else if (1 === sampleOf2) {
          if (entity.body.length > 0) {
            // randomly pick one element of the body array
            const posLvl2 = sample(range(entity.body.length));
            // recursion
            entity.body[posLvl2] = updateSomething(entity.body[posLvl2]);
          }
        }
      } else if ('ReturnStatement' === entity.type) {
        // randonly pick to either modify the top-level node or a node inside of it
        if (0 === sampleOf3) {
          entity = anyReturnStatement();
        } else if (1 === sampleOf3) {
          entity.argument = anyExpression();
        }
      } else if ('ExpressionStatement' === entity.type) {
        if (0 === sampleOf2) {
          entity = anyExpressionStatement();
        } else if (1 === sampleOf2) {
          entity.expression = anyExpression();
        }
      } else if ('ConditionalExpression' === entity.type) {
        if (0 === sampleOf4) {
          entity = anyConditional();
        } else if (1 === sampleOf4) {
          entity.test = sample(CONDITIONAL_TESTS);
        } else if (2 === sampleOf4) {
          entity.consequent = anyBlockStatement();
        } else if (3 === sampleOf4) {
          entity.alternate = anyBlockStatement();
        }
      } else if ('IfStatement' === entity.type) {
        if (0 === sampleOf4) {
          entity = anyIfStatement();
        } else if (1 === sampleOf4) {
          entity.test = anyExpression();
        } else if (2 === sampleOf4) {
          entity.consequent = anyBlockStatement();
        } else if (3 === sampleOf4) {
          entity.alternate = anyBlockStatement();
        }
      } else if ('BinaryExpression' === entity.type) {
        if (1 === sampleOf4) {
          entity = anyBinaryOperation();
        } else if (1 === sampleOf4) {
          entity.operator = sample(BINARY_OPERATORS);
        } else if (2 === sampleOf4) {
          entity.left = anyExpression();
        } else if (3 === sampleOf4) {
          entity.right = anyExpression();
        }
      } else if ('LogicalExpression' === entity.type) {
        if (0 === sampleOf4) {
          entity = anyLogicalExpression();
        } else if (1 === sampleOf4) {
          entity.operator = sample(LOGICAL_OPERATORS);
        } else if (2 === sampleOf4) {
          entity.left = anyExpression();
        } else if (3 === sampleOf4) {
          entity.right = anyExpression();
        }
      } else if ('UnaryExpression' === entity.type) {
        if (0 === sampleOf3) {
          entity = anyExpression();
        } else if (1 === sampleOf3) {
          entity.operator = sample(UNARY_OPERATORS);
        } else if (2 === sampleOf3) {
          entity.operand = sample(UNARY_OPERANDS)();
        }
      } else if ('Literal' === entity.type || 'Identifier' === entity.type) {
        entity = anyExpression();
      }

      return entity;
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
  anyIfStatement,
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
