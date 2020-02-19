import { remote } from "electron";
import React, { useCallback } from "react";
import { InputGroup, Button, ControlGroup } from "@blueprintjs/core";

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FileInput(props: Props) {
  const onChangeCallback = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange(event.target.value);
    },
    [props.onChange]
  );

  const onShowDialogCallback = useCallback(async () => {
    const results = await remote.dialog.showOpenDialog({
      defaultPath: props.value,
      properties: ["openDirectory"]
    });

    if (!results.canceled && results.filePaths.length > 0) {
      props.onChange(results.filePaths[0]);
    }
  }, [props.onChange, props.value]);

  return (
    <ControlGroup className={props.className}>
      <InputGroup
        value={props.value}
        onChange={onChangeCallback}
        placeholder="Sfdx File Path"
        fill
      />
      <Button onClick={onShowDialogCallback}>Select Folder</Button>
    </ControlGroup>
  );
}
