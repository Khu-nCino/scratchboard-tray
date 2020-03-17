import React from 'react';
import { Dialog, Classes, InputGroup, Button, Intent, Keys } from '@blueprintjs/core';

export default function AliasDialog(props: {
  value: string,
  onChange: (value: string) => void,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void
}) {
  return (
    <Dialog
      title="Set Alias"
      isOpen={props.isOpen}
      onClose={props.onClose}
      className="sbt-mh_medium"
    >
      <div className={Classes.DIALOG_BODY}>
        <InputGroup
          value={props.value || ''}
          placeholder="Alias"
          onChange={(event: React.FormEvent<HTMLElement>) =>
            props.onChange((event.target as HTMLInputElement).value)
          }
          onKeyDown={(event) => {
            if (event.keyCode === Keys.ENTER) {
              props.onConfirm();
              props.onClose();
            }
          }}
          autoFocus
        />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button intent={Intent.NONE} onClick={props.onClose}>Cancel</Button>
          <Button intent={Intent.PRIMARY} onClick={() => {
            props.onConfirm();
            props.onClose();
          }}>Confirm</Button>
        </div>
      </div>
    </Dialog>
  );
}