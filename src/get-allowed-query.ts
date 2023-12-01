import { parse, OperationDefinitionNode, FieldNode } from 'graphql';

export function getAllowedQueryForRequest(
  requestQuery: string,
  allowedQueriesMap: { [key: string]: string }
): string {
  if (!requestQuery) return '';
  const parsedRequestQuery = parse(requestQuery);
  const operationDefinition = parsedRequestQuery.definitions.find(
    (def) => def.kind === 'OperationDefinition'
  ) as OperationDefinitionNode | undefined;

  if (!operationDefinition) return '';

  const operationName = operationDefinition.name?.value || '';
  const firstField = operationDefinition.selectionSet.selections.find(
    (sel) => sel.kind === 'Field'
  ) as FieldNode | undefined;
  const firstFieldName = firstField ? firstField.name.value : '';

  const key = `${
    operationName ? operationName + '.' : ''
  }${firstFieldName}`.trim();
  console.log('key :>> ', key);
  console.log('allowedQueriesMap[key] :>> ', allowedQueriesMap[key]);
  return allowedQueriesMap[key] || '';
}
