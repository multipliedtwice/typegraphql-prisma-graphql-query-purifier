"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge_allowed_1 = require("../merge-allowed");
describe('mergeAllowedGraphQLQueries', () => {
    it('should merge queries with the same resolver and different fields', () => {
        const queries = [
            'query GetCompany { id }',
            'query GetCompany { name }',
            'query GetUser { id }',
        ];
        const mergedQueries = (0, merge_allowed_1.mergeAllowedGraphQLQueries)(queries);
        expect(mergedQueries.get('GetCompany')).toBe('query GetCompany { id name }');
        expect(mergedQueries.get('GetUser')).toBe('query GetUser { id }');
    });
    it('should handle single query without modification', () => {
        const queries = ['query GetCompany { id name }'];
        const mergedQueries = (0, merge_allowed_1.mergeAllowedGraphQLQueries)(queries);
        expect(mergedQueries.get('GetCompany')).toBe('query GetCompany { id name }');
    });
    it('should handle empty query list', () => {
        const queries = [];
        const mergedQueries = (0, merge_allowed_1.mergeAllowedGraphQLQueries)(queries);
        expect(mergedQueries.size).toBe(0);
    });
    it('should ignore invalid GraphQL queries', () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => { });
        const queries = ['This is not a valid GraphQL query'];
        const mergedQueries = (0, merge_allowed_1.mergeAllowedGraphQLQueries)(queries);
        expect(mergedQueries.size).toBe(0);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error processing query:'));
        consoleSpy.mockRestore();
    });
});
