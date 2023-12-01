"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowedQueryForRequest = void 0;
const graphql_1 = require("graphql");
function getAllowedQueryForRequest(requestQuery, allowedQueriesMap) {
    if (!requestQuery)
        return '';
    const parsedRequestQuery = (0, graphql_1.parse)(requestQuery);
    const operationDefinition = parsedRequestQuery.definitions.find((def) => def.kind === 'OperationDefinition');
    if (!operationDefinition)
        return '';
    const operationName = operationDefinition.name?.value || '';
    const firstField = operationDefinition.selectionSet.selections.find((sel) => sel.kind === 'Field');
    const firstFieldName = firstField ? firstField.name.value : '';
    const key = `${operationName ? operationName + '.' : ''}${firstFieldName}`.trim();
    console.log('key :>> ', key);
    console.log('allowedQueriesMap[key] :>> ', allowedQueriesMap[key]);
    return allowedQueriesMap[key] || '';
}
exports.getAllowedQueryForRequest = getAllowedQueryForRequest;
