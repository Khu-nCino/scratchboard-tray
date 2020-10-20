import scriptsFile from "renderer/view/scripts/apexScripts/script2.json";
import React, { useState }  from "react";
import classNames from "classnames";
import { get, set } from 'local-storage';
import {
    Classes,
    InputGroup,
    FormGroup,
    ButtonGroup,
    Button,
    Overlay,
    TextArea
  } from "@blueprintjs/core";
import { ScriptAdminItem } from "./ScriptAdminItem";

export const ScriptAdmin = () => {
  const [name, setName] = useState("");
  const [packageName, setPackageName] = useState("");
  const [object, setObject] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [ scripts, setScripts ] = useState(get<object[]>('apexScripts') || []);
  const [ isOpen, setIsOpen ] = useState(false);

  const classes = classNames(
    Classes.CARD,
    Classes.ELEVATION_4,
    "script-modal"
);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setName(value);
  };

  const onPackageNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPackageName(value);
  };

  const onObjectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setObject(value);
  };

  const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDescription(value);
  };

  const onBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setBody(value);
  };

  const handleSave = async () => {
    let newScript = {
      "name": name,
      "package": packageName,
      "object": object,
      "description": description,
      "body": body
    }

    let existingScripts = get<object[]>('apexScripts') || [];
    set('apexScripts', [...existingScripts, newScript]);

    setScripts(get<object[]>('apexScripts'));
    toggleOverlay();
    
    console.log(get<object[]>('apexScripts'));
  };

  const handleDeleteAll = async () => {
    set('apexScripts', null);

    setScripts([]);
  };

  const toggleOverlay = () => {
    setIsOpen(!isOpen);
  };

  const handleInitialScripts = async () => {
    let newScript = {
      "name": "",
      "package": "",
      "object": "",
      "description": "",
      "body": "" 
    }

    console.log(scripts);

    scriptsFile.forEach(script => {
      newScript.name = script.name;
      newScript.package = script.package;
      newScript.object = script.object;
      newScript.description = script.description;
      newScript.body = script.body;
      let existingScripts = get<object[]>('apexScripts') || [];
      set('apexScripts', [...existingScripts, newScript]);
      console.log("Saved " + script.name)
    });

    setScripts(get<object[]>('apexScripts'));
  }

  return(
    <div className="sbt-m_medium">
      <Button className="add-script" text="Add Script" onClick={toggleOverlay} />
      <Button
          className="add-script"
          intent="warning"
          onClick={handleInitialScripts}
        >
          Inititate Scripts
        </Button>
      <Overlay isOpen={isOpen} onClose={toggleOverlay} className={Classes.OVERLAY_SCROLL_CONTAINER}>
        <div className={classes}>
         <FormGroup label="New Script">
            Name
            <InputGroup
              fill
              key="name"
              value={name}
              onChange={onNameChange}
            />
            Package
            <InputGroup
              fill
              key="packageName"
              value={packageName}
              onChange={onPackageNameChange}
            />
            Object
            <InputGroup
              fill
              key="object"
              value={object}
              onChange={onObjectChange}
            />
            Description
            <InputGroup
              fill
              key="description"
              value={description}
              onChange={onDescriptionChange}
            />
            Body
            <TextArea
              fill
              key="body"
              value={body}
              onChange={onBodyChange}
            />
          </FormGroup>
          <Button
            intent="primary"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </Overlay>

      <br/><br/><br/>

      {scripts.map((script, key) => {
        return (
          <ScriptAdminItem
            key = {key}
            Name={script.name}
            Package={script.package}
            Object={script.object}
            Description={script.description}
            Body={script.body}
          ></ScriptAdminItem>
        );
      })}

      <br/><br/><br/>

      <Button
        intent="warning"
        onClick={handleDeleteAll}
      >
        Delete All
      </Button>
    </div>
  );
};