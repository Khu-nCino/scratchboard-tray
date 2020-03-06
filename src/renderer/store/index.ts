import {
  createStore as createReduxStore,
  combineReducers,
  applyMiddleware,
  AnyAction
} from "redux";

import thunk, { ThunkMiddleware } from "redux-thunk";
import { orgsReducer } from "./orgs";
import { orgSettingsReducer } from "./org-settings";
import { routeReducer } from "./route";
import { settingsReducer } from "./settings";
import { jobsReducer } from "./jobs";

type Reducers = typeof reducers;
export type State = {
  [P in keyof Reducers]: ReturnType<Reducers[P]>;
};

const reducers = {
  orgs: orgsReducer,
  orgSettings: orgSettingsReducer,
  route: routeReducer,
  settings: settingsReducer,
  jobs: jobsReducer,
};

export const defaultState: Partial<State> = {
  route: {
    name: "orgList"
  }
};

export function createStore(initial: Partial<State> = defaultState) {
  return createReduxStore(
    combineReducers<State>(reducers),
    initial,
    applyMiddleware(thunk as ThunkMiddleware<State, AnyAction>)
  );
}
