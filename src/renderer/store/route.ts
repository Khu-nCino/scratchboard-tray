import { Action } from "redux";

type RouteActions =
  | PushRouteAction
  | PopRouteAction
  | SetNavigationEnabledAction
  | SetIsVisibleAction;

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

interface SetIsVisibleAction extends Action<"SET_IS_VISIBLE_ACTION"> {
  payload: {
    value: boolean;
  };
}

export function pushRoute(name: RouteName): PushRouteAction {
  return {
    type: "PUSH_ROUTE_ACTION",
    payload: {
      name,
    },
  };
}

export function popRoute(): PopRouteAction {
  return { type: "POP_ROUTE_ACTION" };
}

export function setNavigationEnabled(value: boolean): SetNavigationEnabledAction {
  return {
    type: "SET_NAVIGATION_ENABLED_ACTION",
    payload: {
      value,
    },
  };
}

export function setIsVisible(value: boolean): SetIsVisibleAction {
  return {
    type: "SET_IS_VISIBLE_ACTION",
    payload: {
      value,
    },
  };
}

// State
export type RouteName = "orgs" | "settings" | "login" | "frontdoor";

export interface RouteState {
  readonly activeRoute: RouteName;
  readonly navigationEnabled: boolean;
  readonly isVisible: boolean;
}

const defaultRouteState: RouteState = {
  activeRoute: "orgs",
  navigationEnabled: true,
  isVisible: false,
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
      return { ...state, navigationEnabled: true, activeRoute: defaultRouteState.activeRoute };
    }
    case "SET_NAVIGATION_ENABLED_ACTION": {
      return { ...state, navigationEnabled: action.payload.value };
    }
    case "SET_IS_VISIBLE_ACTION": {
      return { ...state, isVisible: action.payload.value };
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
