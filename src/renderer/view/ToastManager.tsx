import React, { useState } from "react";
import {
  Toaster,
  Position,
  Toast,
  Intent,
  IconName,
  Dialog,
  Button,
  Classes
} from "@blueprintjs/core";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { dismissToast } from "../store/jobs";
import { State } from "../store";
import { Toast as ToastRecord } from "../store/jobs";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const intentIcons: Record<Intent, IconName | undefined> = {
  success: "tick",
  danger: "error",
  warning: "warning-sign",
  none: undefined,
  primary: undefined
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
        <div className={`${Classes.DIALOG_BODY} sbt-wrapping-text-output`}>
          {dialogToast?.detail}
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button intent={Intent.PRIMARY} onClick={closeDialog}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
      <Toaster position={Position.BOTTOM}>
        {props.toasts.map(toast => {
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
    toasts: state.jobs.toasts
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    dismissToast: (toastId: number) => dispatch(dismissToast(toastId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ToastManager);
