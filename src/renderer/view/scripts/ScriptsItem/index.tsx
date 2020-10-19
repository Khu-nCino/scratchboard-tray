import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { ScratchBoardState } from "renderer/store";
import { orgCache } from "renderer/api/core/OrgCache";

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
    return(
    <div className="sbt-org-list--item sbt-flex-container sbt-hover-highlight">
        <div className="sbt-ml_medium">
            { props.Name } <br/>
            { props.Package } <br/>
            { props.Object } <br/>
            { props.Description } <br/>
            { props.Body } <br/>
            <button onClick={() => runScript(props.username, props.Body)}>
                Run in org
            </button>
            <hr/>
        </div>
    </div>
    );
});