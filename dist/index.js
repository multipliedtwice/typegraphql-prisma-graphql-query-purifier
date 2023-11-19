"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLQueryPurifier = void 0;
const fs_1 = __importDefault(require("fs"));
const graphql_1 = require("graphql");
const path_1 = __importDefault(require("path"));
// @ts-ignore
const glob_1 = __importDefault(require("glob"));
const merge_1 = require("./merge");
class GraphQLQueryPurifier {
    constructor({ gqlPath, allowAll = false, allowStudio = false, }) {
        this.filter = (req, res, next) => {
            if (this.allowAll)
                return next();
            if (req.body.operationName === 'IntrospectionQuery' ||
                req.body.extensions?.persistedQuery) {
                if (this.allowStudio) {
                    return next();
                }
                else {
                    return res
                        .status(403)
                        .send('Access to studio is disabled by GraphQLQueryPurifier, pass { allowStudio: true }');
                }
            }
            // Get all allowed queries as an array of strings
            const allowedQueries = Object.values(this.queryMap);
            if (allowedQueries.length === 0) {
                console.warn('Warning: No GraphQL queries were loaded in GraphQLQueryPurifier. ' +
                    'Ensure that your .gql files are located in the specified directory: ' +
                    this.gqlPath);
                return res
                    .status(500)
                    .send('GraphQL queries are not loaded. Please check server logs for more details.');
            }
            if (req.body && req.body.query) {
                // Use mergeQueries to filter the incoming request query
                req.body.query = (0, merge_1.mergeQueries)(req.body.query, allowedQueries);
            }
            next();
        };
        this.gqlPath = gqlPath;
        this.queryMap = {};
        this.loadQueries();
        this.allowAll = allowAll;
        this.allowStudio = allowStudio;
    }
    loadQueries() {
        const files = glob_1.default.sync(`${this.gqlPath}/**/*.gql`.replace(/\\/g, '/'));
        files.forEach((file) => {
            if (path_1.default.extname(file) === '.gql') {
                const content = fs_1.default.readFileSync(file, 'utf8');
                const parsedQuery = (0, graphql_1.parse)(content);
                parsedQuery.definitions.forEach((definition) => {
                    if (definition.kind === 'OperationDefinition') {
                        const operationDefinition = definition;
                        let queryName = operationDefinition.name?.value;
                        if (!queryName) {
                            // Extract the name from the first field of the selection set
                            const firstField = operationDefinition.selectionSet.selections[0];
                            if (firstField && firstField.kind === 'Field') {
                                queryName = firstField.name.value;
                            }
                        }
                        if (queryName) {
                            this.queryMap[queryName] = content;
                        }
                    }
                });
            }
        });
    }
}
exports.GraphQLQueryPurifier = GraphQLQueryPurifier;
