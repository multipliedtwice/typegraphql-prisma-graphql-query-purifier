import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { GraphQLError, OperationDefinitionNode, parse } from 'graphql';
import path from 'path';
// @ts-ignore
import glob from 'glob';
import { mergeQueries } from './merge';

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
   * Constructs a GraphQLQueryPurifier instance.
   * @param {Object} params - Configuration parameters.
   * @param {string} params.gqlPath - Path to the directory containing .gql files.
   * @param {boolean} [params.allowAll=false] - Whether to allow all queries.
   * @param {boolean} [params.allowStudio=false] - Whether to allow Apollo Studio introspection queries.
   */
  constructor({
    gqlPath,
    allowAll = false,
    allowStudio = false,
  }: {
    gqlPath: string;
    allowStudio?: boolean;
    allowAll?: boolean;
  }) {
    this.gqlPath = gqlPath;
    this.queryMap = {};
    this.loadQueries();
    this.startWatchingFiles();
    this.allowAll = allowAll;
    this.allowStudio = allowStudio;
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

    files.forEach((file: string) => {
      if (path.extname(file) === '.gql') {
        const content = fs.readFileSync(file, 'utf8').trim();

        if (!content) {
          console.warn(`Warning: Empty or invalid GraphQL file found: ${file}`);
          return;
        }

        try {
          const parsedQuery = parse(content);
          parsedQuery.definitions.forEach((definition) => {
            if (definition.kind === 'OperationDefinition') {
              const operationDefinition = definition as OperationDefinitionNode;

              let queryName = operationDefinition.name?.value;
              if (!queryName) {
                // Extract the name from the first field of the selection set
                const firstField =
                  operationDefinition.selectionSet.selections[0];
                if (firstField && firstField.kind === 'Field') {
                  queryName = firstField.name.value;
                }
              }

              if (queryName) {
                this.queryMap[queryName] = content;
              }
            }
          });
        } catch (error) {
          if (error instanceof GraphQLError) {
            console.error(
              `Error parsing GraphQL file ${file}: ${error.message}`
            );
          } else {
            console.error(`Unexpected error processing file ${file}: ${error}`);
          }
        }
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

    // Get all allowed queries as an array of strings
    const allowedQueries = Object.values(this.queryMap);
    if (!allowedQueries.length) {
      console.warn(
        'Warning: No GraphQL queries were loaded in GraphQLQueryPurifier. ' +
          'Ensure that your .gql files are located in the specified directory: ' +
          this.gqlPath
      );
    }

    if (req.body && req.body.query) {
      // Use mergeQueries to filter the incoming request query
      const filteredQuery = mergeQueries(
        req.body.query,
        allowedQueries,
        req.body.operationName
      );

      if (!filteredQuery.trim()) {
        console.warn(
          `Query was blocked due to security rules: ${req.body.query}`
        );
        req.body.query = '{ __typename }';
        delete req.body.operationName; // Remove the operation name
      } else {
        req.body.query = filteredQuery;
      }
    }
    next();
  };
}
