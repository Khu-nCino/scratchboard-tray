import { ipcRenderer } from "electron";
import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";

const connector = connect(undefined, undefined);
type Props = ConnectedProps<typeof connector>;

export const ScriptsBody = connector((props: Props) => {
      return(<div className="sbt-m_medium">
        Scripts 2
      </div>);
});
