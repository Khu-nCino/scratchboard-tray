import {
  createStore as createReduxStore,
  combineReducers,
  applyMiddleware,
  AnyAction,
} from "redux";

import thunk, { ThunkMiddleware } from "redux-thunk";
import { orgsReducer } from "./orgs";
import { routeReducer } from "./route";
import { settingsReducer } from "./settings";
import { jobsReducer } from "./jobs";
import { updateReducer } from "./updates";

type Reducers = typeof reducers;
export type State = {
  [P in keyof Reducers]: ReturnType<Reducers[P]>;
};

const reducers = {
  orgs: orgsReducer,
  route: routeReducer,
  settings: settingsReducer,
  jobs: jobsReducer,
  updates: updateReducer,
};

export const defaultState: Partial<State> = {
  route: {
    name: "orgList",
  },
};

export function createStore(initial: Partial<State> = defaultState) {
  return createReduxStore(
    combineReducers<State>(reducers),
    initial,
    applyMiddleware(thunk as ThunkMiddleware<State, AnyAction>)
  );
}
