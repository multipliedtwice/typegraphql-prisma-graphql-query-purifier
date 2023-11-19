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
    /**
     * Constructs a GraphQLQueryPurifier instance.
     * @param {Object} params - Configuration parameters.
     * @param {string} params.gqlPath - Path to the directory containing .gql files.
     * @param {boolean} [params.allowAll=false] - Whether to allow all queries.
     * @param {boolean} [params.allowStudio=false] - Whether to allow Apollo Studio introspection queries.
     */
    constructor({ gqlPath, allowAll = false, allowStudio = false, }) {
        /**
         * Middleware function to filter incoming GraphQL queries based on the allowed list.
         * If a query is not allowed, it's replaced with a minimal query.
         * @param {Request} req - The request object.
         * @param {Response} res - The response object.
         * @param {NextFunction} next - The next middleware function in the stack.
         */
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
            if (!allowedQueries.length) {
                console.warn('Warning: No GraphQL queries were loaded in GraphQLQueryPurifier. ' +
                    'Ensure that your .gql files are located in the specified directory: ' +
                    this.gqlPath);
            }
            if (req.body && req.body.query) {
                // Use mergeQueries to filter the incoming request query
                const filteredQuery = (0, merge_1.mergeQueries)(req.body.query, allowedQueries);
                if (!filteredQuery.trim()) {
                    console.warn(`Query was blocked due to security rules: ${req.body.query}`);
                    req.body.query = '{ __typename }';
                    delete req.body.operationName; // Remove the operation name
                }
                else {
                    req.body.query = filteredQuery;
                }
            }
            next();
        };
        this.gqlPath = gqlPath;
        this.queryMap = {};
        this.loadQueries();
        this.startWatchingFiles();
        this.allowAll = allowAll;
        this.allowStudio = allowStudio;
    }
    startWatchingFiles() {
        fs_1.default.watch(this.gqlPath, { recursive: true }, (eventType, filename) => {
            if (filename && path_1.default.extname(filename) === '.gql') {
                console.log(`Detected ${eventType} in ${filename}`);
                this.loadQueries();
            }
        });
    }
    /**
     * Loads queries from .gql files in the specified directory and updates the query map.
     * @private
     */
    loadQueries() {
        const files = glob_1.default.sync(`${this.gqlPath}/**/*.gql`.replace(/\\/g, '/'));
        files.forEach((file) => {
            if (path_1.default.extname(file) === '.gql') {
                const content = fs_1.default.readFileSync(file, 'utf8').trim();
                if (!content) {
                    console.warn(`Warning: Empty or invalid GraphQL file found: ${file}`);
                    return;
                }
                try {
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
                catch (error) {
                    if (error instanceof graphql_1.GraphQLError) {
                        console.error(`Error parsing GraphQL file ${file}: ${error.message}`);
                    }
                    else {
                        console.error(`Unexpected error processing file ${file}: ${error}`);
                    }
                }
            }
        });
    }
}
exports.GraphQLQueryPurifier = GraphQLQueryPurifier;
