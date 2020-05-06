import { Action } from "redux";

type ExpandedAction = ToggleExpansion;

interface ToggleExpansion extends Action<"TOGGLE_EXPANSION"> {
  payload: {
    groupName: GroupName;
  };
}

export function toggleExpansion(
  groupName: GroupName
): ToggleExpansion {
  return {
    type: "TOGGLE_EXPANSION",
    payload: {
      groupName,
    },
  };
}

type GroupName = keyof ExpandedState;

export interface ExpandedState {
  sharedOrgs: boolean;
  scratchOrgs: boolean;
}

export const defaultExpandedState: ExpandedState = {
    sharedOrgs: true,
    scratchOrgs: true,
};

export function expandedReducer(
  state: ExpandedState = defaultExpandedState,
  action: ExpandedAction
) {
  switch (action.type) {
    case "TOGGLE_EXPANSION": {
      const { groupName } = action.payload;
      return {
        ...state,
        [groupName]: !state[groupName],
      };
    }
    default:
      return state;
  }
}
