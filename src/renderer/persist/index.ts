import { Store, CombinedState } from "redux";
import ElectronStore from "electron-store";
import { State } from "../store";
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
      features: {
        displayAllOrgs: electronStore.get(
          "features.displayAllOrgs",
          state.settings?.features.displayAllOrgs
        ),
      },
    },
  };
}

export function watchAndSave(store: Store<AppState>) {
  watchStore(
    store,
    (state: AppState) => state.settings.sfdxPath,
    (value: string) => electronStore.set("sfdxBinPath", value)
  );

  watchStore(
    store,
    (state: AppState) => state.settings.theme,
    (value: string) => electronStore.set("theme", value)
  );

  watchStore(
    store,
    (state: AppState) => state.settings.features.displayAllOrgs,
    (value: boolean) => electronStore.set("features.displayAllOrgs", value)
  );
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
