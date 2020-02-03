import React from "react";
import { Switch, Button } from '@blueprintjs/core';
import FileInput from './FileInput';

export default function SettingsBody() {
  return <div>
    <Switch labelElement={"Dark Theme"} defaultChecked large />
    <FileInput />
    <Button intent="danger">Exit</Button>
  </div>;
}
