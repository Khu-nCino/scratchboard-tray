import React from "react";
import { Dialog, Classes, InputGroup, Button, Intent } from "@blueprintjs/core";

export default function InputTextDialog(props: {
  titleText: string;
  placeholderText: string;
  value: string;
  isOpen: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      title={props.titleText}
      isOpen={props.isOpen}
      onClose={props.onClose}
      className="sbt-mh_medium"
    >
      <div className={Classes.DIALOG_BODY}>
        <InputGroup
          value={props.value || ""}
          placeholder={props.placeholderText}
          onChange={(event: React.FormEvent<HTMLElement>) =>
            props.onChange((event.target as HTMLInputElement).value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              props.onConfirm();
              props.onClose();
            }
          }}
          autoFocus
        />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button intent={Intent.NONE} onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            intent={Intent.PRIMARY}
            onClick={() => {
              props.onConfirm();
              props.onClose();
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
