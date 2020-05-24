import React, { useState, useMemo } from "react";
import { connect } from "react-redux";
import { InputGroup, FormGroup, Button, ControlGroup } from "@blueprintjs/core";
import { validInstanceUrl, urlToFrontDoorUrl, coerceInstanceUrl } from "renderer/api/url";
import { State, CustomDispatch } from "renderer/store";
import { createErrorToast } from "renderer/store/messages";

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

function FrontDoorBody(props: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isInputValid = useMemo(() => validInstanceUrl(input), [input]);

  const handleConvert = async () => {
    if (isInputValid) {
      setIsLoading(true);

      const orgs = props.orgList.map((org) => org.description);
      try {
        setOutput(await urlToFrontDoorUrl(orgs, coerceInstanceUrl(input)));
      } catch(err) {
        props.createErrorToast("Error converting url", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleConvert();
    }
  };

  return (
    <div className="sbt-m_medium">
      <FormGroup label="URL Input">
        <ControlGroup>
          <InputGroup
            placeholder="Example: www.salesforce.com"
            fill
            readOnly={isLoading}
            value={input}
            onChange={(event: ChangeEvent) => {
              setInput(event.target.value);
            }}
            onKeyPress={handleKeyPress}
          />
          <Button icon="clipboard" disabled={isLoading} />
        </ControlGroup>
      </FormGroup>
      <FormGroup label="URL Output">
        <ControlGroup fill>
          <InputGroup readOnly value={output} />
        </ControlGroup>
      </FormGroup>
      <Button intent="primary" disabled={!isInputValid} loading={isLoading} onClick={handleConvert}>
        Convert Url
      </Button>
    </div>
  );
}

function mapStateToProps(state: State) {
  return {
    orgList: state.orgs.orgList,
  };
}

function mapDispatchToProps(dispatch: CustomDispatch) {
  return {
    createErrorToast: (message: string, detail?: string | Error) => dispatch(createErrorToast(message, detail))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FrontDoorBody);
