import { Action } from "redux";

type RouteActions = PushRouteAction | PopRouteAction | SetNavigationEnabledAction;

interface PushRouteAction extends Action<"PUSH_ROUTE_ACTION"> {
  payload: {
    name: RouteName;
  };
}

interface PopRouteAction extends Action<"POP_ROUTE_ACTION"> {}

interface SetNavigationEnabledAction extends Action<"SET_NAVIGATION_ENABLED_ACTION"> {
  payload: {
    value: boolean;
  };
}

export function pushRouteAction(name: RouteName): PushRouteAction {
  return {
    type: "PUSH_ROUTE_ACTION",
    payload: {
      name,
    },
  };
}

export function popRouteAction(): PopRouteAction {
  return { type: "POP_ROUTE_ACTION" };
}

export function setNavigationEnabledAction(value: boolean): SetNavigationEnabledAction {
  return {
    type: "SET_NAVIGATION_ENABLED_ACTION",
    payload: {
      value,
    },
  };
}

// State
export type RouteName = "orgs" | "settings" | "login" | "frontdoor";

export interface RouteState {
  activeRoute: RouteName;
  navigationEnabled: boolean;
}

const defaultRouteState: RouteState = {
  activeRoute: "orgs",
  navigationEnabled: true,
};

export function routeReducer(
  state: RouteState = defaultRouteState,
  action: RouteActions
): RouteState {
  switch (action.type) {
    case "PUSH_ROUTE_ACTION": {
      return { ...state, activeRoute: action.payload.name };
    }
    case "POP_ROUTE_ACTION": {
      return defaultRouteState;
    }
    case "SET_NAVIGATION_ENABLED_ACTION": {
      return { ...state, navigationEnabled: action.payload.value };
    }
    default: {
      return state;
    }
  }
}

// Selectors
export function selectActiveRoute(state: RouteState) {
  return state.activeRoute;
}
