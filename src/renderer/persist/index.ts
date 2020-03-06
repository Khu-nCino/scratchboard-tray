import { Store, CombinedState } from "redux";
import ElectronStore from "electron-store";
import { State } from "../store";

type AppState = CombinedState<State>;

const electronStore = new ElectronStore();

export function loadPersistedState(state: Partial<State>): Partial<State> {
  return {
    ...state,
    settings: {
      ...state.settings,
      sfdxPath: electronStore.get("sfdxPath"),
      theme: electronStore.get("theme")
    }
  };
}

export function watchAndSave(store: Store<AppState>) {
  watchStore(
    store,
    (state: AppState) => state.settings.sfdxPath,
    (value: string) => electronStore.set("sfdxPath", value)
  );

  watchStore(
    store,
    (state: AppState) => state.settings.theme,
    (value: string) => electronStore.set("theme", value)
  );
}

export function watchStore<S, V>(
  store: Store<S>,
  accessor: (state: S) => V,
  callback: (value: V) => void
) {
  let currentValue = accessor(store.getState());
  store.subscribe(() => {
    const newValue = accessor(store.getState());
    if (currentValue !== newValue) {
      currentValue = newValue;
      callback(newValue);
    }
  });
}
