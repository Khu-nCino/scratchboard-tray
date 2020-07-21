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
        theme: this.electronStore.get("theme", state.settings?.theme) as "light" | "dark",
        showSecondaryScratchUsernames: this.electronStore.get(
          "showSecondaryScratchUsernames",
          state.settings?.showSecondaryScratchUsernames
        ) as boolean,
        openAtLogin: false,
      },
      expanded: {
        ...defaultState.expanded,
        ...this.electronStore.get("expanded", {}) as Record<string, string>,
      },
      updates: {
        ...defaultState.updates,
        appVersion: this.appVersion,
      },
      packages: {
        ...state.packages,
        authorityUsername: this.electronStore.get(
          "packageAuthorityUsername",
          state.packages?.authorityUsername
        ) as string,
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
      (state) => state.packages.authorityUsername,
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
