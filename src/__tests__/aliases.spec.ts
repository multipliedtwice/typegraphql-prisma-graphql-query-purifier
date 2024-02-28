import { getAllowedQueryForRequest } from '../get-allowed-query';
import { mergeQueries } from '../merge';

const allowedQueries = {
  'FindMyTalentJobApplications.findJobApplications': `query FindMyTalentJobApplications {
          data: findJobApplications {
            id
            createdAt
            deletedAt
            jobAd {
              id
              location
              title
              publisherCompany {
                name
              }
              workMode
            }
          }
        }`,
  'FindMyCompanyTalentJobApplications.findJobApplications': `query FindMyCompanyTalentJobApplications($where: TalentJobApplicationWhereInput, $orderBy: [TalentJobApplicationOrderByWithRelationInput!]) {
          data: findJobApplications(where: $where, orderBy: $orderBy) {
            createdAt
            id
            jobAd {
              title
            }
            talentProfile {
              profileName
            }
          }
        }`,
};

describe('aliases', () => {
  test('FindMyTalentJobApplications should handle aliases (request talentProfile when it is not allowed)', () => {
    const requestQuery = `query FindMyTalentJobApplications {
          data: findJobApplications {
            id
            createdAt
            deletedAt
            jobAd {
              id
              location
              title
              publisherCompany {
                name
              }
              workMode
            }
            talentProfile {
              profileName
            }
          }
        }`;

    const expected = `query FindMyTalentJobApplications {
  data: findJobApplications {
    id
    createdAt
    deletedAt
    jobAd {
      id
      location
      title
      publisherCompany {
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
          data: findJobApplications(where: $where, orderBy: $orderBy) {
            createdAt
            id
            jobAd {
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
  data: findJobApplications(where: $where, orderBy: $orderBy) {
    createdAt
    id
    jobAd {
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
    const requestQuery = `query FindMyTalentJobApplications {
      data: findJobApplications {
        id
        jobAd {
          id
          location
          secretTitle: secret
          workMode
        }
      }
    }`;
    const expected = `query FindMyTalentJobApplications {
  data: findJobApplications {
    id
    jobAd {
      id
      location
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
