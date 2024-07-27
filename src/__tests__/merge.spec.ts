import { getAllowedQueryForRequest } from '../get-allowed-query';
import { mergeQueries } from '../merge';

describe('mergeQueries', () => {
  test('should allow fields present in allowed queries 1', () => {
    const requestQuery = `{ user { id, name, email } }`;
    const allowedQueries = { user: `{ user { id, name } }` };
    const expected = `{
  user {
    id
    name
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should exclude fields not present in allowed queries', () => {
    const requestQuery = `{ user { id, name, email } }`;
    const allowedQueries = { user: `{ user { id } }` };
    const expected = `{
  user {
    id
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle nested queries', () => {
    const requestQuery = `{ user { id, profile { name, age } } }`;
    const allowedQueries = { user: `{ user { profile { name } } }` };
    const expected = `{
  user {
    profile {
      name
    }
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle queries with arguments', () => {
    const requestQuery = `{ users(age: 30) { id, name } }`;
    const allowedQueries = { users: `{ users { name } }` };
    const expected = `{
  users(age: 30) {
    name
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should strictly follow allowed queries with aliases', () => {
    const requestQuery = `{ user: users { id, name } }`;
    const allowedQueries = { users: `{ user: users { name } }` };
    const expected = `{
  user: users {
    name
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should strictly follow allowed queries without aliases', () => {
    const requestQuery = `{ users { id, name } }`;
    const allowedQueries = { users: `{ users { name } }` };
    const expected = `{
  users {
    name
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle mutations', () => {
    const requestQuery = `mutation { updateUser(id: 1, data: { name: "New Name" }) { id, name } }`;
    const allowedQueries = {
      updateUser: `mutation { updateUser(id: 1, data: { name: "New Name" }) { name } }`,
    };
    const expected = `mutation {
  updateUser(id: 1, data: {name: "New Name"}) {
    name
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle multiple allowed queries', () => {
    const requestQuery = `{ user { id, name, email } }`;
    const allowedQueries = { user: `{ user { id } }` };
    const expected = `{
  user {
    id
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle empty requestQuery', () => {
    const requestQuery = '';
    const allowedQueries = { user: `{ user { id, name } }` };
    const expected = '';
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle empty allowedQueries', () => {
    const requestQuery = `{ user { id, name, email } }`;
    const allowedQueries: any = {};
    const expected = '';
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle mutations', () => {
    const requestQuery = `mutation { updateUser(id: 1, data: { name: "New Name" }) { id, name } }`;
    const allowedQueries = {
      updateUser: `mutation { updateUser(id: 1, data: { name: "New Name" }) { name } }`,
    };
    const expected = `mutation {
  updateUser(id: 1, data: {name: "New Name"}) {
    name
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle deeply nested queries', () => {
    const requestQuery = `{ user { id, profile { name, address { street, city } } } }`;
    const allowedQueries = {
      user: `{ user { profile { address { street } } } }`,
    };
    const expected = `{
  user {
    profile {
      address {
        street
      }
    }
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle nested mutations', () => {
    const requestQuery = `mutation { updateUser(id: 1, data: { profile: { name: "New Name" } }) { id } }`;
    const allowedQueries = {
      updateUser: `mutation { updateUser(id: 1, data: { profile: { name: "New Name" } }) { id } }`,
    };
    const expected = `mutation {
  updateUser(id: 1, data: {profile: {name: "New Name"}}) {
    id
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle subqueries', () => {
    const requestQuery = `query {
    employees {
      salary {
        amount
      }
      name
    }
  }`;
    const allowedQueries = {
      departments: `query {
    departments {
      id
      name
      employees {
        id
        name
      }
    }
  }`,
      salaries: `query {
    salaries {
      amount
    }
  }`,
    };
    const expected = ``;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle subqueries', () => {
    const requestQuery = `query ExampleQuery($where: DepartmentWhereUniqueInput!) {
    department(where: $where) {
      id
    }
  }`;
    const allowedQueries = {
      departments: `query {
    departments {
      id
      name
      employees {
        id
        name
      }
    }
  }`,
      salaries: `query {
    salaries {
      amount
    }
  }`,
    };
    const expected = ``;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  // TODO: handle this case
  test.skip('should handle subqueries', () => {
    const requestQuery = `query GetDepartment {
    departments {
      name
    }
  }`;
    const allowedQueries = {
      departments: `query departments {
    departments {
      id
    }
  }`,
    };
    const expected = ``;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('should handle requestQuery with only whitespace', () => {
    const requestQuery = '   ';
    const allowedQueries = { user: `{ user { id, name } }` };
    const expected = '';
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });
});
