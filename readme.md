# GraphQL Query Purifier

![backticks-codeblocks](./static/typegraphql-prisma-purifier.png)

This package provides a middleware for Express.js applications to manage and filter GraphQL queries based on `.gql` files. It is designed to enhance security and efficiency by allowing only specified queries to be processed by your GraphQL server.

## Usage with [typegraphql-prisma](https://www.npmjs.com/package/typegraphql-prisma)

TypeGraphQL-Prisma is a powerful integration that significantly simplifies backend development by automatically generating a fully-featured Node.js GraphQL API based on your Prisma schema. It turns your database schema into a fully-typed GraphQL API, making it an excellent tool for developers looking to bootstrap and quickly maintain robust Node.js GraphQL servers.

## Problem

With all benefits of typegraphql-prisma and its resolvers, the main concern is security. Auto-generated resolvers allow to query any relation of any level deep and no way to prevent overquerying. This little library is an attempt to set boundaries for what can be requested by clients.

## Features

- **Query Filtering**: Filters incoming GraphQL queries based on a list of allowed queries defined in `.gql` files.
- **Easy Integration**: Seamlessly integrates with existing Express.js and Apollo Server setups.
- **Customizable**: Easily adaptable to different GraphQL schema setups.

### Example

#### Input Query

An incoming query sent to your server might look like this:

```graphql
query findOneUser {
  findOneUser {
    id
    name
    email
    password
    posts {
      title
      content
    }
  }
}
```

#### Allowed Query

```graphql
query findOneUser {
  findOneUser {
    id
    posts {
      title
    }
  }
}
```

#### Output Query

The GraphQLQueryPurifier processes the input query and filters out the non-allowed fields. The output query, which will be processed by your GraphQL server, becomes:

```graphql
query findOneUser {
  findOneUser {
    id
    posts {
      title
    }
  }
}
```

The `email` and `posts.content` fields are removed from the query since they are not included in the allowed query.

## Installation

Install the package using npm:

```bash
npm install graphql-query-purifier

## Or using yarn:
yarn add graphql-query-purifier
```

## Usage

```javascript
import express from 'express';
import path from 'path';
import { json } from 'body-parser';
import { GraphQLQueryPurifier } from 'graphql-query-purifier';

const app = express();
const gqlpath = path.resolve(__dirname, '../../frontend/src/graphql');
const queryPurifier = new GraphQLQueryPurifier(gqlpath);

// make sure body parser is placed before
app.use(json());
app.use(queryPurifier.filter);

// your graphql middleware
```

## API Reference

- GraphQLQueryPurifier(gqlPath: string)

gqlPath: Path to the directory containing your .gql files or folders with it.

- filter(req, res, next)

An Express middleware function to filter incoming GraphQL queries.

## P.S.

It doesn't copy `.gql` files, only watches for it. If your frontend is in another repo - you may need to handle copying of files before commit.

### Contributing

Contributions are welcome!

#### License

This project is licensed under the MIT License.

Free Kanban app with integrated chat: https://rememo.io
