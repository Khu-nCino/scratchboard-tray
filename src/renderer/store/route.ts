import { Action } from "redux";

type RouteActions =
  | ViewOrgListAction
  | ViewSettingsAction
  | ViewDependenciesAction;

interface ViewOrgListAction extends Action<"orgList"> {}
interface ViewSettingsAction extends Action<"settings"> {}

interface ViewDependenciesAction extends Action<"dependencies"> {
  payload: {
    orgUsername: string;
  };
}

export function viewOrgList(): ViewOrgListAction {
  return {
    type: "orgList"
  };
}

export function viewSettings(): ViewSettingsAction {
  return {
    type: "settings"
  };
}

export function viewDependencies(orgUsername: string): ViewDependenciesAction {
  return {
    type: "dependencies",
    payload: {
      orgUsername
    }
  };
}

// State
export type RouteName = "orgList" | "settings" | "dependencies";

export interface RouteState {
  name: RouteName;
  orgUsername?: string;
}

export function routeReducer(
  state: RouteState = { name: "orgList" },
  action: RouteActions
): RouteState {
  switch (action.type) {
    case "orgList": {
      return { name: "orgList" };
    }
    case "settings": {
      return { name: "settings" };
    }
    case "dependencies": {
      return {
        name: "dependencies",
        orgUsername: action.payload.orgUsername
      };
    }
    default: {
      return state;
    }
  }
}
