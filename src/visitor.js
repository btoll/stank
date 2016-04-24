/* eslint-disable one-var */
'use strict';

const captureBinary = (node, parent, results) => {
    // TODO: Optimize.
    if (['instanceof', 'typeof'].indexOf(node.operator) > -1) {
        results.push({
            node: parent,
            type: node.operator
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

    bodies.forEach(n => this.visit(n, node, results));

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
    ArrowFunctionExpression(node, parent, results) {
        captureFunction.call(this, node, parent, results);
    },
    FunctionDeclaration(node, parent, results) {
        captureFunction.call(this, node, parent, results);
    },
    FunctionExpression(node, parent, results) {
        captureFunction.call(this, node, parent, results);
    },

    BinaryExpression: captureBinary,
    UnaryExpression: captureBinary,

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
    Identifier: captureLoop,
    NewExpression: captureLoop,
    WhileStatement: captureLoop,

    ReturnStatement(node, parent, results) {
        const returnArgs = node.argument.arguments;

        if (returnArgs) {
            returnArgs.forEach(node => this.visit(node, parent, results));
        }

        stackManager.incr();
    }
};

