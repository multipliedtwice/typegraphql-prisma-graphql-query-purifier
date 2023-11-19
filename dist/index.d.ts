import { NextFunction, Request, Response } from 'express';
export declare class GraphQLQueryPurifier {
    private gqlPath;
    private queryMap;
    private allowStudio?;
    private allowAll;
    constructor({ gqlPath, allowAll, allowStudio, }: {
        gqlPath: string;
        allowStudio?: boolean;
        allowAll?: boolean;
    });
    private loadQueries;
    filter: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
}
