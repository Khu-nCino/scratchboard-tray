import "./index.scss";

import path from "path";
import React from "react";
import ReactDom from "react-dom";
import { Provider } from "react-redux";
import { ipcRenderer as ipc } from "electron-better-ipc";

import { getCurrentPaths, setPaths } from "common/path-util";
import { IpcMainEvent } from "common/IpcEvent";
import { createStore, defaultState } from "./store";

import { loadPersistedState, watchAndSave, watchStore } from "./persist";

import App from "./view/App";
import { checkSfdxPathValidity, checkOpenAtLogin } from "./store/settings";
import { listenIpc } from "./store/updates";
import { urlToFrontDoorUrl } from "./api/sfdx";

const initialState = loadPersistedState(defaultState);
const store = createStore(initialState);
watchAndSave(store);

const basePaths = getCurrentPaths();

watchStore(
  store,
  (state) => state.settings.sfdxPath,
  (value) => setPaths([path.dirname(value), ...basePaths]),
  true
);

watchStore(
  store,
  (state) => state.settings.theme,
  (value) => (document.body.className = value === "dark" ? "bp3-dark" : ""),
  true
);

store.dispatch(checkOpenAtLogin());
store.dispatch(checkSfdxPathValidity());

listenIpc(store);

// <find me a good home>
ipc.answerMain(IpcMainEvent.CONVERT_URL, (rawUrl: string) => {
  return urlToFrontDoorUrl(store.getState().orgs.orgList.map(({ description }) => description), rawUrl);
});
// </find me a good home>

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
