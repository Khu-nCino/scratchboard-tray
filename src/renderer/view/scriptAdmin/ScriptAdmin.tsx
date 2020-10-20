import scripts from "renderer/view/scripts/apexScripts/script2.json";
import React, { useState }  from "react";
import { get, set } from 'local-storage';
import {
    InputGroup,
    FormGroup,
    ButtonGroup,
    Button,
  } from "@blueprintjs/core";


export const ScriptAdmin = () => {
  const [name, setName] = useState("");
  const [packageName, setPackageName] = useState("");
  const [object, setObject] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");

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

  const onBodyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    
    console.log(get<object[]>('apexScripts'));
  };

  const handleDeleteAll = async () => {
    set('apexScripts', null);
  };

  const handleInitialScripts = async () => {
    let newScript = {
      "name": "",
      "package": "",
      "object": "",
      "description": "",
      "body": "" 
    }
    scripts.forEach(script => {
      newScript.name = script.name;
      newScript.package = script.package;
      newScript.object = script.object;
      newScript.description = script.description;
      newScript.body = script.body;
      let existingScripts = get<object[]>('apexScripts') || [];
      set('apexScripts', [...existingScripts, newScript]);
      console.log("Saved " + script.name)
    });
  }

  return(
    <div className="sbt-m_medium">
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
        <InputGroup
          fill
          key="body"
          value={body}
          onChange={onBodyChange}
        />
      </FormGroup>
      <ButtonGroup>
        <Button
          intent="primary"
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          intent="danger"
          onClick={handleDeleteAll}
        >
          Delete All
        </Button>
        <Button
          intent="warning"
          onClick={handleInitialScripts}
        >
          Inititate Scripts
        </Button>
      </ButtonGroup>
    </div>
  );
};