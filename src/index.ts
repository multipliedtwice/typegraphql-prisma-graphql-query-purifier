import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import {
  FieldNode,
  GraphQLError,
  OperationDefinitionNode,
  parse,
} from 'graphql';
import path from 'path';
// @ts-ignore
import glob from 'glob';
import { mergeQueries } from './merge';
import { getAllowedQueryForRequest } from './get-allowed-query';

export class GraphQLQueryPurifier {
  /**
   * The path to the directory containing GraphQL (.gql) files.
   * @private
   */

  private gqlPath: string;
  /**
   * A map of allowed query names to their corresponding GraphQL query strings.
   * @private
   */

  private queryMap: { [key: string]: string };
  /**
   * Flag to allow Apollo Studio's introspection queries.
   * @private
   */

  private allowStudio?: boolean;
  /**
   * Flag to indicate whether to allow all queries (bypassing purifier).
   * @private
   */

  private allowAll: boolean;

  /**
   * Flag to enable logging of input/output.
   * @private
   */

  private debug: boolean;

  /**
   * Constructs a GraphQLQueryPurifier instance.
   * @param {Object} params - Configuration parameters.
   * @param {string} params.gqlPath - Path to the directory containing .gql files.
   * @param {boolean} [params.allowAll=false] - Whether to allow all queries.
   * @param {boolean} [params.allowStudio=false] - Whether to allow Apollo Studio introspection queries.
   * @param {boolean} [params.debug=false] - Flag to enable logging of input/output.
   */
  constructor({
    gqlPath,
    allowAll = false,
    allowStudio = false,
    debug = false,
  }: {
    gqlPath: string;
    allowStudio?: boolean;
    allowAll?: boolean;
    debug?: boolean;
  }) {
    this.gqlPath = gqlPath;
    this.queryMap = {};
    this.loadQueries();
    this.startWatchingFiles();
    this.allowAll = allowAll;
    this.allowStudio = allowStudio;
    this.debug = debug;
  }

  public startWatchingFiles() {
    fs.watch(this.gqlPath, { recursive: true }, (eventType, filename) => {
      if (filename && path.extname(filename) === '.gql') {
        console.log(`Detected ${eventType} in ${filename}`);
        this.loadQueries();
      }
    });
  }

  /**
   * Loads queries from .gql files in the specified directory and updates the query map.
   * @private
   */
  private loadQueries() {
    const files = glob.sync(`${this.gqlPath}/**/*.gql`.replace(/\\/g, '/'));
    this.queryMap = {};

    files.forEach((file: string) => {
      const content = fs.readFileSync(file, 'utf8').trim();
      if (!content) {
        console.warn(`Warning: Empty or invalid GraphQL file found: ${file}`);
        return;
      }

      const parsedQuery = parse(content);
      const operationDefinition = parsedQuery.definitions.find(
        (def) => def.kind === 'OperationDefinition'
      ) as OperationDefinitionNode | undefined;

      if (operationDefinition) {
        const operationName = operationDefinition.name?.value || '';
        const firstField = operationDefinition.selectionSet.selections.find(
          (sel) => sel.kind === 'Field'
        ) as FieldNode | undefined;
        const firstFieldName = firstField ? firstField.name.value : '';

        const key = `${operationName}.${firstFieldName}`.trim();
        this.queryMap[key] = content;
      }
    });
  }

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
  public filter = (req: Request, res: Response, next: NextFunction) => {
    if (this.allowAll) return next();
    if (
      req.body.operationName === 'IntrospectionQuery' ||
      req.body.extensions?.persistedQuery
    ) {
      if (this.allowStudio) {
        return next();
      } else {
        return res
          .status(403)
          .send(
            'Access to studio is disabled by GraphQLQueryPurifier, pass { allowStudio: true }'
          );
      }
    }

    if (req.body && req.body.query) {
      const allowedQuery = getAllowedQueryForRequest(
        req.body.query,
        this.queryMap
      );

      if (allowedQuery) {
        // Use mergeQueries with the specific allowed query
        const filteredQuery = mergeQueries(
          req.body.query,
          allowedQuery,
          this.debug
        );

        // Existing code...
      } else {
        console.warn(`Query was blocked: ${req.body.query}`);
        req.body.query = '{ __typename }'; // Replace with a minimal query
      }
    }

    next();
  };
}
