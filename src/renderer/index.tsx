import "./index.scss";

import path from "path";
import { ipcRenderer } from "electron";
import { ipcRenderer as ipc } from "electron-better-ipc";
import React from "react";
import ReactDom from "react-dom";
import { Provider } from "react-redux";
import { FocusStyleManager } from "@blueprintjs/core";

import { getCurrentPaths, setPaths } from "common/path-util";
import { getLogger } from "common/logger";
import { IpcMainEvent, IpcRendererEvent } from "common/IpcEvent";
import { createStore, defaultState } from "./store";
import { listenForIpcUpdates } from "./store/updates";
import { checkSfdxPathValidity, checkOpenAtLogin } from "./store/settings";
import { orgListChanged } from "./store/orgs";
import { PersistManager, watchStore } from "./persist";
import App from "./view/App";
import { manager } from "./api/core/OrgManager";
import { createErrorToast } from "./store/messages";
import { setIsVisible } from "./store/route";

const logger = getLogger();

ipc
  .callMain<void, string>(IpcRendererEvent.GET_APP_VERSION)
  .then(initialApp)
  .catch((error) => {
    logger.error("Couldn't get appVersion, fatal error");
    logger.error(error);
  });

function initialApp(appVersion: string) {
  const persistManager = new PersistManager(appVersion);

  const initialState = persistManager.loadPersistedState(defaultState);
  const store = createStore(initialState);
  persistManager.watchAndSave(store);

  const basePaths = getCurrentPaths();

  // For sfdx binary
  watchStore(
    store,
    (state) => state.settings.sfdxPath,
    (value) => setPaths([path.dirname(value), ...basePaths]),
    true
  );

  // For dark/light them
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
    store.dispatch(setIsVisible(true));
  });

  ipcRenderer.on(IpcMainEvent.WINDOW_CLOSED, () => {
    store.dispatch(setIsVisible(false));
  });

  manager.orgDataChangeEvent.addListener(async ({ changed, removed }) => {
    store.dispatch(orgListChanged(changed, removed));
  });

  manager.syncErrorEvent.addListener(async ({ name, detail }) => {
    store.dispatch(createErrorToast(name, detail));
  });

  listenForIpcUpdates(store);
  FocusStyleManager.onlyShowFocusOnTabs();

  ReactDom.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("app")
  );
}
