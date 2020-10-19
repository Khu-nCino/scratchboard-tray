import React, { useState }  from "react";
import { get, set } from 'local-storage';
import {
    InputGroup,
    FormGroup,
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
      <Button
        intent="primary"
        onClick={handleSave}
      >
        Save
      </Button>
      <Button
        intent="warning"
        onClick={handleDeleteAll}
      >
        Delete All
      </Button>
    </div>
  );
};
