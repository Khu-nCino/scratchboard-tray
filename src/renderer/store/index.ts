import {
  createStore as createReduxStore,
  combineReducers,
  applyMiddleware
} from "redux";

import promiseMiddleware from "redux-promise-middleware";
import { orgsReducer } from "./orgs";
import { orgSettingsReducer } from "./orgSettings";

type Reducers = typeof reducers;
export type State = {
  [P in keyof Reducers]: ReturnType<Reducers[P]>
}

const reducers = {
  orgs: orgsReducer,
  orgSettings: orgSettingsReducer
}

export function createStore() {
  return createReduxStore(
    combineReducers<State>(reducers),
    applyMiddleware(promiseMiddleware)
  );
}
