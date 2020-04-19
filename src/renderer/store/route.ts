import { Action } from "redux";

type RouteActions =
  | ViewOrgListAction
  | ViewSettingsAction
  | ViewDependenciesAction;

interface ViewOrgListAction extends Action<"CHANGE_ROUTE_ORGS"> {}
interface ViewSettingsAction extends Action<"CHANGE_ROUTE_SETTINGS"> {}

interface ViewDependenciesAction extends Action<"CHANGE_ROUTE_DEPENDENCIES"> {
  payload: {
    orgUsername: string;
  };
}

export function viewOrgList(): ViewOrgListAction {
  return {
    type: "CHANGE_ROUTE_ORGS",
  };
}

export function viewSettings(): ViewSettingsAction {
  return {
    type: "CHANGE_ROUTE_SETTINGS",
  };
}

export function viewDependencies(orgUsername: string): ViewDependenciesAction {
  return {
    type: "CHANGE_ROUTE_DEPENDENCIES",
    payload: {
      orgUsername,
    },
  };
}

// State
export type RouteName = "orgs" | "settings" | "dependencies";

export interface RouteState {
  name: RouteName;
  orgUsername?: string;
}

export function routeReducer(
  state: RouteState = { name: "orgs" },
  action: RouteActions
): RouteState {
  switch (action.type) {
    case "CHANGE_ROUTE_ORGS": {
      return { name: "orgs" };
    }
    case "CHANGE_ROUTE_SETTINGS": {
      return { name: "settings" };
    }
    case "CHANGE_ROUTE_DEPENDENCIES": {
      return {
        name: "dependencies",
        orgUsername: action.payload.orgUsername,
      };
    }
    default: {
      return state;
    }
  }
}
