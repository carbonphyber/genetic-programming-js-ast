'use strict';

//
const _ = require('lodash'),

    BINARY_OPERATORS = ['&&', '||', '&', '|', '^', '<<', '>>', '>>>', '+', '-', '/', '*', '%', '**', '===', '!==', '==', '!=', '<', '<=', '>=', '>', 'in', 'instanceof'],
    UNARY_OPERATORS = ['++', '--', '!', '+', '-', '~', 'typeof', 'void', 'delete'],
    BINARY_ASSIGNMENT_OPERATORS = ['=', '+=', '-=', '**=', '*=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '^=', '|='],

    toLiteral = function (l) {
        return {
                "type": "Literal",
                "value": l,
                "raw": JSON.stringify(l),
            };
    },

    anyBoolean = function () {
        let v = _.sample([false, true]);
        return toLiteral(v);
    },

    anyNumber = function () {
        let v = _.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
            isPositive = _.sample([false, true]),
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

    anyString = function () {
        let v = _.sample(['foo', 'bar', 'foobar']);
        return toLiteral(v);
    },

    anyBinaryOperation = function () {
        let v = _.sample(BINARY_OPERATORS);
        return {
                "type": "BinaryExpression",
                "operator": v,
                "left": anyNumber(),
                "right": anyNumber()
            };
    },

    anyUnaryOperation = function () {
        let v = _.sample(UNARY_OPERATORS),
            operand = _.sample([anyBoolean, anyNumber, anyString])();
        return {
                "type": "ExpressionStatement",
                "expression": {
                    type: 'UnaryExpression',
                    operator: v,
                    argument: operand,
                    prefix: true
                }
            };
    },

    anyConditional = function () {
        let expressionFunctions = [anyBoolean, anyNumber, anyString, anyBinaryOperation, anyUnaryOperation],
            exA = _.sample(expressionFunctions),
            exB = _.sample(expressionFunctions),
            exC = _.sample(expressionFunctions);
        return {
                "type": "ConditionalExpression",
                "test": exA(),
                "consequent": exB(),
                "alternate": exC(),
            };
    },

    anyExpression = function () {
        let expressionFunctions = [anyBoolean, anyNumber, anyString, anyBinaryOperation, anyUnaryOperation, anyConditional];
        return _.sample(expressionFunctions)();
    };

module.exports = {
    anyBoolean,
    anyNumber,
    anyString,
    anyBinaryOperation,
    anyUnaryOperation,
    anyExpression,
};
