import "./index.scss";

import React from "react";
import ReactDom from "react-dom";
import { Provider } from "react-redux";

import { getCurrentPaths, setPaths } from "../common/path-util";
import { createStore, defaultState } from "./store";

import { loadInitState, watchAndSave, watchStore } from "./persist";

import App from "./view/App";
import { checkSfdxPathValidity } from "./store/settings";

const initialState = loadInitState(defaultState);
const store = createStore(initialState);
watchAndSave(store);

const basePaths = getCurrentPaths();

if (initialState.settings?.sfdxPath) {
  setPaths([initialState.settings.sfdxPath, ...basePaths]);
}

if (initialState.settings?.theme) {
  document.body.className = initialState.settings.theme === 'dark' ? 'bp3-dark' : ''
}

watchStore(
  store,
  state => state.settings.sfdxPath,
  value => setPaths([value, ...basePaths])
);

watchStore(
  store,
  state => state.settings.theme,
  value => document.body.className = value === 'dark' ? 'bp3-dark' : ''
);

store.dispatch(checkSfdxPathValidity());

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
