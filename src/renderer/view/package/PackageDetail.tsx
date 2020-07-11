import React from "react";

import { AuthorityPackageVersion } from "renderer/api/core/PackageManager";
import { Dialog, Classes, Button } from "@blueprintjs/core";

interface Props {
  isOpen: boolean;
  packageVersion: AuthorityPackageVersion;
  onClose: () => void;
}

export const PackageDetail = (props: Props) => (
  <Dialog>
    <div className={Classes.DIALOG_BODY}>

    </div>
    <div className={Classes.DIALOG_FOOTER}>
      <div className={Classes.DIALOG_FOOTER_ACTIONS}>
        <Button onClick={props.onClose}>Close</Button>
      </div>
    </div>
  </Dialog>
);
