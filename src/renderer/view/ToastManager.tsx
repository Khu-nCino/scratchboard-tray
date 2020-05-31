import React, { useState } from "react";
import {
  Toaster,
  Position,
  Toast,
  Intent,
  IconName,
  Dialog,
  Button,
  Classes,
} from "@blueprintjs/core";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { dismissToast, createToast } from "renderer/store/messages";
import { State } from "renderer/store";
import { Toast as ToastRecord } from "renderer/store/messages";

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const intentIcons: Record<Intent, IconName | undefined> = {
  success: "tick",
  danger: "error",
  warning: "warning-sign",
  none: undefined,
  primary: undefined,
};

function ToastManager(props: Props) {
  const [dialogToast, setDialogToast] = useState<ToastRecord | undefined>();
  const closeDialog = () => setDialogToast(undefined);

  return (
    <>
      <Dialog
        title="Details"
        isOpen={dialogToast !== undefined}
        onClose={closeDialog}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        className="sbt-mh_medium"
      >
        <div className={Classes.DIALOG_BODY}>
          <span className="bp3-code-block">{dialogToast?.detail}</span>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(dialogToast?.detail!);
                // TODO convert to tooltip
                props.createToast("Content copied to your clipboard.", "success");
              }}
            >
              Copy to Clipboard
            </Button>
            <Button intent={Intent.PRIMARY} onClick={closeDialog}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
      <Toaster position={Position.BOTTOM}>
        {props.toasts.map((toast) => {
          const message = toast.detail ? (
            <>
              {toast.message + " "}
              <a onClick={() => setDialogToast(toast)}>Details</a>
            </>
          ) : (
            toast.message
          );

          return (
            <Toast
              key={toast.id}
              message={message}
              intent={toast.intent}
              icon={intentIcons[toast.intent]}
              onDismiss={() => props.dismissToast(toast.id)}
            />
          );
        })}
      </Toaster>
    </>
  );
}

function mapStateToProps(state: State) {
  return {
    toasts: state.messages.toasts,
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    dismissToast: (toastId: number) => dispatch(dismissToast(toastId)),
    createToast: (message: string, intent: Intent) => dispatch(createToast(message, intent)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ToastManager);
