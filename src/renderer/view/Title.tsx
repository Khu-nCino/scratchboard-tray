import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ButtonGroup, Button, Colors } from "@blueprintjs/core";

import { listOrgsRequest } from "../store/orgs";

interface Props {
  refreshOrgs(): any
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  borderBottom: "1px solid",
  backgroundColor: Colors.DARK_GRAY4,
  borderColor: Colors.DARK_GRAY1
};

const titleStyle: React.CSSProperties = {
  margin: "10px 20px"
};

const buttonStyle: React.CSSProperties = {
  margin: "auto 20px auto auto"
};

function Title(props: Props) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Scratchboard</h2>

      <ButtonGroup style={buttonStyle}>
        <Button icon="refresh" onClick={props.refreshOrgs} />
        <Button icon="cog" />
      </ButtonGroup>
    </div>
  );
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    refreshOrgs: () => dispatch(listOrgsRequest())
  }
}

export default connect(undefined, mapDispatchToProps)(Title)