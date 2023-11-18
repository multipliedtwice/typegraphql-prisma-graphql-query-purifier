"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeQueries = void 0;
const graphql_1 = require("graphql");
function mergeQueries(requestQuery, allowedQueries) {
    if (!requestQuery.trim()) {
        return ''; // Return an empty string for empty requestQuery
    }
    const parsedRequestQuery = (0, graphql_1.parse)(requestQuery);
    const allowedQueryASTs = allowedQueries.map((query) => (0, graphql_1.parse)(query));
    const allowedFields = new Set();
    // Extract allowed fields from allowedQueryASTs
    allowedQueryASTs.forEach((ast) => {
        (0, graphql_1.visit)(ast, {
            Field(node) {
                allowedFields.add(node.name.value);
            },
        });
    });
    // Modify the AST of the request query based on allowed fields
    const modifiedAST = (0, graphql_1.visit)(parsedRequestQuery, {
        Field(node) {
            if (!allowedFields.has(node.name.value)) {
                return null; // This removes the field from the AST
            }
            return undefined; // Continue visiting child nodes
        },
    });
    return (0, graphql_1.print)(modifiedAST);
}
exports.mergeQueries = mergeQueries;
