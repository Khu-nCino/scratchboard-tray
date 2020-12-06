import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { ScratchBoardState } from "renderer/store";
import { orgCache } from "renderer/api/core/OrgCache";
import { Button } from "@blueprintjs/core";
import { DynamicTextArea } from "renderer/view/scripts/DynamicTextArea";

interface OwnProps extends ConnectedProps<typeof connector> {
    Name: string,
    Package: string,
    Object: string,
    Description: string,
    Body: string
}

async function runScript(username: string, body: string) {
    const connection = await orgCache.getConnection(username);
    connection.tooling.executeAnonymous(body, function(err, res) {
        if (err) { return console.error(err); }
        console.log("compiled?: " + res.compiled); // compiled successfully
        console.log("executed?: " + res.success); // executed successfully
    });
}

function mapStateToProps(state: ScratchBoardState) {
    return {username: state.route.detailUsername!!}
}

const connector = connect(mapStateToProps);

export const ScriptsItem = connector((props: OwnProps) => {
    const [body, setBody] = useState(props.Body);
    return(
    <div className="sbt-org-list--item sbt-flex-container sbt-hover-highlight">
        <div className="sbt-ml_medium">
            { props.Name } <br/>
            { props.Package } <br/>
            { props.Object } <br/>
            { props.Description } <br/>
            <DynamicTextArea body={body} onchange={setBody} />  <br/>
            <Button intent="primary" onClick={() => runScript(props.username, body)}>
                Run in org 
            </Button>
            <hr/>
        </div>
    </div>
    );
});