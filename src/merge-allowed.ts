import { parse, OperationDefinitionNode } from 'graphql';

export function mergeAllowedGraphQLQueries(
  queries: string[]
): Map<string, string> {
  const resolverMap = new Map<string, Set<string>>();

  queries.forEach((query) => {
    try {
      const parsedQuery = parse(query);
      parsedQuery.definitions.forEach((definition) => {
        if (definition.kind === 'OperationDefinition') {
          const operationDefinition = definition as OperationDefinitionNode;

          let queryName = operationDefinition.name?.value;
          if (!queryName) {
            const firstField = operationDefinition.selectionSet.selections[0];
            if (firstField && firstField.kind === 'Field') {
              queryName = firstField.name.value;
            }
          }

          if (queryName) {
            const existingFields =
              resolverMap.get(queryName) || new Set<string>();
            operationDefinition.selectionSet.selections.forEach((selection) => {
              if (selection.kind === 'Field') {
                existingFields.add(selection.name.value);
              }
            });

            resolverMap.set(queryName, existingFields);
          }
        }
      });
    } catch (error) {
      console.error(`Error processing query: ${error}`);
    }
  });

  const mergedQueries = new Map<string, string>();
  resolverMap.forEach((fields, resolver) => {
    const mergedQuery = `query ${resolver} { ${Array.from(fields).join(' ')} }`;
    mergedQueries.set(resolver, mergedQuery);
  });

  return mergedQueries;
}
