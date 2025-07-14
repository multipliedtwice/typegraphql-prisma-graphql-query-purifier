import { GraphQLQueryPurifier } from '..';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import fg from 'fast-glob';

jest.mock('fs');
jest.mock('fast-glob');

describe('GraphQLQueryPurifier', () => {
  let purifier: GraphQLQueryPurifier;
  const gqlPath = './graphql/queries';
  const mockReq = {} as Request;
  const mockRes = {} as Response;
  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    purifier = new GraphQLQueryPurifier({ gqlPath, debug: true });
    mockReq.body = {};
    mockRes.status = jest.fn().mockReturnThis();
    mockRes.send = jest.fn();

    (fs.watch as jest.Mock).mockImplementation((path, options, callback) => {
      callback('change', 'test.gql');
      return { close: jest.fn() };
    });

    (fs.readFileSync as jest.Mock).mockReturnValue(`
      query getUser {
        user {
          id
          name
        }
      }
    `);

    (fg.sync as jest.Mock).mockReturnValue(['./graphql/queries/test.gql']);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should allow all queries if allowAll is true', () => {
    purifier = new GraphQLQueryPurifier({ gqlPath, allowAll: true });
    purifier.filter(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('should allow Apollo Studio introspection if allowStudio is true', () => {
    purifier = new GraphQLQueryPurifier({ gqlPath, allowStudio: true });
    mockReq.body = { operationName: 'IntrospectionQuery' };
    purifier.filter(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('should block Apollo Studio introspection if allowStudio is false', () => {
    purifier = new GraphQLQueryPurifier({ gqlPath, allowStudio: false });
    mockReq.body = { operationName: 'IntrospectionQuery' };
    purifier.filter(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.send).toHaveBeenCalledWith(
      'Access to studio is disabled by GraphQLQueryPurifier, pass { allowStudio: true }'
    );
  });

  test('should block queries not in the allowed list', () => {
    purifier = new GraphQLQueryPurifier({ gqlPath });
    purifier['queryMap'] = {};
    mockReq.body = { query: '{ user { id, name, email } }' };
    purifier.filter(mockReq, mockRes, mockNext);
    expect(mockReq.body.query).toBe('{ __typename }');
    expect(mockNext).toHaveBeenCalled();
  });

  test('should log and block queries that result in empty filtered queries', () => {
    purifier = new GraphQLQueryPurifier({ gqlPath, debug: true });
    purifier['queryMap'] = {
      'getUser.user': '{ user { id } }',
    };
    mockReq.body = { query: '{ user { name } }' };
    purifier.filter(mockReq, mockRes, mockNext);
    expect(mockReq.body.query).toBe('{ __typename }');
    expect(mockNext).toHaveBeenCalled();
  });

  test('should handle empty request query', () => {
    purifier = new GraphQLQueryPurifier({ gqlPath });
    mockReq.body = { query: '' };
    purifier.filter(mockReq, mockRes, mockNext);
    expect(mockReq.body.query).toBe('');
    expect(mockNext).toHaveBeenCalled();
  });

  test('should handle request query with only whitespace', () => {
    purifier = new GraphQLQueryPurifier({ gqlPath });
    mockReq.body = { query: '   ' };
    purifier.filter(mockReq, mockRes, mockNext);
    expect(mockReq.body.query).toBe('{ __typename }');
    expect(mockNext).toHaveBeenCalled();
  });

  test('should throw error for duplicate operation names when loading queries', () => {
    (fg.sync as jest.Mock).mockReturnValue([
      './graphql/queries/findMyJobs1.gql',
      './graphql/queries/findMyJobs2.gql',
    ]);

    (fs.readFileSync as jest.Mock).mockReturnValueOnce(`
      query FindMyJobs {
        data: findJobs {
          id
          createdAt
          job {
            id
            title
          }
        }
      }
    `).mockReturnValueOnce(`
      query FindMyJobs {
        data: findJobs {
          id
          createdAt
          deletedAt
          job {
            id
            title
            company {
              name
            }
          }
        }
      }
    `);

    expect(() => {
      purifier['loadQueries']();
    }).toThrowError('Duplicate operation name detected: FindMyJobs.');
  });
});
