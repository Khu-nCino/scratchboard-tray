import fs from "fs";
import React, { useState } from "react";
import { ScriptsItem } from "./ScriptsItem";

const directory = "./src/renderer/view/scripts/apexScripts/";
const localDirectory = "./apexScripts/";
let scripts = new Array();

fs.readdir(directory, (err, files) => {
  files.forEach(file => {
    let temp = require(localDirectory + file + "");
    scripts.push(temp);
  });
});

export const ScriptsBody = () => {
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
};
