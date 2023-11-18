import { FieldNode, parse, print, visit } from 'graphql';

export function mergeQueries(
  requestQuery: string,
  allowedQueries: string[]
): string {
  if (!requestQuery.trim()) {
    return ''; // Return an empty string for empty requestQuery
  }

  const parsedRequestQuery = parse(requestQuery);
  const allowedQueryASTs = allowedQueries.map((query) => parse(query));

  const allowedFields = new Set<string>();
  // Extract allowed fields from allowedQueryASTs
  allowedQueryASTs.forEach((ast) => {
    visit(ast, {
      Field(node) {
        allowedFields.add(node.name.value);
      },
    });
  });

  // Modify the AST of the request query based on allowed fields
  const modifiedAST = visit(parsedRequestQuery, {
    Field(node: FieldNode) {
      if (!allowedFields.has(node.name.value)) {
        return null; // This removes the field from the AST
      }
      return undefined; // Continue visiting child nodes
    },
  });

  return print(modifiedAST);
}
