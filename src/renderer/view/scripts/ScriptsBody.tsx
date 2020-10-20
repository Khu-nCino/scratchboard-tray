import { get } from 'local-storage';
import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { ScriptsItem } from "./ScriptsItem";
import { ScratchBoardState } from "renderer/store";
import { DynamicTextArea } from "renderer/view/scripts/DynamicTextArea";

function mapStateToProps(state: ScratchBoardState) {
  return {username: state.route.detailUsername}
}

const connector = connect(mapStateToProps);
interface Props extends ConnectedProps<typeof connector>{
  filterApplied: string;
};

interface Script {
  name: string;
  package: string;
  object: string;
  description: string;
  body: string;
}

export const ScriptsBody = connector((props: Props) => {
  const [ scripts ] = useState(get<Script[]>('apexScripts'));
  return(
    <div className="sbt-m_medium">
      {scripts.filter((script) => props.filterApplied === 'All' || script.object===props.filterApplied).map((script, key) => {
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
