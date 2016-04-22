/* eslint-disable no-case-declarations,one-var */
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

    stackManager.push([0]);

    bodies.forEach(n => this.visit(n, node, results));

    const a = stackManager.pop();

    if (a[0] > 1) {
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
        incr: () => {
            const ctx = stack.pop();

            ctx[0]++;
            stack.push(ctx);
        },
        pop: () => stack.pop(),
        push: v => stack.push(v)
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

