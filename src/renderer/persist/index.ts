import { Store, CombinedState } from "redux";
import ElectronStore from "electron-store";
import { State } from "../store";

type AppState = CombinedState<State>;

const electronStore = new ElectronStore();

export function loadInitState(state: Partial<State>): Partial<State> {
  return {
    ...state,
    settings: {
      sfdxPath: electronStore.get("sfdxPath", state.settings?.sfdxPath),
      theme: electronStore.get("theme", state?.settings?.theme)
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

export function watchStore<T, V>(
  store: Store<T>,
  accessor: (state: T) => V,
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
