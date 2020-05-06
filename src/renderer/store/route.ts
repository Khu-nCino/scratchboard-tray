import { Action } from "redux";

type RouteActions = PushRouteAction | PopRouteAction;

interface PushRouteAction extends Action<"PUSH_ROUTE_ACTION"> {
  payload: {
    name: RouteName;
  };
}

interface PopRouteAction extends Action<"POP_ROUTE_ACTION"> {}

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

// State
export type RouteName = "orgs" | "settings" | "login";

export interface RouteState {
  activeRoute: RouteName;
}

const defaultRouteState: RouteState = {
  activeRoute: "orgs",
};

export function routeReducer(
  state: RouteState = defaultRouteState,
  action: RouteActions
): RouteState {
  switch (action.type) {
    case "PUSH_ROUTE_ACTION": {
      return { activeRoute: action.payload.name };
    }
    case "POP_ROUTE_ACTION": {
      return defaultRouteState;
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
