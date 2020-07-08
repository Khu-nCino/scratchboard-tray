import tls from "tls";
import fs from "fs";
import process from "process";

if (process.platform === "darwin") {
  const origCreateSecureContext = tls.createSecureContext;
  tls.createSecureContext = (options) => {
    const context = origCreateSecureContext(options);

    const pem = fs
      .readFileSync("/Library/Application Support/Netskope/STAgent/data/nscacert.pem", {
        encoding: "ascii",
      })
      .replace(/\r\n/g, "\n");

    const certs = pem.match(/-----BEGIN CERTIFICATE-----\n[\s\S]+?\n-----END CERTIFICATE-----/g);

    if (!certs) {
      throw new Error(`Could not parse certificate ./rootCA.crt`);
    }

    certs.forEach((cert) => {
      context.context.addCACert(cert.trim());
    });

    return context;
  };
}
