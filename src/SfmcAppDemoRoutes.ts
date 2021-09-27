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
     

        if (clientId && clientSecret)
        
            {
                
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
    
}
