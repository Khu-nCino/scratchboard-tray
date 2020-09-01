import {
  createStore as createReduxStore,
  combineReducers,
  applyMiddleware,
  AnyAction,
  DeepPartial,
  compose,
  StateFromReducersMapObject,
  ActionFromReducersMapObject,
} from "redux";

import thunk, { ThunkAction, ThunkMiddleware } from "redux-thunk";
import { orgsReducer } from "./orgs";
import { routeReducer } from "./route";
import { settingsReducer, defaultSettingsState } from "./settings";
import { messagesReducer } from "./messages";
import { updateReducer, defaultUpdateState } from "./updates";
import { expandedReducer, defaultExpandedState } from "./expanded";
import { packagesReducer } from "./packages/reducers";
import { defaultPackagesState } from "./packages/state";

export type ScratchBoardStore = ReturnType<typeof createStore>;
export type ScratchBoardState = StateFromReducersMapObject<typeof reducers>;
export type ScratchBoardThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  ScratchBoardState,
  unknown,
  ActionFromReducersMapObject<typeof reducers>
>;

const reducers = {
  orgs: orgsReducer,
  route: routeReducer,
  settings: settingsReducer,
  messages: messagesReducer,
  updates: updateReducer,
  expanded: expandedReducer,
  packages: packagesReducer,
};

export const defaultState: Partial<ScratchBoardState> = {
  expanded: defaultExpandedState,
  updates: defaultUpdateState,
  settings: defaultSettingsState,
  packages: defaultPackagesState,
};

// redux devtools setup
const devToolsCompose: typeof compose | undefined = (window as any)
  .__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

export function createStore(initial: DeepPartial<ScratchBoardState>) {
  const rootReducer = combineReducers(reducers);
  const composeEnhancers =
    typeof window === "object" && devToolsCompose ? devToolsCompose : compose;

  return createReduxStore(
    rootReducer,
    initial as ScratchBoardState,
    composeEnhancers(applyMiddleware(thunk as ThunkMiddleware<ScratchBoardState, AnyAction>))
  );
}
