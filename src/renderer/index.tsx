import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "./index.scss";

import { ipcRenderer } from "electron";
import { ipcRenderer as ipc } from "electron-better-ipc";
import React from "react";
import ReactDom from "react-dom";
import { Provider } from "react-redux";
import { FocusStyleManager } from "@blueprintjs/core";

import { getLogger } from "common/logger";
import { IpcMainEvent, IpcRendererEvent } from "common/IpcEvent";
import { createStore, defaultState } from "./store";
import { listenForIpcUpdates } from "./store/updates";
import { checkOpenAtLogin } from "./store/settings";
import { orgListChanged } from "./store/orgs";
import { PersistManager, watchStore } from "./persist";
import { App } from "./view/App";
import { orgManager } from "./api/core/OrgManager";
import { createErrorToast } from "./store/messages";
import { setIsVisible } from "./store/route";

import "./patchCaCert";

const logger = getLogger();

ipc
  .callMain<void, string>(IpcRendererEvent.GET_APP_VERSION)
  .then(initializeApp)
  .catch((error) => {
    logger.error("Couldn't get appVersion, fatal error");
    logger.error(error);
  });

function initializeApp(appVersion: string) {
  const persistManager = new PersistManager(appVersion);

  const initialState = persistManager.loadPersistedState(defaultState);
  const store = createStore(initialState);
  persistManager.watchAndSave(store);

  // For dark/light them
  watchStore(
    store,
    (state) => state.settings.theme,
    (value) => (document.body.className = value === "dark" ? "bp3-dark" : ""),
    true
  );

  store.dispatch(checkOpenAtLogin());

  orgManager.checkOrgChanges();
  ipcRenderer.on(IpcMainEvent.WINDOW_OPENED, () => {
    orgManager.checkOrgChanges();
    store.dispatch(setIsVisible(true));
  });

  ipcRenderer.on(IpcMainEvent.WINDOW_CLOSED, () => {
    store.dispatch(setIsVisible(false));
  });

  orgManager.orgDataChangeEvent.addListener(async ({ changed, removed }) => {
    store.dispatch(orgListChanged(changed, removed));
  });

  orgManager.syncErrorEvent.addListener(async ({ name, detail }) => {
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
