/* eslint-disable one-var */
'use strict';

const map = {
    'instanceof': 'InstanceOf',
    'typeof': 'TypeOf'
};

const captureBinaryOrUnary = function (node, parent, results) {
    const operator = node.operator;

    if (['instanceof', 'typeof'].indexOf(operator) > -1) {
        results.push({
            node: operator === 'typeof' ? parent : node,
            type: `DontUse${map[operator]}`
        });
    } else if (node.left.operator === 'typeof') {
        results.push({
            node,
            type: 'DontUseTypeOf'
        });
    }
};

const captureFunction = function (node, parent, results) {
    const bodies = node.body.body;

    // TODO: Make .length configurable.
    if (bodies && bodies.length > 10) {
        results.push({
            node,
            type: 'TooManyFunctionBodyStatements'
        });
    }

    stackManager.incr(0);

    bodies.forEach(body => this.visit(body, node, results));

    const n = stackManager.incr(null);

    if (n > 1) {
        results.push({
            node,
            type: 'TooManyReturns'
        });
    }
};

const captureLoop = (node, parent, results) =>
    results.push({
        node: parent || node,
        type: node.type
    });

const stackManager = (() => {
    const stack = [];

    return {
        incr: i => {
            // Increment.
            if (i === undefined) {
                let ctx = stack.pop();

                ctx++;
                stack.push(ctx);
            } else if (i === null) {
                // Remove.
                return stack.pop();
            } else {
                 // Create.
                stack.push(i);
            }
        }
    };
})();

module.exports = {
    // TODO: DRY
    ArrowFunctionExpression(node, parent, results) {
        captureFunction.call(this, node, parent, results);
    },
    FunctionDeclaration(node, parent, results) {
        captureFunction.call(this, node, parent, results);
    },
    FunctionExpression(node, parent, results) {
        captureFunction.call(this, node, parent, results);
    },

    BinaryExpression: captureBinaryOrUnary,
    UnaryExpression: captureBinaryOrUnary,

    ConditionalExpression(node, parent, results) {
        if (node.consequent.type === 'ConditionalExpression' ||
            node.alternate.type === 'ConditionalExpression') {
            results.push({
                node,
                type: 'NestedTernaryOperators'
            });
        }
    },

    ForStatement: captureLoop,
    ForInStatement: captureLoop,
    ForOfStatement: captureLoop,
    DoWhileStatement: captureLoop,
    WhileStatement: captureLoop,

    Identifier(node, parent, results) {
        if (node.name === 'arguments') {
            results.push({
                node: parent,
                type: 'DontUseArguments'
            });
        }
    },

    NewExpression(node, parent, results) {
        results.push({
            node: parent,
            type: 'DontUseNew'
        });
    },

    ReturnStatement(node, parent, results) {
        const returnArgs = node.argument.arguments;

        if (returnArgs) {
            returnArgs.forEach(node => this.visit(node, parent, results));
        }

        this.visit(node.argument, node, results);
        stackManager.incr();
    }
};

