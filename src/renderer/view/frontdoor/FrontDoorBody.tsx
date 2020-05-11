import React from "react";
import { InputGroup, FormGroup, Button } from "@blueprintjs/core";

export default function FrontDoorBody() {
  return <div className="sbt-m_medium">
    <FormGroup label="URL Input">
      <InputGroup placeholder="Example: www.salesforce.com" />
    </FormGroup>
    <FormGroup label="URL Output">
      <InputGroup readOnly />
    </FormGroup>
    <Button>Convert Url</Button>
  </div>;
}
