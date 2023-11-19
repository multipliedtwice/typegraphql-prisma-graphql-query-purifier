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
  allowedQueries: string[]
): string {
  if (!requestQuery.trim()) {
    return '';
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
      return undefined; // Continue visiting child nodes
    },
  });

  // Check if the modified query has any fields left in its selection set
  const hasFields = modifiedAST.definitions.some(
    (def) =>
      def.kind === 'OperationDefinition' &&
      def.selectionSet.selections.length > 0
  );

  if (!hasFields) {
    // Return a placeholder or minimal query
    return '';
  }

  return print(modifiedAST);
}
