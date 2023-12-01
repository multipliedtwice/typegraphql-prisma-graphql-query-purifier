import { ASTNode, FieldNode, parse, print, visit } from 'graphql';

function getPath(node: FieldNode, ancestors: ASTNode[]) {
  // Build the path from the ancestors and the current node
  const path = ancestors
    .map((ancestor) => (ancestor.kind === 'Field' ? ancestor.name.value : null))
    .filter(Boolean);
  path.push(node.name.value);
  return path.join('.');
}

export function mergeQueries(
  requestQuery: string,
  allowedQueries: string[],
  debug: boolean = false
): string {
  if (!requestQuery.trim()) {
    return '';
  }
  if (debug) {
    console.log('Incoming Query:', requestQuery);
  }
  const parsedRequestQuery = parse(requestQuery);
  const allowedQueryASTs = allowedQueries.map((query) => parse(query));

  const allowedPaths = new Set<string>();
  // Extract allowed paths from allowedQueryASTs
  allowedQueryASTs.forEach((ast) => {
    visit(ast, {
      Field(node, key, parent, path, ancestors) {
        allowedPaths.add(getPath(node, ancestors as ASTNode[]));
      },
    });
  });

  // Modify the AST of the request query based on allowed paths
  const modifiedAST = visit(parsedRequestQuery, {
    Field(node, key, parent, path, ancestors) {
      const currentPath = getPath(node, ancestors as ASTNode[]);
      if (!allowedPaths.has(currentPath)) {
        return null; // Remove the field from the AST
      }
    },
  });

  // Check if the modified query has any fields left in its selection set
  const hasValidFields = modifiedAST.definitions.some(
    (def) =>
      def.kind === 'OperationDefinition' &&
      def.selectionSet.selections.length > 0
  );

  if (!hasValidFields) {
    return ''; // Return an empty string if no valid fields are left
  }

  const modifiedQuery = print(modifiedAST);

  if (debug) {
    console.log('Modified Query:', modifiedQuery);
  }

  return modifiedQuery;
}
