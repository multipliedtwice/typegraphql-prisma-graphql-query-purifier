"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge_1 = require("../merge");
describe('mergeQueries 2', () => {
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
    test('should handle findMe', () => {
        const requestQuery = `query FindUser($where: CompanyOnUserWhereInput) {
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
      }
    }
    profile {
      id
      userId
      jobTitle
      profileName
      profilePicture
      isAvailableForHire
      isInterestedInRelocation
      interestedToRelocateTo
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
      isVisible
      workMode
      availabilityMode
    }
  }
}`;
        const allowedQueries = [
            'mutation AdminUpdateManyCompanies(\n' +
                '  $data: CompanyUpdateManyMutationInput!\n' +
                '  $where: CompanyWhereInput\n' +
                ') {\n' +
                '  adminUpdateManyCompanies(data: $data, where: $where) {\n' +
                '    count\n' +
                '  }\n' +
                '}',
            'mutation AdminUpdateOneCompany($data: CompanyUpdateInput!, $where: CompanyWhereUniqueInput!) {\n' +
                '  adminUpdateOneCompany(data: $data, where: $where) {\n' +
                '    verificationStatus\n' +
                '  }\n' +
                '}',
            'mutation AdminUpdateTalentProfile(\n' +
                '  $data: TalentProfileUpdateInput!\n' +
                '  $where: TalentProfileWhereUniqueInput!\n' +
                ') {\n' +
                '  adminUpdateTalentProfile(data: $data, where: $where) {\n' +
                '    verificationStatus\n' +
                '  }\n' +
                '}',
            'mutation AdminUpdateTalentProfiles(\n' +
                '  $data: TalentProfileUpdateManyMutationInput!\n' +
                '  $where: TalentProfileWhereInput\n' +
                ') {\n' +
                '  adminUpdateTalentProfiles(data: $data, where: $where) {\n' +
                '    verificationStatus\n' +
                '  }\n' +
                '}',
            'mutation CreateCompany($args: CompanyCreateCustomInput!) {\n' +
                '  data: createCompany(args: $args) {\n' +
                '    id\n' +
                '    address\n' +
                '    logo\n' +
                '    name\n' +
                '    verificationStatus\n' +
                '  }\n' +
                '}',
            'mutation CreateCompanyTalentRoster($args: CompanyTalentRosterUpsertCustomInput!) {\n' +
                '  createCompanyTalentRoster(args: $args) {\n' +
                '    id\n' +
                '  }\n' +
                '}',
            'mutation CreateOneJobAssignment($data: JobAssignmentCreateInput!) {\n' +
                '  createOneJobAssignment(data: $data) {\n' +
                '    id\n' +
                '  }\n' +
                '}',
            'mutation CreateJobDescription($args: JobDescriptionUpsertCustomInput!) {\n' +
                '  data: createJobDescription(args: $args) {\n' +
                '    clientCompanyId\n' +
                '    currency\n' +
                '    description\n' +
                '    language\n' +
                '    location\n' +
                '    salary\n' +
                '    skills\n' +
                '    title\n' +
                '  }\n' +
                '}',
            'mutation CreateTalentProfile($args: TalentProfileCreateCustomInput!) {\n' +
                '  createTalentProfile(args: $args) {\n' +
                '    id\n' +
                '  }\n' +
                '}',
            'mutation CreateUser($args: CreateUserInput!) {\n' +
                '  data: createUser(args: $args) {\n' +
                '    message\n' +
                '  }\n' +
                '}',
            'mutation DeleteCompany($args: String!) {\n' +
                '  data: deleteCompany(args: $args) {\n' +
                '    id\n' +
                '    deletedAt\n' +
                '  }\n' +
                '}',
            'mutation DeleteCompanyTalentRoster($args: String!) {\n' +
                '  deleteCompanyTalentRoster(args: $args) {\n' +
                '    id\n' +
                '  }\n' +
                '}',
            'mutation GetSignedURLForPictureUpload($filename: String!) {\n' +
                '  data: getSignedURLForPictureUpload(filename: $filename) {\n' +
                '    signedUrl\n' +
                '  }\n' +
                '}',
            'mutation OptimizeImage($args: ResizeImageInput!) {\n' +
                '  optimizeImage(args: $args)\n' +
                '}',
            'mutation UpdateCompanyTalentRoster($args: CompanyTalentRosterUpsertCustomInput!) {\n' +
                '  updateCompanyTalentRoster(args: $args) {\n' +
                '    id\n' +
                '  }\n' +
                '}',
            'mutation UpdateOneJobAssignment(\n' +
                '  $data: JobAssignmentUpdateInput!\n' +
                '  $where: JobAssignmentWhereUniqueInput!\n' +
                ') {\n' +
                '  updateOneJobAssignment(data: $data, where: $where) {\n' +
                '    id\n' +
                '    talentNote\n' +
                '  }\n' +
                '}',
            'mutation UpdateJobDescription($args: JobDescriptionUpsertCustomInput!) {\n' +
                '  data: updateJobDescription(args: $args) {\n' +
                '    currency\n' +
                '    description\n' +
                '    language\n' +
                '    location\n' +
                '    salary\n' +
                '    skills\n' +
                '    title\n' +
                '    workMode\n' +
                '    assignmentType\n' +
                '    salary\n' +
                '    currency\n' +
                '    language\n' +
                '    openForApplications\n' +
                '  }\n' +
                '}',
            'mutation UpdateTalentProfile($args: TalentProfileUpdateCustomInput!) {\n' +
                '  data: updateTalentProfile(args: $args) {\n' +
                '    jobTitle\n' +
                '    profileName\n' +
                '    profilePicture\n' +
                '    isAvailableForHire\n' +
                '    isInterestedInRelocation\n' +
                '    languages\n' +
                '    location\n' +
                '    rateCurrency\n' +
                '    skills\n' +
                '    totalExperience\n' +
                '    description\n' +
                '    experience\n' +
                '    education\n' +
                '    hourlyRate\n' +
                '    monthlyRate\n' +
                '  }\n' +
                '}',
            'query FindAdminCompanies(\n' +
                '  $orderBy: [CompanyOrderByWithRelationInput!]\n' +
                '  $usersOrderBy: [CompanyOnUserOrderByWithRelationInput!]\n' +
                '  $usersTake: Int\n' +
                '  $where: CompanyWhereInput\n' +
                '  $usersWhere: CompanyOnUserWhereInput\n' +
                ') {\n' +
                '  data: findAdminCompanies(orderBy: $orderBy, where: $where) {\n' +
                '    id\n' +
                '    name\n' +
                '    logo\n' +
                '    address\n' +
                '    users(orderBy: $usersOrderBy, take: $usersTake, where: $usersWhere) {\n' +
                '      user {\n' +
                '        email\n' +
                '        displayName\n' +
                '      }\n' +
                '      role {\n' +
                '        role\n' +
                '      }\n' +
                '    }\n' +
                '    talents {\n' +
                '      createdAt\n' +
                '      talentProfile {\n' +
                '        id\n' +
                '        profileName\n' +
                '        totalExperience\n' +
                '      }\n' +
                '    }\n' +
                '    verificationStatus\n' +
                '    createdAt\n' +
                '    country\n' +
                '    logo\n' +
                '    website\n' +
                '    description\n' +
                '    industry\n' +
                '    size\n' +
                '  }\n' +
                '}',
            'query FindCompany(\n' +
                '  $where: CompanyWhereUniqueInput!\n' +
                '  $orderTalentsBy: [CompanyTalentRosterOrderByWithRelationInput!]\n' +
                ') {\n' +
                '  data: findAdminCompany(where: $where) {\n' +
                '    id\n' +
                '    name\n' +
                '    address\n' +
                '    verificationStatus\n' +
                '    createdAt\n' +
                '    country\n' +
                '    logo\n' +
                '    website\n' +
                '    description\n' +
                '    industry\n' +
                '    size\n' +
                '    accountingCurrency\n' +
                '    jobDescriptions {\n' +
                '      title\n' +
                '      jobAssignments {\n' +
                '        createdAt\n' +
                '        clientCompany {\n' +
                '          name\n' +
                '        }\n' +
                '        id\n' +
                '        jobDescription {\n' +
                '          title\n' +
                '          description\n' +
                '        }\n' +
                '        salesCompany {\n' +
                '          name\n' +
                '        }\n' +
                '        startDate\n' +
                '        endDate\n' +
                '        talentNote\n' +
                '        talentProfile {\n' +
                '          id\n' +
                '          profileName\n' +
                '          location\n' +
                '        }\n' +
                '      }\n' +
                '    }\n' +
                '    talents(orderBy: $orderTalentsBy) {\n' +
                '      id\n' +
                '      employeeNumber\n' +
                '      employmentType\n' +
                '      talentProfile {\n' +
                '        id\n' +
                '        profileName\n' +
                '        location\n' +
                '      }\n' +
                '    }\n' +
                '    users {\n' +
                '      role {\n' +
                '        role\n' +
                '      }\n' +
                '      user {\n' +
                '        id\n' +
                '        email\n' +
                '        displayName\n' +
                '        createdAt\n' +
                '      }\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindAdminTalentProfile($where: TalentProfileWhereUniqueInput!) {\n' +
                '  data: findAdminTalentProfile(where: $where) {\n' +
                '    id\n' +
                '    isVisible\n' +
                '    profileName\n' +
                '    description\n' +
                '    education\n' +
                '    email\n' +
                '    experience\n' +
                '    isAvailableForHire\n' +
                '    availabilityMode\n' +
                '    isInterestedInRelocation\n' +
                '    interestedToRelocateTo\n' +
                '    jobTitle\n' +
                '    languages\n' +
                '    links\n' +
                '    location\n' +
                '    profilePicture\n' +
                '    skills\n' +
                '    totalExperience\n' +
                '    monthlyRate\n' +
                '    hourlyRate\n' +
                '    rateCurrency\n' +
                '    createdAt\n' +
                '    verificationStatus\n' +
                '    workMode\n' +
                '    cv\n' +
                '    appliedTo {\n' +
                '      id\n' +
                '      jobAd {\n' +
                '        title\n' +
                '        id\n' +
                '        location\n' +
                '        publishedAt\n' +
                '      }\n' +
                '      jobDescription {\n' +
                '        title\n' +
                '        id\n' +
                '        location\n' +
                '        createdAt\n' +
                '        clientCompany {\n' +
                '          name\n' +
                '        }\n' +
                '      }\n' +
                '      createdAt\n' +
                '    }\n' +
                '    resourceOfCompanyTalentRoster {\n' +
                '      company {\n' +
                '        id\n' +
                '        name\n' +
                '      }\n' +
                '      employeeNumber\n' +
                '      employmentType\n' +
                '    }\n' +
                '    invitationsFor {\n' +
                '      id\n' +
                '      company {\n' +
                '        name\n' +
                '      }\n' +
                '      jobAd {\n' +
                '        title\n' +
                '        location\n' +
                '      }\n' +
                '      jobDescription {\n' +
                '        title\n' +
                '        location\n' +
                '      }\n' +
                '      createdAt\n' +
                '    }\n' +
                '    jobAssignments {\n' +
                '      createdAt\n' +
                '      clientCompany {\n' +
                '        name\n' +
                '      }\n' +
                '      id\n' +
                '      jobDescription {\n' +
                '        title\n' +
                '        description\n' +
                '      }\n' +
                '      salesCompany {\n' +
                '        name\n' +
                '      }\n' +
                '      startDate\n' +
                '      endDate\n' +
                '      talentNote\n' +
                '    }\n' +
                '    _count {\n' +
                '      appliedTo\n' +
                '      invitationsFor\n' +
                '      jobAssignments\n' +
                '      resourceOfCompanyTalentRoster\n' +
                '      talentBillings\n' +
                '    }\n' +
                '    user {\n' +
                '      email\n' +
                '      phoneNumber\n' +
                '      lastVisit\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindAdminTalentProfiles(\n' +
                '  $skip: Int\n' +
                '  $take: Int\n' +
                '  $where: TalentProfileWhereInput!\n' +
                '  $orderBy: [TalentProfileOrderByWithRelationInput!]\n' +
                '  $appliedToTake: Int\n' +
                '  $appliedToOrderBy: [TalentJobApplicationOrderByWithRelationInput!]\n' +
                '  $invitationsForTake: Int\n' +
                '  $invitationsForOrderBy: [TalentInvitationOrderByWithRelationInput!]\n' +
                '  $jobAssignmentsTake: Int\n' +
                '  $jobAssignmentsOrderBy: [JobAssignmentOrderByWithRelationInput!]\n' +
                '  $jobAssignmentsWhere: JobAssignmentWhereInput\n' +
                ') {\n' +
                '  data: findAdminTalentProfilesPaginated(\n' +
                '    skip: $skip\n' +
                '    take: $take\n' +
                '    where: $where\n' +
                '    orderBy: $orderBy\n' +
                '  ) {\n' +
                '    profiles {\n' +
                '      id\n' +
                '      profileName\n' +
                '      description\n' +
                '      education\n' +
                '      experience\n' +
                '      isAvailableForHire\n' +
                '      isInterestedInRelocation\n' +
                '      jobTitle\n' +
                '      languages\n' +
                '      links\n' +
                '      location\n' +
                '      profilePicture\n' +
                '      skills\n' +
                '      totalExperience\n' +
                '      monthlyRate\n' +
                '      hourlyRate\n' +
                '      rateCurrency\n' +
                '      createdAt\n' +
                '      verificationStatus\n' +
                '      email\n' +
                '      appliedTo(take: $appliedToTake, orderBy: $appliedToOrderBy) {\n' +
                '        id\n' +
                '        jobAd {\n' +
                '          title\n' +
                '          id\n' +
                '          location\n' +
                '          publishedAt\n' +
                '        }\n' +
                '        jobDescription {\n' +
                '          title\n' +
                '          id\n' +
                '          location\n' +
                '          createdAt\n' +
                '          clientCompany {\n' +
                '            name\n' +
                '          }\n' +
                '        }\n' +
                '        createdAt\n' +
                '      }\n' +
                '      invitationsFor(take: $invitationsForTake, orderBy: $invitationsForOrderBy) {\n' +
                '        id\n' +
                '        company {\n' +
                '          name\n' +
                '        }\n' +
                '        jobAd {\n' +
                '          title\n' +
                '          location\n' +
                '        }\n' +
                '        jobDescription {\n' +
                '          title\n' +
                '          location\n' +
                '        }\n' +
                '        createdAt\n' +
                '      }\n' +
                '      jobAssignments(\n' +
                '        take: $jobAssignmentsTake\n' +
                '        orderBy: $jobAssignmentsOrderBy\n' +
                '        where: $jobAssignmentsWhere\n' +
                '      ) {\n' +
                '        createdAt\n' +
                '        clientCompany {\n' +
                '          name\n' +
                '        }\n' +
                '        id\n' +
                '        jobDescription {\n' +
                '          title\n' +
                '        }\n' +
                '        salesCompany {\n' +
                '          name\n' +
                '        }\n' +
                '        startDate\n' +
                '        endDate\n' +
                '      }\n' +
                '      _count {\n' +
                '        appliedTo\n' +
                '        invitationsFor\n' +
                '        jobAssignments\n' +
                '        resourceOfCompanyTalentRoster\n' +
                '        talentBillings\n' +
                '      }\n' +
                '      user {\n' +
                '        email\n' +
                '        phoneNumber\n' +
                '        lastVisit\n' +
                '      }\n' +
                '    }\n' +
                '    total\n' +
                '  }\n' +
                '}',
            'query FindCompanyAssignment($where: JobAssignmentWhereInput) {\n' +
                '  data: findJobAssignments(where: $where) {\n' +
                '    id\n' +
                '    startDate\n' +
                '    endDate\n' +
                '    assignmentCurrency\n' +
                '    talentNote\n' +
                '    jobDescription {\n' +
                '      id\n' +
                '      title\n' +
                '      description\n' +
                '    }\n' +
                '    talentProfile {\n' +
                '      id\n' +
                '      profileName\n' +
                '      location\n' +
                '    }\n' +
                '    providerCompany {\n' +
                '      id\n' +
                '      name\n' +
                '    }\n' +
                '    salesCompany {\n' +
                '      id\n' +
                '      name\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindCompanyAssignments(\n' +
                '  $where: JobAssignmentWhereInput\n' +
                '  $take: Int\n' +
                '  $orderBy: [JobAssignmentOrderByWithRelationInput!]\n' +
                ') {\n' +
                '  data: findJobAssignments(where: $where, take: $take, orderBy: $orderBy) {\n' +
                '    id\n' +
                '    jobDescription {\n' +
                '      title\n' +
                '    }\n' +
                '    talentProfile {\n' +
                '      profileName\n' +
                '      location\n' +
                '    }\n' +
                '    providerCompany {\n' +
                '      name\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindCompanies {\n  data: findCompanies {\n    id\n    name\n  }\n}',
            'query FindCompanyMembers($where: CompanyWhereUniqueInput!) {\n' +
                '  data: findCompany(where: $where) {\n' +
                '    users {\n' +
                '      user {\n' +
                '        id\n' +
                '        displayName\n' +
                '        email\n' +
                '        createdAt\n' +
                '      }\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query CompanyRoles($where: CompanyRoleWhereInput) {\n' +
                '  companyRoles(where: $where) {\n' +
                '    role\n' +
                '    id\n' +
                '    companyId\n' +
                '    company {\n' +
                '      name\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindUser($where: UserWhereUniqueInput!) {\n' +
                '  findUser(where: $where) {\n' +
                '    displayName\n' +
                '    email\n' +
                '    phoneNumber\n' +
                '    profile {\n' +
                '      id\n' +
                '      description\n' +
                '      education\n' +
                '      experience\n' +
                '      isAvailableForHire\n' +
                '      isInterestedInRelocation\n' +
                '      jobTitle\n' +
                '      languages\n' +
                '      location\n' +
                '      links\n' +
                '      profileName\n' +
                '      profilePicture\n' +
                '      skills\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query groupByLocationsTalentProfiles(\n' +
                '  $by: [TalentProfileScalarFieldEnum!]!\n' +
                '  $orderBy: [TalentProfileOrderByWithAggregationInput!]\n' +
                ') {\n' +
                '  data: groupByTalentProfiles(by: $by, orderBy: $orderBy) {\n' +
                '    location\n' +
                '    _count {\n' +
                '      location\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindPublicJobAd($where: JobAdWhereInput!) {\n' +
                '  data: findFirstJobAd(where: $where) {\n' +
                '    id\n' +
                '    title\n' +
                '    description\n' +
                '    location\n' +
                '    createdAt\n' +
                '    updatedAt\n' +
                '    publishedAt\n' +
                '    publishedUntil\n' +
                '    skills\n' +
                '    employmentType\n' +
                '  }\n' +
                '}',
            'query FindJobAds($where: CompanyWhereUniqueInput!) {\n' +
                '  data: findCompany(where: $where) {\n' +
                '    jobDescriptions {\n' +
                '      jobAds {\n' +
                '        id\n' +
                '        title\n' +
                '        employmentType\n' +
                '        location\n' +
                '      }\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindCompanyJobDescription($where: JobDescriptionWhereInput) {\n' +
                '  data: findJobDescriptions(where: $where) {\n' +
                '    id\n' +
                '    title\n' +
                '    description\n' +
                '    skills\n' +
                '    location\n' +
                '    workMode\n' +
                '    assignmentType\n' +
                '    salary\n' +
                '    currency\n' +
                '    language\n' +
                '    openForApplications\n' +
                '    jobAssignments {\n' +
                '      id\n' +
                '      jobDescription {\n' +
                '        title\n' +
                '        location\n' +
                '      }\n' +
                '      talentProfile {\n' +
                '        profileName\n' +
                '      }\n' +
                '      salesCompany {\n' +
                '        name\n' +
                '      }\n' +
                '    }\n' +
                '    applications {\n' +
                '      id\n' +
                '      createdAt\n' +
                '      talentProfile {\n' +
                '        profileName\n' +
                '        jobTitle\n' +
                '        location\n' +
                '      }\n' +
                '    }\n' +
                '    jobAds {\n' +
                '      id\n' +
                '      title\n' +
                '      location\n' +
                '      publishedAt\n' +
                '    }\n' +
                '    invitations {\n' +
                '      id\n' +
                '      createdAt\n' +
                '      talentProfile {\n' +
                '        profileName\n' +
                '        jobTitle\n' +
                '        location\n' +
                '      }\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindCompanyJobDescriptions(\n' +
                '  $where: JobDescriptionWhereInput\n' +
                '  $take: Int\n' +
                '  $orderBy: [JobDescriptionOrderByWithRelationInput!]\n' +
                ') {\n' +
                '  data: findJobDescriptions(where: $where, take: $take, orderBy: $orderBy) {\n' +
                '    id\n' +
                '    title\n' +
                '    _count {\n' +
                '      applications\n' +
                '      jobAds\n' +
                '      jobAssignments\n' +
                '      invitations\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query LanguagesLists($orderBy: [LanguagesListOrderByWithRelationInput!]) {\n' +
                '  data: languagesLists(orderBy: $orderBy) {\n' +
                '    id\n' +
                '    label\n' +
                '  }\n' +
                '}',
            'query FindCompanyTalentRosters(\n' +
                '  $where: CompanyTalentRosterWhereInput\n' +
                '  $take: Int\n' +
                '  $orderBy: [CompanyTalentRosterOrderByWithRelationInput!]\n' +
                '  $distinct: [CompanyTalentRosterScalarFieldEnum!]\n' +
                ') {\n' +
                '  data: findCompanyTalentRosters(\n' +
                '    where: $where\n' +
                '    take: $take\n' +
                '    orderBy: $orderBy\n' +
                '    distinct: $distinct\n' +
                '  ) {\n' +
                '    id\n' +
                '    employmentType\n' +
                '    talentProfile {\n' +
                '      userId\n' +
                '      id\n' +
                '      profileName\n' +
                '      jobTitle\n' +
                '      location\n' +
                '      monthlyRate\n' +
                '      rateCurrency\n' +
                '      hourlyRate\n' +
                '    }\n' +
                '    company {\n' +
                '      id\n' +
                '      name\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindCompanyTalentRosterDetails($where: CompanyTalentRosterWhereInput) {\n' +
                '  data: findCompanyTalentRosters(where: $where) {\n' +
                '    id\n' +
                '    employmentType\n' +
                '    talentProfile {\n' +
                '      id\n' +
                '      userId\n' +
                '      profileName\n' +
                '      location\n' +
                '      rateCurrency\n' +
                '      monthlyRate\n' +
                '      hourlyRate\n' +
                '      jobAssignments {\n' +
                '        id\n' +
                '        assignmentCurrency\n' +
                '        clientCompany {\n' +
                '          name\n' +
                '        }\n' +
                '        salesCompany {\n' +
                '          name\n' +
                '        }\n' +
                '        jobDescription {\n' +
                '          title\n' +
                '        }\n' +
                '      }\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query SkillsLists {\n  data: skillsLists {\n    label\n    id\n  }\n}',
            'query FindTalentAssignment($where: JobAssignmentWhereInput) {\n' +
                '  data: findJobAssignments(where: $where) {\n' +
                '    id\n' +
                '    endDate\n' +
                '    startDate\n' +
                '    talentNote\n' +
                '    jobDescription {\n' +
                '      id\n' +
                '      description\n' +
                '      title\n' +
                '    }\n' +
                '    clientCompany {\n' +
                '      id\n' +
                '      name\n' +
                '      logo\n' +
                '    }\n' +
                '    providerCompany {\n' +
                '      id\n' +
                '      name\n' +
                '      logo\n' +
                '    }\n' +
                '    salesCompany {\n' +
                '      id\n' +
                '      name\n' +
                '      logo\n' +
                '    }\n' +
                '    talentProfile {\n' +
                '      id\n' +
                '      profileName\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindTalentAssignments($take: Int) {\n' +
                '  data: findMe {\n' +
                '    profile {\n' +
                '      jobAssignments(take: $take) {\n' +
                '        id\n' +
                '        startDate\n' +
                '        endDate\n' +
                '        jobDescription {\n' +
                '          title\n' +
                '        }\n' +
                '        clientCompany {\n' +
                '          name\n' +
                '        }\n' +
                '        providerCompany {\n' +
                '          name\n' +
                '        }\n' +
                '        salesCompany {\n' +
                '          name\n' +
                '        }\n' +
                '      }\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindTalentCompany(\n' +
                '  $where: CompanyWhereUniqueInput!\n' +
                '  $talentsWhere2: CompanyTalentRosterWhereInput\n' +
                '  $jobAssignmentsWhere2: JobAssignmentWhereInput\n' +
                ') {\n' +
                '  data: findCompany(where: $where) {\n' +
                '    name\n' +
                '    talents(where: $talentsWhere2) {\n' +
                '      employmentType\n' +
                '      currency\n' +
                '      balance\n' +
                '      talentProfile {\n' +
                '        id\n' +
                '        jobAssignments(where: $jobAssignmentsWhere2) {\n' +
                '          id\n' +
                '          endDate\n' +
                '          startDate\n' +
                '          jobDescription {\n' +
                '            title\n' +
                '          }\n' +
                '          clientCompany {\n' +
                '            name\n' +
                '          }\n' +
                '\n' +
                '          salesCompany {\n' +
                '            name\n' +
                '          }\n' +
                '        }\n' +
                '      }\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindTalentInvitations {\n' +
                '  data: findMe {\n' +
                '    profile {\n' +
                '      invitationsFor {\n' +
                '        jobAd {\n' +
                '          title\n' +
                '          location\n' +
                '          jobDescription {\n' +
                '            title\n' +
                '            clientCompany {\n' +
                '              name\n' +
                '            }\n' +
                '          }\n' +
                '        }\n' +
                '        createdAt\n' +
                '        id\n' +
                '      }\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindTalentProfile($where: TalentProfileWhereUniqueInput!) {\n' +
                '  data: findTalentProfile(where: $where) {\n' +
                '    id\n' +
                '    profileName\n' +
                '    description\n' +
                '    education\n' +
                '    email\n' +
                '    experience\n' +
                '    isAvailableForHire\n' +
                '    isInterestedInRelocation\n' +
                '    jobTitle\n' +
                '    languages\n' +
                '    links\n' +
                '    location\n' +
                '    profilePicture\n' +
                '    skills\n' +
                '    totalExperience\n' +
                '    monthlyRate\n' +
                '    hourlyRate\n' +
                '    rateCurrency\n' +
                '    verificationStatus\n' +
                '    deletedAt\n' +
                '    user {\n' +
                '      email\n' +
                '      phoneNumber\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindTalentProfiles($args: FindManyTalentProfileArgs!) {\n' +
                '  data: findTalentProfiles(args: $args) {\n' +
                '    id\n' +
                '    profileName\n' +
                '    description\n' +
                '    education\n' +
                '    experience\n' +
                '    isAvailableForHire\n' +
                '    isInterestedInRelocation\n' +
                '    jobTitle\n' +
                '    languages\n' +
                '    links\n' +
                '    location\n' +
                '    profilePicture\n' +
                '    skills\n' +
                '    totalExperience\n' +
                '    monthlyRate\n' +
                '    hourlyRate\n' +
                '    rateCurrency\n' +
                '    verificationStatus\n' +
                '    deletedAt\n' +
                '    user {\n' +
                '      email\n' +
                '      phoneNumber\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindTalentProviders($take: Int) {\n' +
                '  data: findMe {\n' +
                '    profile {\n' +
                '      resourceOfCompanyTalentRoster(take: $take) {\n' +
                '        id\n' +
                '        employmentType\n' +
                '        company {\n' +
                '          id\n' +
                '          name\n' +
                '        }\n' +
                '        currency\n' +
                '        balance\n' +
                '      }\n' +
                '    }\n' +
                '  }\n' +
                '}',
            'query FindUsers($where: UserWhereInput, $take: Int) {\n' +
                '  data: findUsers(where: $where, take: $take) {\n' +
                '    id\n' +
                '    email\n' +
                '    externalId\n' +
                '    displayName\n' +
                '    profile {\n' +
                '      id\n' +
                '      userId\n' +
                '      jobTitle\n' +
                '      profileName\n' +
                '      profilePicture\n' +
                '      isAvailableForHire\n' +
                '      location\n' +
                '      rateCurrency\n' +
                '      skills\n' +
                '      totalExperience\n' +
                '      description\n' +
                '      experience\n' +
                '      education\n' +
                '    }\n' +
                '  }\n' +
                '}',
        ];
        const expected = `query FindUser($where: CompanyOnUserWhereInput) {
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
      }
    }
    profile {
      id
      userId
      jobTitle
      profileName
      profilePicture
      isAvailableForHire
      isInterestedInRelocation
      interestedToRelocateTo
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
      isVisible
      workMode
      availabilityMode
    }
  }
}`;
        expect((0, merge_1.mergeQueries)(requestQuery, allowedQueries)).toBe(expected);
    });
});
