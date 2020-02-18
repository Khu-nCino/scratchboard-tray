import {
  createStore as createReduxStore,
  combineReducers,
  applyMiddleware
} from "redux";

import promiseMiddleware from "redux-promise-middleware";
import { orgsReducer } from "./orgs";
import { orgSettingsReducer } from "./org-settings";
import { routeReducer } from "./route";
import { settingsReducer } from "./settings";

type Reducers = typeof reducers;
export type State = {
  [P in keyof Reducers]: ReturnType<Reducers[P]>;
};

const reducers = {
  orgs: orgsReducer,
  orgSettings: orgSettingsReducer,
  route: routeReducer,
  settings: settingsReducer
};

const initialState: Partial<State> = {
  route: {
    name: "orgList"
  }
};

export function createStore() {
  return createReduxStore(
    combineReducers<State>(reducers),
    initialState,
    applyMiddleware(promiseMiddleware)
  );
}
