import { Store, CombinedState, DeepPartial } from "redux";
import ElectronStore from "electron-store";
import { State, defaultState } from "../store";

type AppState = CombinedState<State>;

export class PersistManager {
  private electronStore: ElectronStore;

  constructor(private appVersion: string) {
    this.electronStore = new ElectronStore({
      projectName: "scratchboard-tray",
      projectVersion: appVersion,
    } as ElectronStore.Options<any>);
  }

  loadPersistedState(state: DeepPartial<State>): DeepPartial<State> {
    return {
      ...state,
      settings: {
        ...state.settings,
        theme: this.electronStore.get("theme", state.settings?.theme),
        showSecondaryScratchUsernames: this.electronStore.get(
          "showSecondaryScratchUsernames",
          state.settings?.showSecondaryScratchUsernames
        ),
        packageAuthorityUsername: this.electronStore.get(
          "packageAuthorityUsername",
          state.settings?.packageAuthorityUsername
        ),
        openAtLogin: false,
      },
      expanded: {
        ...defaultState.expanded,
        ...this.electronStore.get("expanded", {}),
      },
      updates: {
        ...defaultState.updates,
        appVersion: this.appVersion,
      },
    };
  }

  watchAndSave(store: Store<AppState>) {
    watchStore(
      store,
      (state) => state.settings.theme,
      (value) => this.electronStore.set("theme", value)
    );

    watchStore(
      store,
      (state) => state.expanded,
      (value) => this.electronStore.set("expanded", value)
    );

    watchStore(
      store,
      (state) => state.settings.showSecondaryScratchUsernames,
      (value) => this.electronStore.set("showSecondaryScratchUsernames", value)
    );

    watchStore(
      store,
      (state) => state.settings.packageAuthorityUsername,
      (value) => this.electronStore.set("packageAuthorityUsername", value)
    );
  }
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
