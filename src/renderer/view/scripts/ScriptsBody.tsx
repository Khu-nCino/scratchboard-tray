import { get } from 'local-storage';
import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { ScriptsItem } from "./ScriptsItem";
import { ScratchBoardState } from "renderer/store";

function mapStateToProps(state: ScratchBoardState) {
  return {username: state.route.detailUsername}
}

const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector>;

export const ScriptsBody = connector((props: Props) => {
  const [ scripts ] = useState(get<object[]>('apexScripts'));
  return(
    <div className="sbt-m_medium">
      {scripts.map((script, key) => {
          return (
            <ScriptsItem
              key = {key}
              Name={script.name}
              Package={script.package}
              Object={script.object}
              Description={script.description}
              Body={script.body}
            ></ScriptsItem>
          );
        })}
    </div>
  );
});
