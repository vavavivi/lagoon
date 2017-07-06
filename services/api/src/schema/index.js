// @flow

import { makeExecutableSchema } from 'graphql-tools';
import { getContext } from '../app';
import type { Slack } from '../types';
import type { ClientView, SiteGroupView, SiteView } from '../selectors';

const typeDefs = `
  type SiteGroup {
    siteGroupName: String
    gitUrl: String
    slack: Slack
    client: Client
    sshKeys: [SshKey]
    sites: [Site]
  }

  type Cron {
    type: String
    minute: String
  }

  type Site {
    id: String
    siteBranch: String
    uid: String
    siteHost: String
    siteName: String
    fileName: String
    siteEnvironment: String
    serverInfrastructure: String
    siteEnvironment: String,
    serverIdentifier: String
    serverNames: [String]
    webRoot: String
    SSLCertificateType: String
    cron: Cron
    solrEnabled: Boolean
  }

  type Client {
    clientName: String
    deployPrivateKey: String
    created:String
    comment: String
    siteGroups: [SiteGroup]
    sshKeys: [SshKey]
  }

  type SshKey {
    owner: String
    key: String
    type: String
  }

  type Slack {
    webhook: String
    channel: String
    informStart: Boolean
    informChannel: String
  }

  type Query {
    siteGroupByName(name: String!): SiteGroup
    allSiteGroups: [SiteGroup]
    allSites(environmentType: String!): [Site]
    siteByName(name: String!): Site
    allClients: [Client]
  }
`;

const resolvers = {
  Query: {
    siteGroupByName: (_, args, req) => {
      const context = getContext(req);
      const { getState } = context.store;
      const { getSiteGroupByName } = context.selectors;

      return getSiteGroupByName(getState(), args.name);
    },
    allSiteGroups: (_, __, req) => {
      const context = getContext(req);
      const { getState } = context.store;
      const { getAllSiteGroups } = context.selectors;

      return getAllSiteGroups(getState());
    },
    allSites: (_, args, req) => {
      const context = getContext(req);
      const { getState } = context.store;
      const { getAllSitesByEnv } = context.selectors;

      return getAllSitesByEnv(getState(), args.environmentType);
    },
    siteByName: (_, args, req) => {
      const context = getContext(req);
      const { getState } = context.store;
      const { getSiteByName } = context.selectors;

      return getSiteByName(getState(), args.name);
    },
    allClients: (_, __, req) => {
      const context = getContext(req);
      const { getState } = context.store;
      const { getAllClients } = context.selectors;

      return getAllClients(getState());
    },
  },
  Client: {
    siteGroups: (client: ClientView, _, req) => {
      const context = getContext(req);
      const { getState } = context.store;
      const { getSiteGroupsByClient } = context.selectors;

      return getSiteGroupsByClient(getState(), client.clientName);
    },
    sshKeys: (client: ClientView, _, req) => {
      const context = getContext(req);
      const { extractSshKeys } = context.selectors;

      return extractSshKeys(client);
    },
  },
  SiteGroup: {
    client: (siteGroup: SiteGroupView, _, req) => {
      const context = getContext(req);
      const { getState } = context.store;
      const { getClientByName } = context.selectors;

      return getClientByName(getState(), siteGroup.client);
    },
    sites: (siteGroup: SiteGroupView, _, req) => {
      const context = getContext(req);
      const { getState } = context.store;
      const { getAllSitesBySiteGroup } = context.selectors;

      return getAllSitesBySiteGroup(getState(), siteGroup.siteGroupName);
    },
    gitUrl: (siteGroup: SiteGroupView) => siteGroup.git_url,
    sshKeys: (siteGroup: SiteGroupView, _, req) => {
      const context = getContext(req);
      const { extractSshKeys } = context.selectors;

      return extractSshKeys(siteGroup);
    },
  },
  Site: {
    siteBranch: (site: SiteView) => site.site_branch,
    siteEnvironment: (site: SiteView) => site.site_environment,
    webRoot: (site: SiteView) => site.webroot,
    solrEnabled: (site: SiteView) => site.solr_enabled,
    SSLCertificateType: (site: SiteView) => site.sslcerttype,
  },
  Slack: {
    informStart: (slack: Slack) => slack.inform_start,
    informChannel: (slack: Slack) => slack.inform_channel,
  },
};

export default makeExecutableSchema({ typeDefs, resolvers });
