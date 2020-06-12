import http from "http";
import { OAuth2WithVerifier, AuthInfo } from "@salesforce/core";

const loginUrl = "https://login.salesforce.com";
const clientId = "PlatformCLI";
const clientSecret = "";
const redirectUri = "http://localhost:1717/OauthRedirect";

const oauth2 = new OAuth2WithVerifier({
  clientId,
  clientSecret,
  redirectUri,
  loginUrl,
});

console.log(
  oauth2.getAuthorizationUrl({
    state: "1234",
    prompt: "login",
    response_type: "code",
    scope: "refresh_token api web",
  })
);

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url!!, `http://${request.headers.host}`);
  const authCode = url.searchParams.get("code");

  if (authCode) {
    const authInfo = await AuthInfo.create({
      oauth2Options: { clientId, clientSecret, loginUrl, authCode },
      oauth2,
    });
    console.log(authInfo);
  }

  response.setHeader("Content-Type", "text/plain");
  const body = `Hi`;
  response.setHeader("Content-Length", Buffer.byteLength(body));
  response.writeHead(200); //, { Location: url });
  response.end(body);
});

server.listen(1717, "localhost");
