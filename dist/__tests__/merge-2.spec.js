"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge_1 = require("../merge");
describe('mergeQueries', () => {
    test('should handle complex typegraphql-prisma queries', () => {
        const requestQuery = `query FindAdminTalentProfile($where: TalentProfileWhereUniqueInput!) {
  data: findAdminTalentProfile(where: $where) {
    id
    profileName
    description
    education
    email
    user {
      email
      phoneNumber
      lastVisit
      __typename
    }
    __typename
  }
}`;
        const allowedQueries = [
            `query FindAdminTalentProfile($where: TalentProfileWhereUniqueInput!) {
  data: findAdminTalentProfile(where: $where) {
    id
    profileName
    description
    education
    email
    user {
      email
      phoneNumber
      lastVisit
      __typename
    }
    __typename
  }
}`,
            `query groupByLocationsTalentProfiles($by: [TalentProfileScalarFieldEnum!]!, $orderBy: [TalentProfileOrderByWithAggregationInput!]) {
  data: groupByTalentProfiles(by: $by, orderBy: $orderBy) {
    location
    _count {
      location
      __typename
    }
    __typename
  }
}`,
            `query FindUser($where: CompanyOnUserWhereInput) {
  data: findMe {
    redirect
    companies(where: $where) {
      company {
        id
        deletedAt
        address
        logo
        name
        verificationStatus
        __typename
      }
      __typename
    }
    profile {
      id
      userId
      jobTitle
      profileName
      profilePicture
      isAvailableForHire
      isInterestedInRelocation
      languages
      location
      rateCurrency
      skills
      totalExperience
      description
      experience
      education
      monthlyRate
      hourlyRate
      __typename
    }
    __typename
  }
}`,
        ];
        const expected = `query FindAdminTalentProfile($where: TalentProfileWhereUniqueInput!) {
  data: findAdminTalentProfile(where: $where) {
    id
    profileName
    description
    education
    email
    user {
      email
      phoneNumber
      lastVisit
      __typename
    }
    __typename
  }
}`;
        expect((0, merge_1.mergeQueries)(requestQuery, allowedQueries)).toBe(expected);
    });
    test('should handle request trying to query much more than allowed', () => {
        const requestQuery = `query {
  user {
    id
    name
    email
    profile {
      bio
      address
      phoneNumber
      website
      skills
      experiences {
        title
        company
        startDate
        endDate
      }
    }
  }
}`;
        const allowedQueries = [
            `{
      user {
        id
        name
      }
    }`,
        ];
        const expected = `{
  user {
    id
    name
  }
}`;
        expect((0, merge_1.mergeQueries)(requestQuery, allowedQueries)).toBe(expected);
    });
});
