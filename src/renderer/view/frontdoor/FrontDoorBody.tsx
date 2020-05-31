import React, { useState } from "react";
import { connect } from "react-redux";
import {
  InputGroup,
  FormGroup,
  Button,
  ControlGroup,
  RadioGroup,
  Radio,
  Intent,
} from "@blueprintjs/core";
import { urlToFrontDoorUrl, coerceInstanceUrl, matchOrgByUrl } from "renderer/api/url";
import { State, CustomDispatch } from "renderer/store";
import { createErrorToast, createToast } from "renderer/store/messages";
import { SalesforceOrg } from "renderer/api/SalesforceOrg";

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

function FrontDoorBody(props: Props) {
  const [inputUrl, setInputUrl] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [orgOptions, setOrgsOptions] = useState<SalesforceOrg[]>([]);
  const [selectedOrgUsername, setSelectedOrgUsername] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputUrl(value);
    try {
      const orgs = matchOrgByUrl(props.orgList, value);
      setOrgsOptions(orgs);
      setSelectedOrgUsername(orgs[0]?.username);
    } catch (e) {
      setOrgsOptions([]);
      setSelectedOrgUsername(undefined);
    }
  };

  const handleConvert = async () => {
    if (selectedOrgUsername) {
      setIsLoading(true);

      try {
        const frontDoorUrl = await urlToFrontDoorUrl(
          selectedOrgUsername,
          coerceInstanceUrl(inputUrl)
        );
        await navigator.clipboard.writeText(frontDoorUrl);
        setOutputUrl(frontDoorUrl);
        props.createToast("The url is copied to you clipboard.");
      } catch (err) {
        props.createErrorToast("Error converting url", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleConvert();
    }
  };

  let intent: Intent;
  let helperText: string | undefined;
  if (!inputUrl) {
    intent = "none";
  } else if (orgOptions.length === 0) {
    intent = "warning";
    helperText = "No matching orgs found";
  } else if (orgOptions.length === 1) {
    const org = orgOptions[0];
    intent = "success";
    helperText = `Username: ${org.alias || org.username}`;
  } else {
    intent = "success";
    helperText = "Please select the username you would like to use below.";
  }

  return (
    <div className="sbt-m_medium">
      <FormGroup label="URL Input" helperText={helperText} intent={intent}>
        <InputGroup
          placeholder="Example: www.salesforce.com"
          fill
          readOnly={isLoading}
          value={inputUrl}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
      </FormGroup>
      {orgOptions.length > 1 && (
        <RadioGroup
          onChange={(event) => setSelectedOrgUsername(event.currentTarget.value)}
          selectedValue={selectedOrgUsername}
        >
          {orgOptions.map((org) => (
            <Radio
              key={org.username}
              label={org.alias || org.username}
              value={org.username}
              onKeyPress={onKeyPress}
            />
          ))}
        </RadioGroup>
      )}
      <FormGroup label="URL Output">
        <ControlGroup fill>
          <InputGroup readOnly value={outputUrl} />
        </ControlGroup>
      </FormGroup>
      <Button
        intent="primary"
        disabled={!selectedOrgUsername}
        loading={isLoading}
        onClick={handleConvert}
      >
        Convert & Copy
      </Button>
    </div>
  );
}

function mapStateToProps(state: State) {
  return {
    orgList: state.orgs.orgList.map((org) => org.description),
  };
}

function mapDispatchToProps(dispatch: CustomDispatch) {
  return {
    createErrorToast: (message: string, detail?: string | Error) =>
      dispatch(createErrorToast(message, detail)),
    createToast: (message: string) => dispatch(createToast(message, "success")),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FrontDoorBody);
