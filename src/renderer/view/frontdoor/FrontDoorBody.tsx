import React, { useState, useMemo } from "react";
import { connect } from "react-redux";
import { InputGroup, FormGroup, Button, ControlGroup } from "@blueprintjs/core";
import { validInstanceUrl, urlToFrontDoorUrl, coerceInstanceUrl } from "renderer/api/url";
import { State } from "renderer/store";

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

type Props = ReturnType<typeof mapStateToProps>;

function FrontDoorBody(props: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isInputValid = useMemo(() => validInstanceUrl(input), [input]);

  return <div className="sbt-m_medium">
    <FormGroup label="URL Input">
      <ControlGroup>
        <InputGroup placeholder="Example: www.salesforce.com" fill readOnly={isLoading} value={input} onChange={(event: ChangeEvent) => {
          setInput(event.target.value);
        }} />
        <Button icon="clipboard" disabled={isLoading} />
      </ControlGroup>
    </FormGroup>
    <FormGroup label="URL Output">
      <ControlGroup fill>
        <InputGroup readOnly value={output} />
      </ControlGroup>
    </FormGroup>
    <Button intent="primary" disabled={!isInputValid} loading={isLoading} onClick={async () => {
      setIsLoading(true);

      const orgs = props.orgList.map((org) => org.description);
      setOutput(await urlToFrontDoorUrl(orgs, coerceInstanceUrl(input)));
      setIsLoading(false);
    }}>Convert Url</Button>
  </div>;
}

function mapStateToProps(state: State) {
  return {
    orgList: state.orgs.orgList,
  };
}

export default connect(mapStateToProps)(FrontDoorBody);