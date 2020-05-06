import React, { useState } from "react";
import { Dispatch } from "redux";
import { InputGroup, Button, FormGroup, Classes } from "@blueprintjs/core";
import { popRouteAction } from "renderer/store/route";
import { connect } from "react-redux";

const defaultInstanceUrl = "login.salesforce.com";

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

type DispatchProps = ReturnType<typeof mapDispatchToState>;
type Props = DispatchProps;

function LoginBody(props: Props) {
  const [instanceUrl, setInstanceUrl] = useState(defaultInstanceUrl);
  const [alias, setAlias] = useState("");

  return (
    <div className="sbt-m_medium">
      <div>
        <FormGroup label="Login URL" labelInfo="(required)">
          <InputGroup
            placeholder="Login url"
            value={instanceUrl}
            onChange={(event: ChangeEvent) => {
              setInstanceUrl(event.target.value);
            }}
          />
        </FormGroup>
        <FormGroup label="Alias">
          <InputGroup
            placeholder="Initial Alias"
            value={alias}
            onChange={(event: ChangeEvent) => {
              setAlias(event.target.value);
            }}
          />
        </FormGroup>
      </div>
      <div>
        <Button onClick={props.popRoute}>Cancel</Button>
        <Button intent="primary" className="sbt-ml_small">Login</Button>
      </div>
    </div>
  );
}

function mapDispatchToState(dispatch: Dispatch) {
  return {
    popRoute: () => dispatch(popRouteAction()),
  };
}

export default connect(undefined, mapDispatchToState)(LoginBody);
