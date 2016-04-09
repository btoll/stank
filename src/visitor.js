/* eslint-disable no-case-declarations,one-var */
'use strict';

// NOTE:
// We wrap the node in a context object so we can specify our own custom node types like
// 'TooManyReturns', etc.  It's better to do this than to modify objects we don't own,
// which is no bueno on its own merits, and also because it can lead to headaches since
// we're collecting references NOT copies.
//
//        results.push({
//            node,
//            type: 'TooManyReturns'
//        });
//

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
    visit: function (node, parent, results) {
        switch (node.type) {
            case 'ArrowFunctionExpression':
            case 'FunctionDeclaration':
            case 'FunctionExpression':
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
                break;

            case 'AssignmentExpression':
                this.visit(node.right, node, results);
                break;

            case 'BinaryExpression':
            case 'UnaryExpression':
                // TODO: Optimize.
                if (['instanceof', 'typeof'].indexOf(node.operator) > -1) {
                    results.push({
                        node: parent,
                        type: node.operator
                    });
                }
                break;

            case 'BlockStatement':
                node.body.forEach(node => this.visit(node, parent, results));
                break;

            case 'CallExpression':
                // TODO
                const callArgs = node.arguments;

                if (callArgs.length) {
                    callArgs.forEach(node => {
                        // TODO: Test this logic!
                        if (node.type !== 'Identifier') {
                            this.visit(node, node, results);
                        }
                    });
                } else if (node.callee.type === 'ArrowFunctionExpression') {
                    this.visit(node.callee, node, results);
                }
                break;

            case 'ConditionalExpression':
                if (node.consequent.type === 'ConditionalExpression' ||
                    node.alternate.type === 'ConditionalExpression') {
                    results.push({
                        node,
                        type: 'NestedTernaryOperators'
                    });
                }
                break;

            case 'ExpressionStatement':
                this.visit(node.expression, node, results);
                break;

            case 'ForStatement':
            case 'ForInStatement':
            case 'ForOfStatement':
            case 'Identifier':
            case 'NewExpression':
            case 'WhileStatement':
                results.push({
                    node: parent || node,
                    type: node.type
                });
                break;

            case 'IfStatement':
                this.visit(node.consequent, node, results);

                if (node.alternate) {
                    this.visit(node.alternate, node, results);
                }
                break;

            case 'ObjectExpression':
                node.properties.forEach(node => this.visit(node, parent, results));
                return results;

            case 'Program':
                node.body.forEach(node => this.visit(node, parent, results));
                return results;

            case 'Property':
                this.visit(node.value, parent, results);
                return results;

            case 'ReturnStatement':
                const returnArgs = node.argument.arguments;

                if (returnArgs) {
                    returnArgs.forEach(node => this.visit(node, parent, results));
                }

                stackManager.incr();
                break;

            case 'VariableDeclarator':
                const init = node.init;

                if (init) {
                    this.visit(init, node, results);
                }
                break;

            case 'VariableDeclaration':
                node.declarations.forEach(node => this.visit(node, parent, results));
                break;
        }
    }
};

