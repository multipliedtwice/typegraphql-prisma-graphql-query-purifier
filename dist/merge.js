"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeQueries = void 0;
const graphql_1 = require("graphql");
function getFirstFieldName(operation) {
    const firstField = operation.selectionSet.selections.find((sel) => sel.kind === 'Field');
    return firstField ? firstField.name.value : undefined;
}
function getPath(node, ancestors) {
    const path = ancestors
        .map((ancestor) => (ancestor.kind === 'Field' ? ancestor.name.value : null))
        .filter(Boolean);
    path.push(node.name.value);
    return path.join('.');
}
function mergeQueries(requestQuery, allowedQuery, debug = false) {
    if (!requestQuery.trim()) {
        return '';
    }
    const parsedRequestQuery = (0, graphql_1.parse)(requestQuery);
    if (!allowedQuery) {
        return ''; // Query is not allowed
    }
    const allowedAST = (0, graphql_1.parse)(allowedQuery);
    const allowedPaths = new Set();
    // Extract allowed paths from the specific allowed AST
    (0, graphql_1.visit)(allowedAST, {
        Field(node, key, parent, path, ancestors) {
            allowedPaths.add(getPath(node, ancestors));
        },
    });
    // Modify the AST of the request query based on allowed paths
    const modifiedAST = (0, graphql_1.visit)(parsedRequestQuery, {
        Field(node, key, parent, path, ancestors) {
            const currentPath = getPath(node, ancestors);
            if (!allowedPaths.has(currentPath)) {
                return null; // Remove the field from the AST
            }
        },
    });
    // Check if the modified query has any fields left in its selection set
    const hasValidFields = modifiedAST.definitions.some((def) => def.kind === 'OperationDefinition' &&
        def.selectionSet.selections.length > 0);
    if (!hasValidFields) {
        return ''; // Return an empty string if no valid fields are left
    }
    const modifiedQuery = (0, graphql_1.print)(modifiedAST);
    if (debug) {
        console.log('Modified Query:', modifiedQuery);
    }
    return modifiedQuery;
}
exports.mergeQueries = mergeQueries;
