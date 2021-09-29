'use strict';

import axios from 'axios';
import express = require("express");
import { request } from 'http';
import Utils from './Utils';
import xml2js = require("xml2js");
import JSONFormatter from 'json-formatter-js'

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

  
  public getOAuthAccessToken(clientId: string, clientSecret: string) : Promise<any>    
  {
       let self = this;
        Utils.logInfo("getOAuthAccessToken called.");   
       Utils.logInfo("Using specified ClientID and ClientSecret to get OAuth token...");
  let headers = {  
              'Content-Type': 'application/json',
          };
  let postBody = {
      "grant_type": "client_credentials",
      "client_id": clientId,
      "client_secret": clientSecret       
    };
    console.log("PostBody:",JSON.stringify(postBody));
  return self.getOAuthTokenHelper(headers, postBody); 
   }
/**     * getOAuthTokenHelper: Helper method to POST the given header & body to the SFMC Auth endpoint     *      */    
public getOAuthTokenHelper(headers : any, postBody: any) : Promise<any>    
{
          return new Promise<any>((resolve, reject) =>
          {
            // POST to Marketing Cloud REST Auth service and get back an OAuth access token.
            let sfmcAuthServiceApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.auth.marketingcloudapis.com/v2/token";
            axios.post(sfmcAuthServiceApiUrl, postBody, {"headers" : headers}) 
           .then((response: any) => { 
        // success                
         let accessToken = response.data.access_token;
         let tokenExpiry = new Date(); 
         tokenExpiry.setSeconds(tokenExpiry.getSeconds() + response.data.expiresIn);
         Utils.logInfo("Got OAuth token: " + accessToken + ", expires = " +  tokenExpiry);
         console.log("response:",response.data); 
         resolve(
            {  
              oauthAccessToken: accessToken, 
              soap_instance_url : response.data.soap_instance_url,
              rest_instance_url: response.data.rest_instance_url,
              oauthAccessTokenExpiry: tokenExpiry,
              status: response.status, 
              statusText: response.statusText + "\n" + Utils.prettyPrintJson(JSON.stringify(response.data))
              });  
             })   
             .catch((error: any) => { 
               // error
               let errorMsg = "Error getting OAuth Access Token."; 
                errorMsg += "\nMessage: " + error.message;     
                errorMsg += "\nStatus: " + error.response ? error.response.status : "<None>"; 
                errorMsg += "\nResponse data: " + error.response ? Utils.prettyPrintJson(JSON.stringify(error.response.data)) : "<None>"; 
                Utils.logError(errorMsg);
                reject(errorMsg); 
          });
        });
      }
  public getJourneysById(req: express.Request, res: express.Response) {
    
    console.log("getJourneysById:" + req.body.soap_instance_url);
    
    let oauthToken="";
    oauthToken = req.body.oauthToken;
    console.log("OAuth in:>>",oauthToken)
    let tssd = process.env.BASE_URL;
        Utils.logInfo(
          "getJourneysById= OauthToken:" + JSON.stringify(req.body.oauthToken)
        );
        return new Promise<any>((resolve, reject) => {
          let headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + oauthToken,
          };
          let JourneyUrl = req.body.rest_instance_url
           + "/interaction/v1/interactions/" 
           
           console.log("Journey URL:",JourneyUrl,"","Headers:",headers)
          axios({
            method: "get",
            url: JourneyUrl,
            headers: headers,
          })
            .then((response: any) => {
              let sendresponse = {
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
        })
      
      .catch((error: any) => {
        res
          .status(500)
          .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
      });
    }
    
    public getactivityById(req: express.Request, res: express.Response) {
      //this.getRefreshTokenHelper(this._accessToken, res);
      //this.getRefreshTokenHelper(this._accessToken, res);
      console.log("getJourneysById:" + req.body.memberid);
      console.log("getJourneysById:" + req.body.rest_instance_url);
      console.log("getJourneysById:" + req.body.refreshToken);
      console.log("Get Journey ID:",req.body.journeyId);
      let oauthToken="";
      oauthToken = req.body.oauthToken;
      console.log("OAuth in:>>",oauthToken)
      
         
            let headers = {
              "Content-Type": "application/json",
              Authorization: "Bearer " + oauthToken,
            };
  
  
            let JourneyUrl =
            req.body.rest_instance_url +
              "interaction/v1/interactions/" 
              +
              req.body.journeyId;
  
             console.log("Journey URL:",JourneyUrl,"","Headers:",headers)
            axios({
              method: "get",
              url: JourneyUrl,
              headers: headers,
            })
              .then((response: any) => {
                console.log("response>>>",response);
                
                let sendresponse = {
                  refreshToken: req.body.refreshToken,
                  oauthToken : req.body.oauthToken,
                  activity: response.data,
                };
                res.status(200).send(sendresponse);
                // res.status(200).send(response.data);
              })        
        .catch((error: any) => {
          res
            .status(500)
            .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
        });

    
};
