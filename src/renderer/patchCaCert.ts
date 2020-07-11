import tls from "tls";
import fs from "fs";
import process from "process";
import { promisify } from "util";

if (process.platform === "darwin") {
  const readFile = promisify(fs.readFile);

  readFile("/Library/Application Support/Netskope/STAgent/data/nscacert.pem", { encoding: "ascii" })
    .then((data) =>
      data
        .replace(/\r\n/g, "\n")
        .match(/-----BEGIN CERTIFICATE-----\n[\s\S]+?\n-----END CERTIFICATE-----/g)
        ?.map((cert) => cert.trim())
    )
    .then((certs) => {
      if (certs !== undefined && certs.length > 0) {
        const origCreateSecureContext = tls.createSecureContext;
        tls.createSecureContext = (options) => {
          const context = origCreateSecureContext(options);

          certs.forEach((cert) => {
            context.context.addCACert(cert);
          });

          return context;
        };
      }
    })
    .catch((reason) => {
      console.log(reason);
    });
}
