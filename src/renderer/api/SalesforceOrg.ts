export type SalesforceOrg = SharedOrg | ScratchOrg;

export interface BaseOrg {
  username: string;
  orgId: string;
  accessToken: string;
  instanceUrl: string;
  alias?: string;
  isDevHub: boolean;
}

export interface SharedOrg extends BaseOrg {
  isScratchOrg: false;
}

export interface ScratchOrg extends BaseOrg {
  isScratchOrg: true;
  devHubUsername: string;
  expirationDate: string;
}
