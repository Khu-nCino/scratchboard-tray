import fs from "fs";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { ScriptsItem } from "./ScriptsItem";
import { ScratchBoardState } from "renderer/store";

const directory = "./src/renderer/view/scripts/apexScripts/";
const localDirectory = "./apexScripts/";
let scripts = new Array();

fs.readdir(directory, (err, files) => {
  files.forEach(file => {
    let temp = require(localDirectory + file + "");
    scripts.push(temp);
  });
});

function mapStateToProps(state: ScratchBoardState) {
  return {username: state.route.detailUsername}
}

const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector>;

export const ScriptsBody = connector((props: Props) => {
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
