'use strict';

const esprima = require('esprima'),
    visitor = require('./visitor'),
    fs = require('fs');

function getSuite(file, isData) {
    return new Promise((resolve, reject) => {
        if (isData) {
            resolve(file);
        } else {
            fs.readFile(file, 'utf8', (err, fileContents) => {
                if (err) {
                    reject('There was a problem processing the file.');
                } else {
                    resolve(fileContents);
                }
            });
        }
    });
}

function makeTree(file, generator, isData) {
    if (!file) {
        throw new Error('Stank: No file given');
    }

    if (!generator) {
        throw new Error('Stank: No generator given');
    }

    return getSuite(file, isData)
    .then(suite => {
        const nodes = visitTree(suite);

        return !nodes.length ?
            'No results found' :
            generator.print(nodes);
    });
}

function visitTree(suite) {
    return visitor.visit(esprima.parse(suite, {
        loc: true
    }), null, []);
}

module.exports = makeTree;

