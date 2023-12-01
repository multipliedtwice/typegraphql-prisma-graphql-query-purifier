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
const get_allowed_query_1 = require("./get-allowed-query");
class GraphQLQueryPurifier {
    /**
     * Constructs a GraphQLQueryPurifier instance.
     * @param {Object} params - Configuration parameters.
     * @param {string} params.gqlPath - Path to the directory containing .gql files.
     * @param {boolean} [params.allowAll=false] - Whether to allow all queries.
     * @param {boolean} [params.allowStudio=false] - Whether to allow Apollo Studio introspection queries.
     * @param {boolean} [params.debug=false] - Flag to enable logging of input/output.
     */
    constructor({ gqlPath, allowAll = false, allowStudio = false, debug = false, }) {
        /**
         * Middleware function to filter incoming GraphQL queries based on the allowed list.
         * If a query is not allowed, it's replaced with a minimal query.
         * @param {Request} req - The request object.
         * @param {Response} res - The response object.
         * @param {NextFunction} next - The next middleware function in the stack.
         */
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
            if (req.body && req.body.query) {
                const allowedQuery = (0, get_allowed_query_1.getAllowedQueryForRequest)(req.body.query, this.queryMap);
                if (allowedQuery) {
                    // Use mergeQueries with the specific allowed query
                    const filteredQuery = (0, merge_1.mergeQueries)(req.body.query, allowedQuery, this.debug);
                    // Existing code...
                }
                else {
                    console.warn(`Query was blocked: ${req.body.query}`);
                    req.body.query = '{ __typename }'; // Replace with a minimal query
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
        this.debug = debug;
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
        this.queryMap = {};
        files.forEach((file) => {
            const content = fs_1.default.readFileSync(file, 'utf8').trim();
            if (!content) {
                console.warn(`Warning: Empty or invalid GraphQL file found: ${file}`);
                return;
            }
            const parsedQuery = (0, graphql_1.parse)(content);
            const operationDefinition = parsedQuery.definitions.find((def) => def.kind === 'OperationDefinition');
            if (operationDefinition) {
                const operationName = operationDefinition.name?.value || '';
                const firstField = operationDefinition.selectionSet.selections.find((sel) => sel.kind === 'Field');
                const firstFieldName = firstField ? firstField.name.value : '';
                const key = `${operationName}.${firstFieldName}`.trim();
                this.queryMap[key] = content;
            }
        });
    }
}
exports.GraphQLQueryPurifier = GraphQLQueryPurifier;
