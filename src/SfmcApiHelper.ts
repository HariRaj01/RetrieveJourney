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
  private member_id = "";
  private soap_instance_url = "";
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
    tssd = process.env.BASE_URL;
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


  public appUserInfo(req: any, res: any) {
    let self = this;
    console.log("req.body.tssd:" + req.body.tssd);
    console.log("req.body.trefreshToken:" + req.body.refreshToken);
    
    let userInfoUrl =
      "https://" + req.body.tssd + ".auth.marketingcloudapis.com/v2/userinfo";
    let access_token: string;
  
    self
      .getRefreshTokenHelper(req.body.refreshToken, req.body.tssd, false, res)
      .then((response) => {
        Utils.logInfo(
          "refreshTokenbody:" + JSON.stringify(response.refreshToken)
        );
        Utils.logInfo("AuthTokenbody:" + JSON.stringify(response.oauthToken));
        access_token = response.oauthToken;
        const refreshTokenbody = response.refreshToken;
        Utils.logInfo("refreshTokenbody1:" + JSON.stringify(refreshTokenbody));
        let headers = {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        };
  
        axios
          .get(userInfoUrl, { headers: headers })
          .then((response: any) => {
            console.log("userinfo>>>>",response.data.user.name);
            
            const getUserInfoResponse = {
              member_id: response.data.organization.member_id,
              soap_instance_url: response.data.rest.soap_instance_url,
              rest_instance_url: response.data.rest.rest_instance_url,
              refreshToken: req.body.refreshToken,
              oauthToken : req.body.oauthToken,
              username:response.data.user.name
            };
  
            //Set the member_id into the session
            console.log("Setting active sfmc mid into session:" + getUserInfoResponse.member_id);
            req.session.sfmcMemberId = getUserInfoResponse.member_id;
            console.log("UserInfo>>>>>>",getUserInfoResponse.member_id);
            
            //this.CheckAutomationStudio(access_token, req.body.refreshToken, req.body.tssd, getUserInfoResponse.member_id);
            res.status(200).send(getUserInfoResponse);
          })
          .catch((error: any) => {
            // error
            let errorMsg = "Error getting User's Information.";
            errorMsg += "\nMessage: " + error.message;
            errorMsg +=
              "\nStatus: " + error.response ? error.response.status : "<None>";
            errorMsg +=
              "\nResponse data: " + error.response
                ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
                : "<None>";
            Utils.logError(errorMsg);
  
            res
              .status(500)
              .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
          });
      })
      .catch((error: any) => {
        res
          .status(500)
          .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
      });
  }
  

  public getJourneysById(req: express.Request, res: express.Response) {
    //this.getRefreshTokenHelper(this._accessToken, res);
    //this.getRefreshTokenHelper(this._accessToken, res);
    console.log("getJourneysById:" + req.body.memberid);
    console.log("getJourneysById:" + req.body.soap_instance_url);
    console.log("getJourneysById:" + req.body.refreshToken);
    console.log("Get Journey ID:",req.body.journeyId)
    let oauthToken = req.body.oauthToken;
    console.log("OAuth in:>>",oauthToken)
    let tssd = process.env.BASE_URL;
    this.getRefreshTokenHelper(req.body.refreshToken, tssd, false, res)
      .then((response) => {
        Utils.logInfo(
          "getJourneysById:" + JSON.stringify(req.body.refreshToken)
        );
        Utils.logInfo(
          "getJourneysById= OauthToken:" + JSON.stringify(req.body.oauthToken)
        );
        return new Promise<any>((resolve, reject) => {
          let headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + oauthToken,
          };


          let JourneyUrl =
            "https://" +
             tssd +
            ".rest.marketingcloudapis.com/interaction/v1/interactions/" +
            req.body.journeyId;

           console.log("Journey URL:",JourneyUrl,"","Headers:",headers)
          axios({
            method: "get",
            url: JourneyUrl,
            headers: headers,
          })
            .then((response: any) => {
              let sendresponse = {
                refreshToken: req.body.refreshToken,
                oauthToken : req.body.oauthToken,
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
      // .catch((error: any) => {
      //   res
      //     .status(500)
      //     .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
      // });
  }

};
    

