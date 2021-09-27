'use strict';

import { json } from "body-parser";
import express = require("express");
import jwt = require('jwt-simple');
import SfmcApiHelper from './SfmcApiHelper';
import Utils from './Utils';


// <!-- Integrate an externally hosted app via iframe. -->
export default class SfmcAppDemoRoutes
{
    // Instance variables
    private _apiHelper = new SfmcApiHelper();

    public getOAuthAccessToken(req: express.Request, res: express.Response)
    {   
    
        let self = this;
        // let sessionId = req.session.id;
        let clientId = req.body.clientId;
        let clientSecret =req.body.clientSecret;

        console.log("ClientId:",clientId + "" + "Client Secret:",clientSecret)
        //req.session.oauthAccessToken = "";
        //req.session.oauthAccessTokenExpiry = "";

        // Utils.logInfo("getOAuthAccessToken route entered. SessionId = " + sessionId);

        if (clientId && clientSecret)
        
            {
                // Utils.logInfo("Getting OAuth Access Token with ClientID and ClientSecret from in environment variables and refreshToken: " + req.session.refreshTokenFromJWT);
    
                self._apiHelper.getOAuthAccessToken(clientId,clientSecret)
                .then((result) => {
                  //  req.session.oauthAccessToken = result.oauthAccessToken;
                    //req.session.oauthAccessTokenExpiry = result.oauthAccessTokenExpiry;
                    res.status(result.status).send(result);
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
            }
            // else
            // {
            //     // error
            //     let errorMsg = "refreshToken *not* found in session.\nCheck the '/login' URL specified in your\nMarketing Cloud App configuration."; 
            //     Utils.logError(errorMsg);
            //     res.status(500).send(errorMsg);
            // }
        
        else
        {
            // error
            let errorMsg = "ClientID or ClientSecret *not* found in environment variables."; 
            Utils.logError(errorMsg);
            res.status(500).send(errorMsg);
        }
    }

    public appUserInfo(req: express.Request, res: express.Response) {
        let self = this;
        self._apiHelper.appUserInfo(req, res);
      }
      
    public getJourneysById(req: express.Request, res: express.Response) {
        let self = this;
        self._apiHelper.getJourneysById(req, res);
      }
        
    public getactivityById(req: express.Request, res: express.Response) {
        let self = this;
        self._apiHelper.getactivityById(req, res);
      }
    // public dataFolderCheck(req: express.Request, res: express.Response) {
    //   let self = this;
    //   self._apiHelper.dataFolderCheck(req, res);
    // }

    // public retrievingDataExtensionFolderID(
    //   req: express.Request,
    //   res: express.Response
    // ) {
    //   let self = this;
    //   self._apiHelper.retrievingDataExtensionFolderID(req, res);
    // }
    // public createSparkpostIntegrationFolder(
    //     req: express.Request,
    //     res: express.Response
    //   ) {
    //     let self = this;
    //     self._apiHelper.createSparkpostIntegrationFolder(req, res)
      
    //   }
    
     
    // public domainConfigurationDE(
    //     req: express.Request,
    //     res: express.Response,
        
    //   ) {        
    //     let self = this;
    //    self._apiHelper.domainConfigurationDE(req, res)
    //    .then((response:any)=>{

    //     console.log("Response for Creating DE :::"+ JSON.stringify(response));
    //     res.status(200).send(response.statusText);

    //    })
    //    .catch((error: any) => {
    //      console.log("error in creating domainconfiguration")
         
      
    //   })
// }
}
