import { NextFunction, Request, Response } from 'express';
export declare class GraphQLQueryPurifier {
    /**
     * The path to the directory containing GraphQL (.gql) files.
     * @private
     */
    private gqlPath;
    /**
     * A map of allowed query names to their corresponding GraphQL query strings.
     * @private
     */
    private queryMap;
    /**
     * Flag to allow Apollo Studio's introspection queries.
     * @private
     */
    private allowStudio?;
    /**
     * Flag to indicate whether to allow all queries (bypassing purifier).
     * @private
     */
    private allowAll;
    /**
     * Flag to enable logging of input/output.
     * @private
     */
    private debug;
    /**
     * Constructs a GraphQLQueryPurifier instance.
     * @param {Object} params - Configuration parameters.
     * @param {string} params.gqlPath - Path to the directory containing .gql files.
     * @param {boolean} [params.allowAll=false] - Whether to allow all queries.
     * @param {boolean} [params.allowStudio=false] - Whether to allow Apollo Studio introspection queries.
     * @param {boolean} [params.debug=false] - Flag to enable logging of input/output.
     */
    constructor({ gqlPath, allowAll, allowStudio, debug, }: {
        gqlPath: string;
        allowStudio?: boolean;
        allowAll?: boolean;
        debug?: boolean;
    });
    startWatchingFiles(): void;
    /**
     * Loads queries from .gql files in the specified directory and updates the query map.
     * @private
     */
    private loadQueries;
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
    filter: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
}
