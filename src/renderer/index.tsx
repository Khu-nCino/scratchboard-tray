import "./index.scss";

import React from "react";
import ReactDom from "react-dom";
import { Provider } from "react-redux";

import { getCurrentPaths, setPaths } from "../common/path-util";
import { createStore, defaultState } from "./store";
import { listOrgsRequest } from "./store/orgs";

import { loadInitState, watchAndSave, watchStore } from "./persist";

import App from "./view/App";

const store = createStore(loadInitState(defaultState));
watchAndSave(store);

const basePaths = getCurrentPaths();
setPaths([store.getState().settings.sfdxPath, ...basePaths]);

watchStore(
  store,
  state => state.settings.sfdxPath,
  value => setPaths([value, ...basePaths])
);

store.dispatch(listOrgsRequest());

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
