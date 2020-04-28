import { Action } from "redux";

type GroupName = keyof ExpandedState;

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

export interface ExpandedState {
  standardOrgs: boolean;
  scratchOrgs: boolean;
}

export const defaultExpandedState: ExpandedState = {
    standardOrgs: true,
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
