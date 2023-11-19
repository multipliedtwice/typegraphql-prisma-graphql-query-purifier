import { mergeQueries } from '../merge';

describe('mergeQueries', () => {
  test('should allow fields present in allowed queries', () => {
    const requestQuery = `{ user { id, name, email } }`;
    const allowedQueries = [`{ user { id, name } }`];
    const expected = `{
  user {
    id
    name
  }
}`;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should exclude fields not present in allowed queries', () => {
    const requestQuery = `{ user { id, name, email } }`;
    const allowedQueries = [`{ user { id } }`];
    const expected = `{
  user {
    id
  }
}`;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should handle nested queries', () => {
    const requestQuery = `{ user { id, profile { name, age } } }`;
    const allowedQueries = [`{ user { profile { name } } }`];
    const expected = `{
  user {
    profile {
      name
    }
  }
}`;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should handle queries with arguments', () => {
    const requestQuery = `{ users(age: 30) { id, name } }`;
    const allowedQueries = [`{ users { name } }`];
    const expected = `{
  users(age: 30) {
    name
  }
}`;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should strictly follow allowed queries with aliases', () => {
    const requestQuery = `{ user: users { id, name } }`;
    const allowedQueries = [`{ user: users { name } }`];
    const expected = `{
  user: users {
    name
  }
}`;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should strictly follow allowed queries without aliases', () => {
    const requestQuery = `{ users { id, name } }`;
    const allowedQueries = [`{ users { name } }`];
    const expected = `{
  users {
    name
  }
}`;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should handle mutations', () => {
    const requestQuery = `mutation { updateUser(id: 1, data: { name: "New Name" }) { id, name } }`;
    const allowedQueries = [
      `mutation { updateUser(id: 1, data: { name: "New Name" }) { name } }`,
    ];
    const expected = `mutation {
  updateUser(id: 1, data: {name: "New Name"}) {
    name
  }
}`;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should handle multiple allowed queries', () => {
    const requestQuery = `{ user { id, name, email } }`;
    const allowedQueries = [`{ user { id } }`, `{ user { name } }`];
    const expected = `{
  user {
    id
    name
  }
}`;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should handle empty requestQuery', () => {
    const requestQuery = '';
    const allowedQueries = [`{ user { id, name } }`];
    const expected = '';
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should handle empty allowedQueries', () => {
    const requestQuery = `{ user { id, name, email } }`;
    const allowedQueries: any[] = [];
    const expected = '';
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should handle mutations', () => {
    const requestQuery = `mutation { updateUser(id: 1, data: { name: "New Name" }) { id, name } }`;
    const allowedQueries = [
      `mutation { updateUser(id: 1, data: { name: "New Name" }) { name } }`,
    ];
    const expected = `mutation {
  updateUser(id: 1, data: {name: "New Name"}) {
    name
  }
}`;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should handle deeply nested queries', () => {
    const requestQuery = `{ user { id, profile { name, address { street, city } } } }`;
    const allowedQueries = [`{ user { profile { address { street } } } }`];
    const expected = `{
  user {
    profile {
      address {
        street
      }
    }
  }
}`;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });

  test('should handle nested mutations', () => {
    const requestQuery = `mutation { updateUser(id: 1, data: { profile: { name: "New Name" } }) { id } }`;
    const allowedQueries = [
      `mutation { updateUser(id: 1, data: { profile: { name: "New Name" } }) { id } }`,
    ];
    const expected = `mutation {
  updateUser(id: 1, data: {profile: {name: "New Name"}}) {
    id
  }
}`;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
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
    const allowedQueries = [
      `query {
  departments {
    id
    name
    employees {
      id
      name
    }
  }
}`,
      `query {
  salaries {
    amount
  }
}`,
    ];
    const expected = ``;
    expect(mergeQueries(requestQuery, allowedQueries)).toBe(expected);
  });
});
