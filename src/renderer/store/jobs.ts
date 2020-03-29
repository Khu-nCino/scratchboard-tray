import { Action } from "redux";
import { Intent } from "@blueprintjs/core";

export type JobsAction = CreateToastAction | DismissToastAction;

interface CreateToastAction extends Action<"CREATE_TOAST"> {
  payload: Toast;
}

interface DismissToastAction extends Action<"DISMISS_TOAST"> {
  payload: {
    id: number;
  };
}

let nextToastId = 0;
export function createToast(
  message: string,
  intent: Intent
): CreateToastAction {
  return {
    type: "CREATE_TOAST",
    payload: {
      id: nextToastId++,
      message,
      intent,
    },
  };
}

export function createErrorToast(
  message: string,
  detail?: string
): CreateToastAction {
  const fullMessage = detail ? `${message}: ${detail}` : message;
  return createToast(fullMessage, "danger");
}

export function dismissToast(toastId: number): DismissToastAction {
  return {
    type: "DISMISS_TOAST",
    payload: {
      id: toastId,
    },
  };
}

//State

interface Toast {
  id: number;
  message: string;
  intent: Intent;
}

interface JobsState {
  toasts: Toast[];
}

const defaultState: JobsState = {
  toasts: [],
};

export function jobsReducer(state = defaultState, action: JobsAction) {
  switch (action.type) {
    case "CREATE_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case "DISMISS_TOAST": {
      const toasts = [...state.toasts];
      const indexToRemove = toasts.findIndex(
        (toast) => toast.id === action.payload.id
      );
      toasts.splice(indexToRemove, 1);

      return {
        ...state,
        toasts,
      };
    }
    default:
      return state;
  }
}
