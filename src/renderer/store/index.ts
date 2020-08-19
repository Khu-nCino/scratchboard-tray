import {
  createStore as createReduxStore,
  combineReducers,
  applyMiddleware,
  AnyAction,
  DeepPartial,
  compose,
  StateFromReducersMapObject,
} from "redux";

import thunk, { ThunkMiddleware } from "redux-thunk";
import { orgsReducer } from "./orgs";
import { routeReducer } from "./route";
import { settingsReducer, defaultSettingsState } from "./settings";
import { messagesReducer } from "./messages";
import { updateReducer, defaultUpdateState } from "./updates";
import { expandedReducer, defaultExpandedState } from "./expanded";
import { packagesReducer } from "./packages/reducers";
import { defaultPackagesState } from "./packages/state";

export type State = StateFromReducersMapObject<typeof reducers>;

const reducers = {
  orgs: orgsReducer,
  route: routeReducer,
  settings: settingsReducer,
  messages: messagesReducer,
  updates: updateReducer,
  expanded: expandedReducer,
  packages: packagesReducer,
};

export const defaultState: Partial<State> = {
  expanded: defaultExpandedState,
  updates: defaultUpdateState,
  settings: defaultSettingsState,
  packages: defaultPackagesState,
};

// redux devtools setup
const devToolsCompose: typeof compose | undefined = (window as any)
  .__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

export function createStore(initial: DeepPartial<State>) {
  const rootReducer = combineReducers(reducers);
  const composeEnhancers =
    typeof window === "object" && devToolsCompose ? devToolsCompose : compose;

  return createReduxStore(
    rootReducer,
    initial as State,
    composeEnhancers(applyMiddleware(thunk as ThunkMiddleware<State, AnyAction>))
  );
}
