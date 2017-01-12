
 *  EchoSistant - Lambda Code
 *
 *  Version 4.1.1 - 1/12/2017 Bug Fixes
 *  Version 4.0.1 - 11/29/2016 Copyright © 2016 Jason Headley
 *  Version 3.0.0 - 11/21/2016 Copyright © 2016 Jason Headley
 *  Special thanks for Michael Struck @MichaelS (Developer of AskAlexa) for allowing me
 *  to build off of his base code.  Special thanks to Keith DeLong  @N8XD for his 
 *  assistance in troubleshooting.... as I learned.....  Special thanks to Bobby
 *  @SBDOBRESCU for jumping on board and being a co-consipirator in this adventure.
 *
 *  Version 3.0.0 - 12/1/2016  Added new parent variables
 *  Version 2.0.0 - 11/20/2016  Continued Commands
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
 */
'use strict';
exports.handler = function( event, context ) {
    var https = require( 'https' );
    // Paste app code here between the breaks------------------------------------------------
    var STappID = '0ae736f9-51c0-439d-9cab-32c460b5febb';
    var STtoken = '21c78384-1323-40d9-aae7-da2d09537a96';
    var url='https://graph.api.smartthings.com:443/api/smartapps/installations/' + STappID + '/' ;
        //---------------------------------------------------------------------------------------
        var cardName ="";
        var areWeDone = true;
//-------- Validation process and begining interaction with SmartThings app-------------------- 
        var versionTxt = '4.0';
        var versionDate= '12/29/2016';
        var releaseTxt = "4.0.0";
        var intentResp = "action";
        if (event.request.type == "IntentRequest"){
            intentResp = event.request.intent.name;
        }
        var beginURL = url + 'b?&versionTxt=' + versionTxt + '&intentResp=' + intentResp + '&versionDate=' + versionDate + '&releaseTxt=' + releaseTxt + '&access_token=' + STtoken;
        https.get( beginURL, function( response ) {
        response.on( 'data', function( data ) {
            var startJSON = JSON.parse(data);
            var pMuteAlexa = startJSON.pContinue; //setting global variable if continuation is allowed for either control or tts
            var verST = startJSON.versionSTtxt;
//-------- Error trapping--------------------------------------------------------------------
            if (startJSON.error) { 
                output("There was an error. If this continues to happen, please reach out for help", context, "Lambda Error", areWeDone); 
            }
            if (startJSON.error === "invalid_token" || startJSON.type === "AccessDenied") {
                output("There was an error accessing the SmartThings cloud environment. Please check your security token and application ID and try again. ", context, "Lambda Error", areWeDone); 
            }
            if (verST != versionTxt) { 
                output("You are using outdated smart apps. Please make sure to update both the Lambda code and the SmartThings code to most recent versions, and then try again.", context, "Lambda Error", areWeDone);
            }
//-------- Begining Request------------------------------------------------------------------            
            if (event.request.type == "LaunchRequest") { 
                alexaResp ("LaunchRequest", context, areWeDone); 
            }
            else if (event.request.type == "SessionEndedRequest"){}
            else if (event.request.type == "IntentRequest") {
                var process = false;
                var intentName = event.request.intent.name;
                if (intentName.startsWith("AMAZON") && intentName.endsWith("Intent")) { 
                    alexaResp (intentName, context, "Amazon Intent", areWeDone); 
                }
                //if (intentName == "AMAZON.StopIntent" || intentName == "AMAZON.NoIntent") {
                //    var rResponse = intentName;
                //    url += 'r?rResponse=' + rResponse;
                //}                
//-------- Devicce Control Type Request------------------------------------------------------------------
                else if (intentName == "main"){           
                    var cCommand = event.request.intent.slots.cCommand.value;
                    var cNum = event.request.intent.slots.cNum.value;
                    var cPIN = event.request.intent.slots.cPIN.value;
                    var cDevice = event.request.intent.slots.cDevice.value;
                    var cUnit = event.request.intent.slots.cUnit.value;
                    var cGroup = event.request.intent.slots.cGroup.value;
                    url += 'c?cDevice=' + cDevice + '&cGroup=' + cGroup + '&cCommand=' + cCommand + '&cNum=' + cNum + '&cPIN=' + cPIN + '&cUnit=' + cUnit + '&intentName=' + intentName;    
                    process = true;
                    cardName = "EchoSistant Control";
                }
//-------- Profile Control Type Request------------------------------------------------------------------
                else if (intentName == "profile"){           
                    var pCommand = event.request.intent.slots.cCommand.value;
                    var pProfile = event.request.intent.slots.pProfile.value;
                    var pNum = event.request.intent.slots.cNum.value;
                    var pUnit = event.request.intent.slots.cUnit.value;

                    url += 'p?pCommand=' + pCommand + '&pNum=' + pNum + '&pUnit=' + pUnit + '&intentName=' + intentName;
                    process = true;
                    cardName = "EchoSistant Profile Control";
                }
//-------- Feedback Type Request------------------------------------------------------------------
                else if (intentName == "feedback"){           
                    var fProfile = event.request.intent.slots.pProfile.value;
                    var fDevice = event.request.intent.slots.cDevice.value;
                    var fQuery = event.request.intent.slots.fQuery.value;
                    var fOperand = event.request.intent.slots.fOperand.value;

                    url += 'f?fProfile=' + fProfile + '&fDevice=' + fDevice + '&fQuery=' + fQuery + '&fOperand=' + fOperand + '&intentName=' + intentName;
                    process = true;
                    cardName = "EchoSistant Feedback";
                }
//-------- TTS Type Request------------------------------------------------------------------
                else if (intentName != "main") {
                    var ttstext = event.request.intent.slots.ttstext.value;
                    url += 't?ttstext=' + ttstext + '&intentName=' + intentName;
                    process = true;
                    cardName = "EchoSistant Free Text";
                }
//-------- General Response------------------------------------------------------------------
                if (!process) {
                    output("I am not sure what you are asking. Please try again", context, areWeDone); 
                }
                else {
                    url += '&access_token=' + STtoken;
                    https.get( url, function( response ) {
                        response.on( 'data', function( data ) {
                        var resJSON = JSON.parse(data);
                        var pContCmds = resJSON.pContCmds;
                        var pContCmdsR = resJSON.pContCmdsR;
                        var pTryAgain = resJSON.pTryAgain;
                        var pPIN = resJSON.pPIN;
                        var speechText = resJSON.outputTxt;
                        if (pMuteAlexa === true) {
                            areWeDone=true;
                            return output("", context, cardName, areWeDone);
                        }    
                        else if (pContCmds === true && pContCmdsR == "profile" ) { 
                            areWeDone=false;
                            speechText = speechText + ', send another message to ' + intentName;
                            return output(speechText, context, cardName, areWeDone);
                        }
                        else if (pTryAgain === true){
                            alexaContResp ("Try Again", speechText, context, areWeDone);
                        }
                        else if (pContCmdsR == "filters"){
                            //just wait
                            areWeDone=false;
                        }
                        else if (pPIN === true){
                            //just wait
                            areWeDone=false;
                        }
                        else if (pContCmds === true && pContCmdsR == "no") {
                            alexaContResp ("Short Answer", speechText, context, areWeDone);
                        }
                        else if (pContCmds === true && pContCmdsR == "yes") {
                            alexaContResp ("Long Answer", speechText, context, areWeDone);
                        }
                        else if (pContCmds === false){
                            //no sound
                            areWeDone=true;
                        }
                        output(speechText, context, cardName, areWeDone);
                        } );
                    } );
                }
            }
        } );
    } );
};
    
function alexaResp(type, context, cardName, areWeDone){
    if (type == "AMAZON.YesIntent") { 
        areWeDone=false;
        output("Please continue...", context, "EchoSistant Stop", areWeDone);
    }
    else if (type == "AMAZON.NoIntent") { 
        areWeDone=true;
        output(" It has been my pleasure.  Goodbye ", context, "EchoSistant Stop", areWeDone);
    }
    else if (type == "AMAZON.StopIntent") { 
        areWeDone=true;
        output(" Cancelling. Goodbye ", context, "EchoSistant Cancel", areWeDone);
    }
    else if (type == "AMAZON.CancelIntent") { 
        areWeDone=true;
        output(" Cancelling. Goodbye ", context, "EchoSistant Cancel", areWeDone);
    }
}
function alexaContResp(type, text , context, areWeDone){
    var speechText = text;
    if (type == "Try Again" ) { 
        speechText = speechText + ',  would you like to try again? '; 
        areWeDone=false;
        output(speechText, context, "EchoSistant Try Again", areWeDone);
    }
    else if (type == "PIN") { 
        areWeDone=false;
        speechText = "Pin number, please";
        output(speechText, context, "EchoSistant Stop", areWeDone);
    }
    else if (type == "Short Answer") { 
        areWeDone=false;
        speechText = speechText + ' , anything else';
        output(speechText, context, "EchoSistant Stop", areWeDone);
    }
    else if (type == "Long Answer") { 
        areWeDone=false;
        speechText = speechText + ' , would you like anything else';
        output(speechText, context, "EchoSistant Stop", areWeDone);
    }
}
function output( text, context, cardName, areWeDone) {
        var response = {
             outputSpeech: {
             type: "PlainText",
             text: text
                 },
                 card: {
                 type: "Simple",
                 title: cardName,
                 content: text
                    },
        shouldEndSession: areWeDone
        };
        context.succeed( { response: response } );
  }
