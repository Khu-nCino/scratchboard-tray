import { Store, CombinedState } from "redux";
import ElectronStore from "electron-store";
import { State, defaultState } from "../store";
import appVersion from "../app-version";

type AppState = CombinedState<State>;

const electronStore = new ElectronStore({
  projectName: "scratchboard-tray",
  projectVersion: appVersion,
} as ElectronStore.Options<any>);

export function loadPersistedState(state: Partial<State>): Partial<State> {
  return {
    ...state,
    settings: {
      ...state.settings,
      sfdxPath: electronStore.get("sfdxBinPath", state.settings?.sfdxPath),
      theme: electronStore.get("theme", state.settings?.theme),
      openAtLogin: false,
    },
    expanded: {
      ...defaultState.expanded,
      ...electronStore.get("expanded", {}),
    }
  };
}

export function watchAndSave(store: Store<AppState>) {
  watchStore(
    store,
    (state) => state.settings.sfdxPath,
    (value) => electronStore.set("sfdxBinPath", value)
  );

  watchStore(
    store,
    (state) => state.settings.theme,
    (value) => electronStore.set("theme", value)
  );

  watchStore(
    store,
    (state) => state.expanded,
    (value) => electronStore.set("expanded", value)
  )
}

export function watchStore<S, V>(
  store: Store<S>,
  accessor: (state: S) => V,
  callback: (value: V) => void,
  callOnStart: boolean = false
) {
  let currentValue = accessor(store.getState());
  store.subscribe(() => {
    const newValue = accessor(store.getState());
    if (currentValue !== newValue) {
      currentValue = newValue;
      callback(newValue);
    }
  });

  if (callOnStart && currentValue !== undefined) {
    callback(currentValue);
  }
}

export function openSettingsFile() {
  electronStore.openInEditor();
}
