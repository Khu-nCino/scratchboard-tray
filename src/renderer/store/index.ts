import {
  createStore as createReduxStore,
  combineReducers,
  applyMiddleware,
  AnyAction,
  DeepPartial,
  compose,
} from "redux";

import thunk, { ThunkMiddleware, ThunkDispatch } from "redux-thunk";
import { orgsReducer } from "./orgs";
import { routeReducer } from "./route";
import { settingsReducer, defaultSettingsState } from "./settings";
import { messagesReducer } from "./messages";
import { updateReducer, defaultUpdateState } from "./updates";
import { expandedReducer, defaultExpandedState } from "./expanded";

type Reducers = typeof reducers;
export type State = {
  [P in keyof Reducers]: ReturnType<Reducers[P]>;
};

export type CustomDispatch = ThunkDispatch<State, undefined, AnyAction>;

const reducers = {
  orgs: orgsReducer,
  route: routeReducer,
  settings: settingsReducer,
  messages: messagesReducer,
  updates: updateReducer,
  expanded: expandedReducer,
};

export const defaultState: Partial<State> = {
  expanded: defaultExpandedState,
  updates: defaultUpdateState,
  settings: defaultSettingsState,
};

// redux devtools setup
const devToolsCompose: ((options: any) => typeof compose) | undefined = (window as any)
  .__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

const composeEnhancers =
  typeof window === "object" && devToolsCompose
    ? devToolsCompose({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

export function createStore(initial: DeepPartial<State> = defaultState) {
  return createReduxStore(
    combineReducers<State>(reducers),
    initial as State,
    composeEnhancers(applyMiddleware(thunk as ThunkMiddleware<State, AnyAction>))
  );
}
