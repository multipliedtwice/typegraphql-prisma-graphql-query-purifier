import { mergeAllowedGraphQLQueries } from '../merge-allowed';

describe('mergeAllowedGraphQLQueries', () => {
  it('should merge queries with the same resolver and different fields', () => {
    const queries = [
      'query GetCompany { id }',
      'query GetCompany { name }',
      'query GetUser { id }',
    ];

    const mergedQueries = mergeAllowedGraphQLQueries(queries);
    expect(mergedQueries.get('GetCompany')).toBe(
      'query GetCompany { id name }'
    );
    expect(mergedQueries.get('GetUser')).toBe('query GetUser { id }');
  });

  it('should handle single query without modification', () => {
    const queries = ['query GetCompany { id name }'];
    const mergedQueries = mergeAllowedGraphQLQueries(queries);
    expect(mergedQueries.get('GetCompany')).toBe(
      'query GetCompany { id name }'
    );
  });

  it('should handle empty query list', () => {
    const queries: string[] = [];
    const mergedQueries = mergeAllowedGraphQLQueries(queries);
    expect(mergedQueries.size).toBe(0);
  });

  it('should ignore invalid GraphQL queries', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const queries = ['This is not a valid GraphQL query'];

    const mergedQueries = mergeAllowedGraphQLQueries(queries);
    expect(mergedQueries.size).toBe(0);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error processing query:')
    );
    consoleSpy.mockRestore();
  });
});
