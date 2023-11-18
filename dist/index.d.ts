import { NextFunction, Request, Response } from 'express';
export declare class GraphQLQueryPurifier {
    private gqlPath;
    private queryMap;
    constructor(gqlPath: string);
    private loadQueries;
    filter: (req: Request, res: Response, next: NextFunction) => void;
}
