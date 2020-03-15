import "./index.scss";

import path from "path";
import React from "react";
import ReactDom from "react-dom";
import { Provider } from "react-redux";

import { getCurrentPaths, setPaths } from "../common/path-util";
import { createStore, defaultState } from "./store";

import { loadPersistedState, watchAndSave, watchStore } from "./persist";

import App from "./view/App";
import { checkSfdxPathValidity } from "./store/settings";

const initialState = loadPersistedState(defaultState);
const store = createStore(initialState);
watchAndSave(store);

const basePaths = getCurrentPaths();

watchStore(
  store,
  state => state.settings.sfdxPath,
  value => setPaths([
    path.dirname(value),
    ...basePaths
  ]),
  true
);

watchStore(
  store,
  state => state.settings.theme,
  value => document.body.className = value === 'dark' ? 'bp3-dark' : '',
  true
);

store.dispatch(checkSfdxPathValidity());

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
