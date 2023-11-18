import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import glob from 'glob';
import { OperationDefinitionNode, parse } from 'graphql';
import path from 'path';

import { mergeQueries } from './merge';

export class GraphQLQueryPurifier {
  private gqlPath: string;
  private queryMap: { [key: string]: string };

  constructor(gqlPath: string) {
    this.gqlPath = gqlPath;
    this.queryMap = {};
    this.loadQueries();
  }

  private loadQueries() {
    const files = glob.sync(`${this.gqlPath}/**/*.gql`);
    files.forEach((file) => {
      if (path.extname(file) === '.gql') {
        const content = fs.readFileSync(file, 'utf8');
        const parsedQuery = parse(content);

        const operationDefinition = parsedQuery.definitions.find(
          (def) => def.kind === 'OperationDefinition'
        ) as OperationDefinitionNode | undefined;

        const queryName = operationDefinition?.name?.value;
        if (queryName) {
          this.queryMap[queryName] = content;
        }
      }
    });
  }

  public customGraphQLMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (req.body && req.body.query) {
      // Get all allowed queries as an array of strings
      const allowedQueries = Object.values(this.queryMap);

      // Use mergeQueries to filter the incoming request query
      req.body.query = mergeQueries(req.body.query, allowedQueries);
    }
    next();
  };
}
