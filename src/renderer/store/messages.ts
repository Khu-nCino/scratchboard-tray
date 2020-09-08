import { Intent } from "@blueprintjs/core";
import { ScratchBoardThunk } from ".";

const CREATE_TOAST = "CREATE_TOAST";
const DISMISS_TOAST = "DISMISS_TOAST";

export type MessagesAction = ReturnType<typeof createToastRaw> | ReturnType<typeof dismissToast>;

const intentToTitle: Partial<Record<Intent, string>> = {
  success: "Action Success",
  danger: "Action Failed",
  warning: "Action Warning",
};

export function createToast(message: string, intent: Intent, detail?: string): ScratchBoardThunk {
  return (dispatch, getState) => {
    if (getState().route.isVisible) {
      dispatch(createToastRaw(message, intent, detail));
    } else {
      new Notification(intentToTitle[intent] ?? "Scratchboard", {
        body: message,
      });
    }
  };
}

function createToastRaw(message: string, intent: Intent, detail?: string) {
  return {
    type: CREATE_TOAST,
    payload: {
      message,
      intent,
      detail,
    },
  } as const;
}

export function createErrorToast(message: string, detail?: string | Error) {
  return createToast(message, "danger", `${detail}`);
}

export function dismissToast(toastId: number) {
  return {
    type: DISMISS_TOAST,
    payload: {
      toastId,
    },
  } as const;
}

//State
export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly detail?: string;
  readonly intent: Intent;
}

interface MessagesState {
  readonly nextToastId: number;
  readonly toasts: Toast[];
}

const defaultState: MessagesState = {
  nextToastId: 0,
  toasts: [],
};

export function messagesReducer(
  state: MessagesState = defaultState,
  action: MessagesAction
): MessagesState {
  switch (action.type) {
    case CREATE_TOAST:
      return {
        nextToastId: state.nextToastId + 1,
        toasts: [...state.toasts, { ...action.payload, id: state.nextToastId }],
      };
    case DISMISS_TOAST: {
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload.toastId),
      };
    }
    default:
      return state;
  }
}
