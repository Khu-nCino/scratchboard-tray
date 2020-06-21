import { clipboard, shell } from "electron";
import { Action } from "redux";
import { ThunkAction } from "redux-thunk";

import { SalesforceOrg, BaseOrg, ScratchOrg, SharedOrg } from "renderer/api/SalesforceOrg";
import { orgManager } from "renderer/api/core/OrgManager";
import {
  packageManager,
  InstalledPackageVersion,
  InstallablePackageVersion,
} from "renderer/api/core/PackageManager";
import { MessagesAction, createToast, createErrorToast } from "./messages";
import { State } from ".";

type ThunkResult<R> = ThunkAction<R, State, undefined, OrgAction | MessagesAction>;

// Actions
type OrgAction =
  | OrgListChanges
  | AliasSetAction
  | SetPendingAction
  | SetPackageLoadStatusAction
  | InstalledPackagesLoadedAction
  | AvailableVersionsLoadedAction;

interface OrgListChanges extends Action<"ORG_LIST_CHANGES"> {
  payload: {
    changed: SalesforceOrg[];
    removed: string[];
  };
}

interface AliasSetAction extends Action<"ALIAS_SET_ACTION"> {
  payload: {
    username: string;
    alias: string;
  };
}

interface SetPendingAction extends Action<"SET_PENDING_ACTION"> {
  payload: {
    username: string;
    pendingAction: boolean;
  };
}

interface SetPackageLoadStatusAction extends Action<"SET_PENDING_PACKAGE_LOAD"> {
  payload: {
    username: string;
    status: PackageLoadStatus;
  };
}

interface InstalledPackagesLoadedAction extends Action<"INSTALLED_PACKAGES_LOADED_ACTION"> {
  payload: {
    username: string;
    installed: InstalledPackageVersion[];
  };
}

interface AvailableVersionsLoadedAction extends Action<"AVAILABLE_VERSIONS_LOADED_ACTION"> {
  payload: {
    username: string;
    available: InstallablePackageVersion[];
  };
}

export function orgListChanged(changed: SalesforceOrg[], removed: string[]): OrgListChanges {
  return {
    type: "ORG_LIST_CHANGES",
    payload: {
      changed,
      removed,
    },
  };
}

export function openOrgAction(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));
      shell.openExternal(await orgManager.getFrontDoor(username));
    } catch (error) {
      dispatch(createErrorToast("There was an error opening your org 😞", error));
    } finally {
      dispatch(setPendingAction(username, false));
    }
  };
}

export function copyFrontDoor(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));

      const url = await orgManager.getFrontDoor(username);
      clipboard.writeText(url, "clipboard");
      dispatch(createToast("The front door is copied to your clipboard.", "success"));
    } catch (error) {
      dispatch(createErrorToast("There was an error copying your front door 😞", error));
    } finally {
      dispatch(setPendingAction(username, false));
    }
  };
}

export function logoutOrgAction(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));

      await orgManager.logoutOrg(username);

      dispatch(createToast("Successfully logged out of org.", "success"));
    } catch (error) {
      createErrorToast("There was an error logging out of your org 😞", error);
    } finally {
      dispatch(setPendingAction(username, false));
    }
  };
}

export function deleteOrgAction(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));

      await orgManager.deleteScratchOrg(username);

      dispatch(createToast("Successfully deleted org.", "success"));
    } catch (error) {
      dispatch(createErrorToast("There was an error deleting your org 😞", error));
    }
  };
}

export function setAliasAction(username: string, newAlias: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      await orgManager.setAlias(username, newAlias);

      dispatch({
        type: "ALIAS_SET_ACTION",
        payload: {
          username,
          alias: newAlias,
        },
      });
    } catch (error) {
      dispatch(createErrorToast("There was an error setting your alias 😞", error));
    }
  };
}

export function checkPackageData(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPackageLoadStatusAction(username, "pending"));

      const installed: InstalledPackageVersion[] = await packageManager.getInstalledPackageVersions(
        username
      );
      dispatch(installedPackagesLoadedAction(username, installed));

      const namespaces = installed.map((data) => data.namespace);
      const available: InstallablePackageVersion[] = await packageManager.getLatestAvailablePackageVersions(
        username,
        namespaces
      );
      dispatch(availablePackagesLoadedAction(username, available));
    } catch (error) {
      dispatch(createErrorToast("There was an error loading you package data 😞", error));
    } finally {
      dispatch(setPackageLoadStatusAction(username, "finished"));
    }
  };
}

// Local Actions
function setPendingAction(username: string, pendingAction: boolean): SetPendingAction {
  return {
    type: "SET_PENDING_ACTION",
    payload: {
      username,
      pendingAction,
    },
  };
}

function setPackageLoadStatusAction(
  username: string,
  status: PackageLoadStatus
): SetPackageLoadStatusAction {
  return {
    type: "SET_PENDING_PACKAGE_LOAD",
    payload: {
      username,
      status,
    },
  };
}

function installedPackagesLoadedAction(
  username: string,
  installed: InstalledPackageVersion[]
): InstalledPackagesLoadedAction {
  return {
    type: "INSTALLED_PACKAGES_LOADED_ACTION",
    payload: {
      username,
      installed,
    },
  };
}

function availablePackagesLoadedAction(
  username: string,
  available: InstallablePackageVersion[]
): AvailableVersionsLoadedAction {
  return {
    type: "AVAILABLE_VERSIONS_LOADED_ACTION",
    payload: {
      username,
      available,
    },
  };
}

// State

type PackageLoadStatus = "initial" | "pending" | "finished";

export interface OrgDataState {
  readonly pendingAction: boolean;
  readonly pendingPackageStatus: PackageLoadStatus;
}

export interface OrgPackageData {
  readonly installedVersion: ReadonlyArray<InstalledPackageVersion>;
  readonly availableVersion: ReadonlyArray<InstallablePackageVersion>;
}

export interface OrgData<T extends BaseOrg> {
  readonly description: T;
  readonly state: OrgDataState;
  readonly packages: OrgPackageData;
}

export interface OrgsState {
  readonly orgList: OrgData<SalesforceOrg>[];
}

const defaultOrgsState: OrgsState = {
  orgList: [],
};

const defaultOrgData = {
  state: { pendingAction: false, pendingPackageStatus: "initial" },
  packages: { installedVersion: [], availableVersion: [] },
} as const;

// Reducers
export function orgsReducer(state: OrgsState = defaultOrgsState, action: OrgAction): OrgsState {
  switch (action.type) {
    case "ORG_LIST_CHANGES": {
      const { changed, removed } = action.payload;

      if (changed.length === 0 && removed.length === 0) {
        return state;
      }

      const prevUsernameSet = state.orgList.reduce((acc, org) => {
        acc.add(org.description.username);
        return acc;
      }, new Set<string>());

      const removedUsernameSet = removed.reduce((acc, x) => {
        acc.add(x);
        return acc;
      }, new Set<string>());

      const addedOrgs = changed.reduce<Record<string, SalesforceOrg>>((acc, org) => {
        acc[org.username] = org;
        return acc;
      }, {});

      const carryOver: OrgData<SalesforceOrg>[] = state.orgList
        .filter((org) => !removedUsernameSet.has(org.description.username))
        .map((org) => {
          const username = org.description.username;
          if (username in addedOrgs) {
            return {
              ...org,
              description: addedOrgs[username],
            };
          }
          return org;
        });

      const netNew: OrgData<SalesforceOrg>[] = changed
        .filter((org) => !prevUsernameSet.has(org.username))
        .map((org) => ({
          state: defaultOrgData.state,
          packages: defaultOrgData.packages,
          description: org,
        }));

      return {
        ...state,
        orgList: [...netNew, ...carryOver],
      };
    }
    case "ALIAS_SET_ACTION": {
      const { alias, username } = action.payload;

      const orgList = state.orgList.map((original) => {
        if (original.description.username === username) {
          return {
            ...original,
            description: {
              ...original.description,
              alias,
            },
          };
        }
        if (original.description.alias === alias) {
          return {
            ...original,
            description: {
              ...original.description,
              alias: "",
            },
          };
        }
        return original;
      });

      return {
        ...state,
        orgList,
      };
    }
    case "SET_PENDING_ACTION":
      return {
        ...state,
        orgList: state.orgList.map((org) =>
          org.description.username !== action.payload.username ||
          org.state.pendingAction === action.payload.pendingAction
            ? org
            : {
                ...org,
                state: {
                  ...org.state,
                  pendingAction: action.payload.pendingAction,
                },
              }
        ),
      };
    case "SET_PENDING_PACKAGE_LOAD":
      return {
        ...state,
        orgList: state.orgList.map((org) =>
          org.description.username !== action.payload.username ||
          org.state.pendingPackageStatus === action.payload.status
            ? org
            : {
                ...org,
                state: {
                  ...org.state,
                  pendingPackageLoad: action.payload.status,
                },
              }
        ),
      };
    default:
      return state;
  }
}

// Selectors
export function selectScratchOrgs(
  state: OrgsState,
  showSecondary: boolean = true
): OrgData<ScratchOrg>[] {
  let scratchOrgs = state.orgList.filter(isScratchOrg);
  if (!showSecondary) {
    scratchOrgs = scratchOrgs.filter((org) => !org.description.scratchAdminUsername);
  }

  return scratchOrgs.sort(orgCompare);
}

export function selectSharedOrgs(state: OrgsState): OrgData<SharedOrg>[] {
  return state.orgList.filter(isSharedOrg).sort(orgCompare);
}

export function selectOrgDescriptions(state: OrgsState): SalesforceOrg[] {
  return state.orgList.map(({ description }) => description);
}

function isScratchOrg(org: OrgData<SalesforceOrg>): org is OrgData<ScratchOrg> {
  return org.description.isScratchOrg;
}

function isSharedOrg(org: OrgData<SalesforceOrg>): org is OrgData<SharedOrg> {
  return !org.description.isScratchOrg;
}

function orgCompare(a: OrgData<SalesforceOrg>, b: OrgData<SalesforceOrg>): number {
  return a.description.username.localeCompare(b.description.username);
}
