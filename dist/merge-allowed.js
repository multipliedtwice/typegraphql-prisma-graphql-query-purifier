"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAllowedGraphQLQueries = void 0;
const graphql_1 = require("graphql");
function mergeAllowedGraphQLQueries(queries) {
    const resolverMap = new Map();
    queries.forEach((query) => {
        try {
            const parsedQuery = (0, graphql_1.parse)(query);
            parsedQuery.definitions.forEach((definition) => {
                if (definition.kind === 'OperationDefinition') {
                    const operationDefinition = definition;
                    let queryName = operationDefinition.name?.value;
                    if (!queryName) {
                        const firstField = operationDefinition.selectionSet.selections[0];
                        if (firstField && firstField.kind === 'Field') {
                            queryName = firstField.name.value;
                        }
                    }
                    if (queryName) {
                        const existingFields = resolverMap.get(queryName) || new Set();
                        operationDefinition.selectionSet.selections.forEach((selection) => {
                            if (selection.kind === 'Field') {
                                existingFields.add(selection.name.value);
                            }
                        });
                        resolverMap.set(queryName, existingFields);
                    }
                }
            });
        }
        catch (error) {
            console.error(`Error processing query: ${error}`);
        }
    });
    const mergedQueries = new Map();
    resolverMap.forEach((fields, resolver) => {
        const mergedQuery = `query ${resolver} { ${Array.from(fields).join(' ')} }`;
        mergedQueries.set(resolver, mergedQuery);
    });
    return mergedQueries;
}
exports.mergeAllowedGraphQLQueries = mergeAllowedGraphQLQueries;
