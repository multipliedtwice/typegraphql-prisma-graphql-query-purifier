import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { OperationDefinitionNode, parse } from 'graphql';
import path from 'path';
// @ts-ignore
import glob from 'glob';
import { mergeQueries } from './merge';

export class GraphQLQueryPurifier {
  private gqlPath: string;
  private queryMap: { [key: string]: string };
  private allowStudio?: boolean;
  private allowAll: boolean;

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
    this.allowAll = allowAll;
    this.allowStudio = allowStudio;
  }

  private loadQueries() {
    const files = glob.sync(`${this.gqlPath}/**/*.gql`.replace(/\\/g, '/'));

    files.forEach((file: string) => {
      if (path.extname(file) === '.gql') {
        const content = fs.readFileSync(file, 'utf8');
        const parsedQuery = parse(content);

        parsedQuery.definitions.forEach((definition) => {
          if (definition.kind === 'OperationDefinition') {
            const operationDefinition = definition as OperationDefinitionNode;

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
      const filteredQuery = mergeQueries(req.body.query, allowedQueries);

      if (!filteredQuery.trim()) {
        // Log the incident for monitoring
        console.warn(
          `Query was blocked due to security rules: ${req.body.query}`
        );

        return res.status(403).send('The requested query is not allowed.');
      } else {
        req.body.query = filteredQuery;
      }
    }
    next();
  };
}
