"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeQueries = void 0;
const graphql_1 = require("graphql");
function getPath(node, ancestors) {
    // Build the path from the ancestors and the current node
    const path = ancestors
        .map((ancestor) => (ancestor.kind === 'Field' ? ancestor.name.value : null))
        .filter(Boolean);
    path.push(node.name.value);
    return path.join('.');
}
function mergeQueries(requestQuery, allowedQueries) {
    if (!requestQuery.trim()) {
        return '';
    }
    const parsedRequestQuery = (0, graphql_1.parse)(requestQuery);
    const allowedQueryASTs = allowedQueries.map((query) => (0, graphql_1.parse)(query));
    const allowedPaths = new Set();
    // Extract allowed paths from allowedQueryASTs
    allowedQueryASTs.forEach((ast) => {
        (0, graphql_1.visit)(ast, {
            Field(node, key, parent, path, ancestors) {
                allowedPaths.add(getPath(node, ancestors));
            },
        });
    });
    // Modify the AST of the request query based on allowed paths
    const modifiedAST = (0, graphql_1.visit)(parsedRequestQuery, {
        Field(node, key, parent, path, ancestors) {
            const currentPath = getPath(node, ancestors);
            if (!allowedPaths.has(currentPath)) {
                return null; // Remove the field from the AST
            }
            return undefined; // Continue visiting child nodes
        },
    });
    // Check if the modified query has any fields left in its selection set
    const hasFields = modifiedAST.definitions.some((def) => def.kind === 'OperationDefinition' &&
        def.selectionSet.selections.length > 0);
    if (!hasFields) {
        // Return a placeholder or minimal query
        return '';
    }
    return (0, graphql_1.print)(modifiedAST);
}
exports.mergeQueries = mergeQueries;
