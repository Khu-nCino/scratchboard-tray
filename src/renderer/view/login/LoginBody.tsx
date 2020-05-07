import React, { useState } from "react";
import { InputGroup, Button, FormGroup, NonIdealState, Spinner } from "@blueprintjs/core";
import { popRouteAction } from "renderer/store/route";
import { connect } from "react-redux";
import { loginOrg } from "renderer/api/sfdx";
import { listOrgsRequest } from "renderer/store/orgs";
import { CustomDispatch } from "renderer/store";

const defaultInstanceUrl = "login.salesforce.com";

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

type DispatchProps = ReturnType<typeof mapDispatchToState>;
type Props = DispatchProps;

function LoginBody(props: Props) {
  const [instanceUrl, setInstanceUrl] = useState(defaultInstanceUrl);
  const [alias, setAlias] = useState("");
  const [cancelProcess, setCancelProcess] = useState<() => void | undefined>();

  if (cancelProcess !== undefined) {
    return (
      <NonIdealState
        title="Authenticating"
        description="Finish process in your browser."
        icon={<Spinner />}
        action={
          <Button
            intent="danger"
            onClick={() => {
              cancelProcess();
              setCancelProcess(undefined);
            }}
          >
            Abort
          </Button>
        }
      />
    );
  } else {
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
          <Button
            intent="primary"
            className="sbt-ml_small"
            onClick={async () => {
              const childProcess = loginOrg(instanceUrl, alias !== "" ? alias : undefined);
              setCancelProcess(() => childProcess.cancel);

              try {
                await childProcess.promise;
                props.loadOrgs();
                props.popRoute();
              } catch (error) {}
            }}
          >
            Login
          </Button>
        </div>
      </div>
    );
  }
}

function mapDispatchToState(dispatch: CustomDispatch) {
  return {
    popRoute: () => dispatch(popRouteAction()),
    loadOrgs: () => dispatch(listOrgsRequest()),
  };
}

export default connect(undefined, mapDispatchToState)(LoginBody);
