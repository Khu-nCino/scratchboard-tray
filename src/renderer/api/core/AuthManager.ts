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
    redirectUri: `http://localhost:${this.portNumber}/OauthRedirect`,
  };

  private server?: http.Server;

  constructor(private cache: OrgCache) {}

  webAuth(loginUrl: string, initialAlias?: string) {
    return new Promise<AuthInfo>((resolve, reject) => {
      const oauth2 = new OAuth2WithVerifier({
        ...this.baseOptions,
        loginUrl,
      });

      this.server = http.createServer(async (request, response) => {
        this.closeServer();

        try {
          const url = new URL(request.url!!, this.baseOptions.redirectUri);
          if (request.method !== "GET") {
            this.sendError(response, 405, "Unsupported http methods")
            reject(new Error(`Invalid request method: ${request.method}`));
            return;
          }
          if (!url.pathname.startsWith('/OauthRedirect')) {
            this.sendError(response, 404, "Resource not found");
            reject(new Error(`Invalided request uri: ${url.pathname}`));
            return;
          }

          const authCode = url.searchParams.get("code");
          if (!authCode) {
            this.sendError(response, 500, "No authCode found");
            reject(new Error("No auth code found"));
            return;
          }

          const authInfo = await AuthInfo.create({
            oauth2Options: { ...this.baseOptions, loginUrl, authCode },
            oauth2,
          });

          const { accessToken, instanceUrl, username } = authInfo.getFields();
          if (!accessToken || !instanceUrl || !username) {
            this.sendError(response, 500, "Authentication error");
            reject(new Error("No accessToken, instanceUrl or username"));
            return;
          }

          const redirectUrl = formatFrontDoorUrl(instanceUrl, accessToken);
          this.doRedirect(response, redirectUrl);

          if (initialAlias !== undefined) {
            await this.cache.setAlias(username, initialAlias);
          }
          await this.cache.addData(authInfo);
          resolve(authInfo);
        } catch (error) {
          reject(error);
        }
      });

      this.server.on("error", (error) => {
        reject(error);
        this.server?.close();
      });

      this.server.listen(this.portNumber, "localhost", () => {
        const authUrl = oauth2.getAuthorizationUrl({
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
    const redirectCode = 303;

    response.setHeader("Content-Type", "text/plain");
    const body = `${redirectCode} - Redirecting to ${url}`;
    response.setHeader("Content-Length", Buffer.byteLength(body));
    // redirect to frontdoor
    response.writeHead(redirectCode, { Location: url });
    response.end(body);
  }

  private sendError(response: http.ServerResponse, statusCode: number, message: string) {
    response.statusMessage = message;
    response.statusCode = statusCode;
    response.end();
  }
}

export const authManager = new AuthManager(orgCache);
