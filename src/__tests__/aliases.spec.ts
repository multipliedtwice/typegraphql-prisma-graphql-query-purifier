import { getAllowedQueryForRequest } from '../get-allowed-query';
import { mergeQueries } from '../merge';

const allowedQueries = {
  'FindMyJobs.findJobs': `query FindMyJobs {
          data: findJobs {
            id
            createdAt
            deletedAt
            job {
              id
              title
              company {
                name
              }
              workMode
            }
          }
        }`,
  'FindMyCompanyTalentJobApplications.findJobs': `query FindMyCompanyTalentJobApplications($where: TalentJobApplicationWhereInput, $orderBy: [TalentJobApplicationOrderByWithRelationInput!]) {
          data: findJobs(where: $where, orderBy: $orderBy) {
            createdAt
            id
            job {
              title
            }
            talentProfile {
              profileName
            }
          }
        }`,
};

describe('aliases', () => {
  test('FindMyJobs should handle aliases (request talentProfile when it is not allowed)', () => {
    const requestQuery = `query FindMyJobs {
          data: findJobs {
            id
            createdAt
            deletedAt
            job {
              id
              title
              company {
                name
              }
              workMode
            }
            talentProfile {
              profileName
            }
          }
        }`;

    const expected = `query FindMyJobs {
  data: findJobs {
    id
    createdAt
    deletedAt
    job {
      id
      title
      company {
        name
      }
      workMode
    }
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('FindMyCompanyTalentJobApplications should handle aliases2  (request workMode when it is not allowed)', () => {
    const requestQuery = `query FindMyCompanyTalentJobApplications($where: TalentJobApplicationWhereInput, $orderBy: [TalentJobApplicationOrderByWithRelationInput!]) {
          data: findJobs(where: $where, orderBy: $orderBy) {
            createdAt
            id
            job {
              title
              __typename
            }
            talentProfile {
              profileName
              __typename
            }
            workMode
            __typename
          }
        }`;
    const expected = `query FindMyCompanyTalentJobApplications($where: TalentJobApplicationWhereInput, $orderBy: [TalentJobApplicationOrderByWithRelationInput!]) {
  data: findJobs(where: $where, orderBy: $orderBy) {
    createdAt
    id
    job {
      title
    }
    talentProfile {
      profileName
    }
  }
}`;
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    console.log('allowedQuery', allowedQuery);
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });

  test('Exploit with Aliased Fields to bypass restrictions', () => {
    const requestQuery = `query FindMyJobs {
      data: findJobs {
        id
        job {
          id
          secretTitle: secret
          workMode
        }
      }
    }`;
    const expected = `query FindMyJobs {
  data: findJobs {
    id
    job {
      id
      workMode
    }
  }
}`; // 'secretTitle' alias for 'title' is allowed since 'title' is allowed
    const allowedQuery = getAllowedQueryForRequest(
      requestQuery,
      allowedQueries
    );
    expect(mergeQueries(requestQuery, allowedQuery)).toBe(expected);
  });
});
