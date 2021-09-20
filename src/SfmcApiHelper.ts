'use strict';

import axios from 'axios';
import express = require("express");
import { request } from 'http';
import Utils from './Utils';
import xml2js = require("xml2js");

export default class SfmcApiHelper
{
    // Instance variables
  private client_id="";
  private client_secret="";
  // private _accessToken = "";
  private oauthAccessToken=""; 
  private member_id = "514005798";
  private soap_instance_url = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.soap.marketingcloudapis.com/";
  private _deExternalKey = "DF20Demo";
  private _sfmcDataExtensionApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.auth.marketingcloudapis.com/hub/v1/dataevents/key:" + this._deExternalKey + "/rowset";

  
   public getOAuthAccessToken(
    clientId: string,
    clientSecret: string,
    req: any,
    res: any
  ): Promise<any> {
    let self = this;
    var tssd = "";
    tssd = req.body.tssd ? req.body.tssd : process.env.BASE_URL;
    console.log("authorizetssd:" + tssd);
    let headers = {
      "Content-Type": "application/json",
    };

    let postBody = {
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code: req.body.authorization_code,
      redirect_uri: process.env.REDIRECT_URL,
    };

    return self.getOAuthTokenHelper(headers, postBody, res, tssd);
  }

   public getOAuthTokenHelper(
    headers: any,
    postBody: any,
    res: any,
    tssd: string
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      console.log("author" + JSON.stringify(postBody));
      console.log("headers",headers);
      
      let sfmcAuthServiceApiUrl =
        "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.auth.marketingcloudapis.com/v2/token";
      // this.isAccessToken = true;
      console.log("sfmcAuthServiceApiUrl:" + sfmcAuthServiceApiUrl);
      axios
        .post(sfmcAuthServiceApiUrl, postBody, { headers: headers })
        .then((response: any) => {
          let refreshToken = response.data.refresh_token;
          this.getRefreshTokenHelper(refreshToken, tssd, true, res);
        })
        .catch((error: any) => {
          // error
          let errorMsg = "Error getting OAuth Access Token.";
          errorMsg += "\nMessage: " + error.message;
          errorMsg +=
            "\nStatus: " + error.response ? error.response.status : "<None>";
          errorMsg +=
            "\nResponse data: " + error.response
              ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
              : "<None>";
          Utils.logError(errorMsg);

          reject(errorMsg);
        });
    });
  }

  //Helper method to get refresh token
  public getRefreshTokenHelper(
    refreshToken: string,
    tssd: string,
    returnResponse: boolean,
    res: any
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      console.log("tssdrefresh:" + tssd);
      console.log("returnResponse:" + returnResponse);

      let sfmcAuthServiceApiUrl =
        "https://" + tssd + ".auth.marketingcloudapis.com/v2/token";
      let headers = {
        "Content-Type": "application/json",
      };
      console.log("sfmcAuthServiceApiUrl:" + sfmcAuthServiceApiUrl);
      let postBody1 = {
        grant_type: "refresh_token",
        client_id: process.env.CLIENTID,
        client_secret: process.env.CLIENTSECRET,
        refresh_token: refreshToken,
      };
      axios
        .post(sfmcAuthServiceApiUrl, postBody1, { headers: headers })
        .then((response: any) => {
          let bearer = response.data.token_type;
          let tokenExpiry = response.data.expires_in;
          // this._accessToken = response.data.refresh_token;
          //this._oauthToken = response.data.access_token;
          Utils.logInfo("Auth Token:" + response.data.access_token);
          const customResponse = {
            refreshToken: response.data.refresh_token,
            oauthToken: response.data.access_token,
          };
          if (returnResponse) {
            res.status(200).send(customResponse);
          }
          resolve(customResponse);
        })
        .catch((error: any) => {
          let errorMsg = "Error getting refresh Access Token.";
          errorMsg += "\nMessage: " + error.message;
          errorMsg +=
            "\nStatus: " + error.response ? error.response.status : "<None>";
          errorMsg +=
            "\nResponse data: " + error.response
              ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
              : "<None>";
          Utils.logError(errorMsg);

          reject(errorMsg);
        });
    });
  }

  public getJourneysById(req: express.Request, res: express.Response) {
    //this.getRefreshTokenHelper(this._accessToken, res);
    //this.getRefreshTokenHelper(this._accessToken, res);
    console.log("getJourneysById:" + this.member_id);
    console.log("getJourneysById:" + this.soap_instance_url);
    console.log("getJourneysById:" + req.body.refreshToken);
    
    let refreshTokenbody = "";
    this.getRefreshTokenHelper(req.body.refreshToken, process.env.BASE_URL, false, res)
      .then((response) => {
        Utils.logInfo(
          "getJourneysById:" + JSON.stringify(response.refreshToken)
        );
        Utils.logInfo("getJourneysById:" + JSON.stringify(response.oauthToken));
        refreshTokenbody = response.refreshToken;
        Utils.logInfo("getJourneysById:" + JSON.stringify(refreshTokenbody));
        console.log("OAuthToken For Response:",response.oauthToken);
        return new Promise<any>((resolve, reject) => {
          let headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + response.oauthToken,
          };
          let JourneyUrl =
            "https://" +
            process.env.BASE_URL +
            ".rest.marketingcloudapis.com/interaction/v1/interactions/" +
            req.body.journeyId;

            console.log("URL Journey:",JourneyUrl ,"","headers:",headers);
          axios({
            method: "get",
            url: JourneyUrl,
            headers: headers,
          })
            .then((response: any) => {
              let sendresponse = {
                refreshToken: refreshTokenbody,
                activity: response.data,
              };
              res.status(200).send(sendresponse);
              // res.status(200).send(response.data);
            })
            
            .catch((error: any) => {
              // error
              let errorMsg = "Error getting the Active Journeys......";
              errorMsg += "\nMessage: " + error.message;
              errorMsg +=
                "\nStatus: " + error.response
                  ? error.response.status
                  : "<None>";
              errorMsg +=
                "\nResponse data: " + error.response.data
                  ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
                  : "<None>";
              Utils.logError(errorMsg);

              reject(errorMsg);
            });
        });
      })
      .catch((error: any) => {
        res
          .status(500)
          .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
      });
  }

};
    

