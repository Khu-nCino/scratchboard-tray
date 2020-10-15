import scripts from "./scripts.json";
import React, { useState } from "react";
import { ScriptsItem } from "./ScriptsItem";

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
