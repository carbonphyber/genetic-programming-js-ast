'use strict';

//
const map = require('lodash/map'),
    range = require('lodash/range'),
    sample = require('lodash/sample'),

    BINARY_OPERATORS = ['===', '===', '===', '===', '===', '===', '===', '!==', '!==', '!==', '!==', '==', '==', '==', '==', '==', '!=', '!=', '!=', '!=', '<', '<', '<', '<', '<=', '<=', '<=', '<=', '>=', '>=', '>=', '>=', '>', '>', '>', '>', '&&', '&&', '&&', '&&', '&&', '&&', '&&', '||', '||', '||', '||', '||', '||', '||', '&', '|', '|', '|', '^', '^', '^', '<<', '>>', '>>>', '%', '%', '%', '%', '%', '+', '+', '+', '-', '-', '-', '/', '*', '**', 'in', 'instanceof'],
    UNARY_OPERATORS = ['!', '!', '!', '!', '!', '+', '+', '+', '+', '-', '-', '-', '-', '~', '++', '--', 'typeof', 'typeof', 'typeof', 'void', 'delete'],
    BINARY_ASSIGNMENT_OPERATORS = ['=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '=', '+=', '+=', '+=', '+=', '+=', '-=', '-=', '-=', '-=', '-=', '-=', '**=', '*=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '^=', '|='],

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
        return toIdentifier('undefined');
    },

    NUMERIC_COEFFICIENT = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    NUMERIC_POSITIVE = [false, false, true, true, true],

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

    anyString = function () {
        let v = sample(['foo', 'bar', 'foobar']);
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

    UNARY_OPERANDS = [anyBoolean, anyBoolean, anyBoolean, anyNumber, anyNumber, anyNumber, anyString],

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

    CONDITIONAL_TESTS = [anyBoolean, anyBoolean, anyBoolean, anyNumber, anyNumber, anyString, anyString, anyBinaryOperation, anyBinaryOperation, anyBinaryOperation, anyBinaryOperation, anyUnaryOperation],
    CONDITIONAL_CONSEQUENTS = [anyBoolean, anyNumber, anyString, anyBinaryOperation, anyUnaryOperation],
    CONDITIONAL_ALTERNATES = [anyBoolean, anyNumber, anyString, anyBinaryOperation, anyUnaryOperation],

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

    ARGUMENTS_INDEXES = [0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2],

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

    EXPRESSIONS = [anyParameterExpression, anyParameterExpression, anyParameterExpression, anyBoolean, anyBoolean, anyNumber, anyString, anyBinaryOperation, anyBinaryOperation, anyBinaryOperation, anyUnaryOperation, anyConditional],

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

    BLOCK_STATEMENT_QUANTITIES = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3],

    anyBlockStatement = function () {
        let num_of_statements = sample(BLOCK_STATEMENT_QUANTITIES),
            pick_a_statement = () => (sample([anyReturnStatement, anyBlockStatement, anyExpressionStatement, anyExpressionStatement, anyExpressionStatement, anyExpressionStatement])());
        return {
                "type": "BlockStatement",
                "body": map(range(0, num_of_statements), pick_a_statement)
            };
    },

    anyIfStatement = function () {
        const IF_STATEMENT_CONSEQUENTS = [anyBlockStatement, anyIfStatement, anyExpressionStatement, anyExpressionStatement, anyExpressionStatement, anyExpressionStatement],
            IF_STATEMENT_ALTERNATES = [anyBlockStatement, anyIfStatement, anyExpressionStatement, anyExpressionStatement, anyExpressionStatement, anyExpressionStatement];
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
};
