import "./index.scss";

import path from "path";
import { ipcRenderer } from "electron";
import React from "react";
import ReactDom from "react-dom";
import { Provider } from "react-redux";
import { FocusStyleManager } from "@blueprintjs/core";

import { getCurrentPaths, setPaths } from "common/path-util";
import { IpcMainEvent } from "common/IpcEvent";
import { createStore, defaultState } from "./store";
import { listenIpc } from "./store/updates";
import { checkSfdxPathValidity, checkOpenAtLogin } from "./store/settings";
import { orgListChanged } from "./store/orgs";
import { loadPersistedState, watchAndSave, watchStore } from "./persist";
import App from "./view/App";
import { manager } from "./api/OrgManager";

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

manager.checkOrgChanges();
ipcRenderer.on(IpcMainEvent.WINDOW_OPENED, () => {
  manager.checkOrgChanges();
});

manager.orgDataChangeEvent.addListener(async ({ changed, removed }) => {
  store.dispatch(orgListChanged(changed, removed));
});

listenIpc(store);

FocusStyleManager.onlyShowFocusOnTabs();

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
