import {
  createStore as createReduxStore,
  combineReducers,
  applyMiddleware,
  DeepPartial
} from "redux";

import promiseMiddleware from "redux-promise-middleware";
import { orgsReducer } from "./orgs";
import { orgSettingsReducer } from "./orgSettings";
import { routeReducer } from "./route"

type Reducers = typeof reducers;
export type State = {
  [P in keyof Reducers]: ReturnType<Reducers[P]>
}

const reducers = {
  orgs: orgsReducer,
  orgSettings: orgSettingsReducer,
  route: routeReducer
}

const initialState: DeepPartial<State> = {
  route: {
    name: "orgList"
  }
}

export function createStore() {
  return createReduxStore(
    combineReducers<State>(reducers),
    initialState,
    applyMiddleware(promiseMiddleware)
  );
}
