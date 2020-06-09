import { Action } from "redux";
import { Intent } from "@blueprintjs/core";

export type MessagesAction = CreateToastAction | DismissToastAction;

interface CreateToastAction extends Action<"CREATE_TOAST"> {
  payload: Toast;
}

interface DismissToastAction extends Action<"DISMISS_TOAST"> {
  payload: {
    id: number;
  };
}

let nextToastId = 0;
export function createToast(message: string, intent: Intent, detail?: string): CreateToastAction {
  return {
    type: "CREATE_TOAST",
    payload: {
      id: nextToastId++,
      message,
      intent,
      detail,
    },
  };
}

export function createErrorToast(message: string, detail?: string | Error): CreateToastAction {
  return createToast(message, "danger", `${detail}`);
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

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly detail?: string;
  readonly intent: Intent;
}

interface MessagesState {
  readonly toasts: Toast[];
}

const defaultState: MessagesState = {
  toasts: [],
};

export function messagesReducer(state = defaultState, action: MessagesAction) {
  switch (action.type) {
    case "CREATE_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case "DISMISS_TOAST": {
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload.id),
      };
    }
    default:
      return state;
  }
}
