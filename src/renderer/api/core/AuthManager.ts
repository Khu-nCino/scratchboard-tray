import { OAuth2WithVerifier, AuthInfo } from "@salesforce/core";
import { OAuth2Options } from "jsforce";
import { shell } from "electron";
import http from "http";
import { formatFrontDoorUrl } from "../url";
import { OrgCache, orgCache } from "./OrgCache";

export class AuthManager {
  private portNumber = 1717;
  private baseOptions: OAuth2Options = {
    clientId: "PlatformCLI",
    clientSecret: "",
    redirectUri: `http://localhost:${this.portNumber}/OauthRedirect`
  };

  private server?: http.Server;

  constructor(private cache: OrgCache) {}

  webAuth(loginUrl: string) {
    return new Promise<AuthInfo>((resolve, reject) => {
      const oauth2 = new OAuth2WithVerifier({
        ...this.baseOptions,
        loginUrl
      });
      const state = '1234'; // TODO generate random state

      this.server = http.createServer(async (request, response) => {
        const url = new URL(request.url!!, this.baseOptions.redirectUri);
        const authCode = url.searchParams.get("code");
        const authState = url.searchParams.get("state");

        if (authCode && authState === state) {
          this.closeServer();

          const authInfo = await AuthInfo.create({
            oauth2Options: { ...this.baseOptions, loginUrl, authCode },
            oauth2,
          });

          const { accessToken, instanceUrl } = authInfo.getFields();
          if (accessToken && instanceUrl) {
            const redirectUrl = formatFrontDoorUrl(instanceUrl, accessToken);
            this.doRedirect(response, redirectUrl);

            await this.cache.addData(authInfo);
            resolve(authInfo);
          } else {
            // TODO error response
            reject("")
          }
        }
      });
      this.server.listen(this.portNumber, 'localhost', () => {
        const authUrl = oauth2.getAuthorizationUrl({
          state,
          prompt: "login",
          response_type: "code",
          scope: "refresh_token api web",
        });
        shell.openExternal(authUrl);
      });
    });
  }

  closeServer() {
    if (this.server) {
      if (this.server.listening) {
        this.server.close();
      }
      this.server = undefined;
    }
  }

  private doRedirect(response: http.ServerResponse, url: string) {
    const redirectCode = 307;

    response.setHeader("Content-Type", "text/plain");
    const body = `${redirectCode} - Redirecting to ${url}`;
    response.setHeader("Content-Length", Buffer.byteLength(body));
    // redirect to frontdoor
    response.writeHead(redirectCode, { Location: url });
    response.end(body);
  }
}

export const authManager = new AuthManager(orgCache);