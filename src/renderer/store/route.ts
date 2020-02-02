type RouteActions =
  | ViewOrgListAction
  | ViewSettingsAction
  | ViewDependenciesAction;

interface ViewOrgListAction {
  type: "orgList";
}

interface ViewSettingsAction {
  type: "settings";
}

interface ViewDependenciesAction {
  type: "dependencies";
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
  _state: RouteState | undefined,
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
      return { name: "orgList" };
    }
  }
}
