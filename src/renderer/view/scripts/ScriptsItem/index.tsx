import React from "react";

interface OwnProps {
    Name: String,
    Package: String,
    Object: String,
    Description: String,
    Body: String
}

export const ScriptsItem = (props: OwnProps) => {
    return(
    <div className="sbt-org-list--item sbt-flex-container sbt-hover-highlight">
        <div className="sbt-ml_medium">
            { props.Name } <br/>
            { props.Package } <br/>
            { props.Object } <br/>
            { props.Description } <br/>
            { props.Body } <br/>
            <hr/>
        </div>
    </div>
    );
};