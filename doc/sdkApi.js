/**
 @Copyright 2019 Cisco Systems Inc. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

  1. Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in
the documentation and/or other materials provided with the
  distribution.

    THIS SOFTWARE IS PROVIDED BY CISCO ''AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
NO EVENT SHALL CISCO OR CONTRIBUTORS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

  The views and conclusions contained in the software and documentation
are those of the authors and should not be interpreted as representing
official policies, either expressed or implied, of Cisco.
 */

/**********************************************************************
 * @file sdkApi.js
 * @author Duanpei Wu; duanpei@cisco.com
 * @version 1.0
 *
 *
 * This file provides the abstract Service to call Webex WebApp SDK to implement all of services
 * including in-meeting, pre/post-meeting, site operation and WebRTC tool features. The actual
 * implementation code is in individual modules.
 *
 * For the in-meeting feature, multiple meetings could be created with sharing local resources and
 * separate remote media and messages identified with meetingId.
 *
 * For WebEx WebApp SDK detail design, you may refer to
 * https://wiki.cisco.com/display/PAN/WebApp+SDK.
 *
 *
 * ---- an illustrated Example ----
 * You may refer to the example application such as panTool in DemoApp for the detail
 ***********************************************************************/


'use strict';
import Tracer from "../Utility/trace.js";
import webexSDKImpl from "./sdkApiImpl.js";

const WebexSDK = {

  //------------- Meeting -----------------------
  // default meeting parameters. Any parameter omitted or invalid will take the default value.
  defaultMeetingParam: {
    meetingKey:   null, // Mandatory, a 9 digit meeting key.
    password:     null, // optional , a string of meeting password
    userEmail:    null, // Mandatory, an email address
    userDisplayName:  null, // Optional,  a name to be displayed in clients for the user
    siteURL:      null, // Optional,  a site URL with it the meeting is held

    // for host to start a meeting
    username:     null, // optional if sessionToken presents, to start a meeting; optional for an attendee
    userPassword: null, // optional if sessionToken presents, to start a meeting; option for an attendee
    sessionToken: null, // optional if username/userPassword presents, to start a meeting; option for an attendee

    apiToken:     null, // Mandatory, an apitoken to gain the access the meeting service using this SDK
  },

  // default session parameter.
  // (1) For joinMeeting, omitted the session parameters will take the default values while for updateMeeting,
  //     each parameter or session shall be specified.
  // (2) To disable a session parameter, set it to false and to enable the session parameter, either set it true
  //     to take the default values or specify the parameters.
  defaultSessionParam: function() {
    return {
      audio: {recv: true, send: true, viaVoIP: true, muteOnEntry:false}, // fallback to telephone
      video: {
        recv: {height: 720, width: 1280, bitrate: 1920000, chnNum: 7},
        send: false, //{height: 720, width: 1280, bitrate: 192000}, // recv must true to send
      },
      sharing: {
        recv: true,
        send: false,
        // {frameRate: 5},
      },
      chat: null,
      polling: null,

      autoSubscribe: true, // will subscribe the streams available from each participants
      // .... (TODO)
    }
  },

  // return results from joinMeeting, addSession, etc. irrelevant parameters may be omitted
    jmResults: {
      type: 'joinMeeting',     // (mandatory)
      meetingKey: 0,           // (mandatory) a 9-digit meeting key

      // (mandatory for the first callback) "success", "failure", "close", "InProgress", "meetingLocked", and "in-lobby".
      // (optional for followed up callback)
      status:  "success",

      // (optional) audio tag array with index given by peerId from 0 to MAX_AUDIO_RECV_CHAN -1
      // audio: [] to indicate the audio session is closed.
      audio:   [{mediaElem:{}, peerId: 0}],

      // (optional) video object array,
      //   video: []  to indicate the video session is closed.
      //   mediaElem: the video element created with createElement("video")
      //   action:    (optional) "new|refresh", with default "new". "refresh" to mean a new video element is created for
      //                the given video object identified with peerId.
      //   peerId:    the video index from 0 to to MAX_VIDEO_RECV_CHAN,
      //   nodeId:    the user id when state != "idle", which can be used to identify the user from the roster
      //   state:     the video object state including
      //     idle :      not assigned any user,
      //     assigned:   assigned to a user identified with nodeId and set with avatar
      //     liveStream: assigned to a user and receiving the live stream from the user
      //     hidden:     assigned to a user and not expected to show
      //     selfLiveStream:  assigned to the client itself of the cam video
      video:   [{mediaElem:{}, action: "new|flush", peerId: 0, nodeId: 0, state:'idle|assigned|liveStream|avatar|hidden'}],

      // (optional) video or canvas tag array for sharing (including audio), up to MAX_SHARING_RECV_CHAN
      // sharing: [] to indicate the sharing session is closed.
      sharing: [{mediaElem:{}, action: "new", peerId: 0, state:'idle|assigned|liveStream'}],

      msg:     "",         // (mandatory for msg for non-failure)
      errMsg:  "",         // (mandatory for error msg for failure)
      data:    {},         // (optional) in progress data
    },


  /**
   * This is the main function to join or start a meeting.
   * @param meetingParam a meeting parameter set defined in defaultMeetingParam.
   * @param sessionParam a session parameter set defined in defaultSessionParam. default parameters for null
   * @param cbFunc       callback function with the returned data defined in jmResults ;
   * @returns {number} 0: success; none-zero: error code for failure
   */
  joinMeeting: function(meetingParam, sessionParam, cbFunc) {
    return webexSDKImpl.joinMeeting(meetingParam, sessionParam, cbFunc);
  },

  /**
   * to update meeting with given session parameter. The callback function is given in joinMeeting()
   * @param meetingKey    the meetingKey with which the meeting is to update
   * @param sessionParam a session parameter set defined in defaultSessionParam
   * @returns {number} 0: success; none-zero: error code for failure
   */
  updateMeeting: function(meetingKey, sessionParam) {
    return webexSDKImpl.updateMeeting(meetingKey, sessionParam);
  },

  /**
   * To leave an existing meeting created/joined with joinMeeting()
   *
   * @param meetingKey    the meetingKey with which the meeting is to leave
   * @returns {number} 0: success; none-zero: error code for failure
   */
  leaveMeeting:function(meetingKey) {return webexSDKImpl.leaveMeeting(meetingKey);},

  /**
   * To end an existing meeting created/joined with joinMeeting()
   *
   * @param meetingKey    the meetingKey with which the meeting is to update
   * @returns {number} 0: success; none-zero: error code for failure
   */
  endMeeting:function(meetingKey) {return webexSDKImpl.endMeeting(meetingKey);},

  // default statuses to monitor. All of parameters are optional and status not presented is treated as no-effect
  defaultMonitoredStatues: function() {
    return {
      meetingKey: 0,
      meeting: true,  // or false for the meeting health
      roster: true,  // or false for roster status (add/delete/...)
      speaking: {topSize: 3},  // true or false for user speaking list in order with up to topSize. ,
      mic: true,  // mic list/add/delete
      speaker: true,  // speaker list/add/delete
      micVolume: {interval: 0}, // mic volume change monitoring at interval in ms. 0 to disable
      cam: true,  // cam list/add/delete
      preview: false, // preview the selected or default cam
      // more TODO
    }
  },

  // callback result for monitorMeeting
  mmResults: {
    type: 'monitorMeeting',  // (mandatory)
    meetingKey: 0,           // (mandatory) a 9-digit meeting key

    // (optional) roster array with one entry for each participant
    //   action:     "add" for the user to add, "delete" for the user to delete, "update" for the user to update
    //   nodeId:     a 32-bit number to identify the user
    //   userName:   the user displayed name
    //   userEmail:  the user email
    //   type:       could be one or combined one of "presenter", "host", "attendee" or "panelist"
    //   mic:        true or false to tell if the user has a mic installed (may or may not muted)
    //   audioMuted: true or false to tell if the user is sending out audio (or muted or unmuted)
    //   cam:        true or false to tell if the user has a cam installed (may or may not sending out video)
    //   videoMuted: true or false to tell if the user is sending out video
    //   activeVideo: true or false to tell if the user is active video
    roster: [{action:"add", nodeId:0, userName: "", userEmail: "", type:"presenter|host",
              mic:true, audioMuted:true, cam:true, videoMuted:true, activeVideo:true}],

    mic: [],          // an array one entry for each local mic
                      //   {action:"list|add|delete|muted|unmuted", label:null, name:null, id:null, default:true/false}
    speaker: [],      // an array one entry for each local speaker
                      //   {action:"list|add|delete|muted|unmuted", label:null, name:null, id:null, default:true/false}
    cam: [],          // an array one entry for each local cam
                      // {action:"list|add|delete", label:null, id:null, default:true/false}
    micVolume: 0,     // mic volume at the Cur time for the selected mic.

    speaking: [],     // speaker user list in loudest order {nodeId:""}
    preview: null,     // selected or default cam video tag

  },


  /**
   * to monitor the meeting status. The status is returned from the callback functions given in joinMeeting()
   * @param meetingKey    the meetingKey with which the meeting is to monitor
   * @param statusMonitored a status list to be monitored defined in defaultMonitoredStatus
   * @returns {number} 0: success; none-zero: error code for failure
   */
  monitorMeeting: function(statusMonitored) {
    return webexSDKImpl.monitorMeeting(statusMonitored)
  },

  // meeting items manipulated. The nodeId is used to identify the user which could be obtained from
  // roster returned in mmResults from the monitoring data. All of parameters are optional and item
  // not presented is treated as no-effect
  controlMeetingAction: {
    // action="muteAll|unmuteAll" to mute|unmute all participants (subject to privilege).
    muteAll:   "muteAll",    //  actionItem ignored
    unmuteAll: "unmuteAll",  //  actionItem ignored

    // action="mute|unmute" to mute|unmute a user (subject to privilege). NodeId could be obtained from roster
    // with nodeId=0 for the self client
    mute:   "mute",         // actionItem = nodeId, 0 for default
    unmute: "unmute",       // actionItem = nodeId, 0 for default

    // action="kickout" to expel a user from the meeting (subject to privilege)
    kickout: "kickout",     // actionItem = nodeId != 0,

    // action="admit" to admit a user to the meeting (subject to privilege)
    admit:   "admit",       // actionItem = nodeId, 0 default for all of users in lobby

    // action="lock|unlock" the meeting (subject to privilege)
    lock:    "lock",        //  actionItem ignored
    unlock:  "unlock",      //  actionItem ignored

    // action="callout" to call out a user on telephone(subject to telephone support)
    callout: "callout",     // actionItem = {nodeId:0, url:0},

    // ... TODO
  },

  /**
   * callback function result for controlMeeting
   */

  /**
   * control the meeting behavior for such as kicking-out user, admit the lobby user, etc.
   * Note some actions may be applied to all meetings.
   *
   * @param meetingKey  the meetingKey with which the meeting is to leave
   * @param action     the action to carry out
   * @param resultCB   null or callback function with the returned data specified in controlMeetingAction.
   * @returns {number} 0: success; none-zero: error code for failure
   */
  controlMeeting: function(meetingKey, action, actionItem, resultCB) {
    return webexSDKImpl.controlMeeting(meetingKey, action, actionItem, resultCB);
  },

  // device/media items controlled. All of parameters are optional and item not presented is treated as no-effect
  controlDeviceAction: {
    setSpeakerVolume:"setSpeakerVolume", // actionItem = volume, 50 for default with range of 0-100.
    getSpeakerVolume:"setSpeakerVolume", // actionItem = {volume:returned-volume},
    muteSpeaker:     "muteSpeaker",      // actionItem ignored
    unmuteSpeaker:   "unmuteSpeaker",    // actionItem ignored
    setMicLevel:     "setMicLevel",      // actionItem = level, 50 for default with range of 0-100.
    getMicLevel:     "getMicLevel",      // actionItem = {level: returned-level},
    muteMic:         "muteMic",          // actionItem ignored. local mute only, not exposed to the meeting.
    unmuteMic:       "unmuteMic",        // actionItem ignored. local unmute only, not exposed to the meeting.

    // get mic list with results [{label:"...", name:"...", id:"...", default:true|false},...]
    getMicList:      "getMicList",       // actionItem ignored. resultCB:function(micList array)
    setCurMic:       "setCurMic",        // actionItem = micId 0 for default (from the mic array in mmResults)
    getCurMic:       "getCurMic",        // actionItem = {micId: returned-micId} with -1 for not available

    // get speaker list with results [{label:"...", name:"...", id:"...", default:true|false},...]
    getSpeakerList:  "getSpeakerList",   // actionItem ignored. resultCB:function(spklist array)
    setCurSpeaker:   "setCurSpeaker",    // actionItem = speakerId: 0 for default (from the speaker array in mmResults)
    getCurSpeaker:   "getCurSpeaker",    // actionItem = {spkId: returned-speakerId} with -1 for not available

    // get cam list with results [{label:"...", name:"...", id:"...", default:true|false},...]
    getCamList:      "getCamList",       // actionItem ignored. resultCB:function(camList array)
    setCurCam:       "setCurCam",        // actionItem = camId: 0 for default (from the camId array in mmResults)
    getCurCam:       "getCurCam",        // actionItem = {cmdId: returned-camId} with -1 for not available
  },


  /**
   * callback function result for controlDevice and controlMedia
   */

  /**
   * To control the device and media stream.
   * Note some actions may be applied to all meetings.
   *
   * @param meetingKey  the meetingKey with which the meeting is to leave
   * @param action     the action with parameters or returned parameters to carry out
   * @param resultCB   null or callback function with the returned data defined in controlMeetingAction.
   */
  controlDevice: function(meetingKey, action, actionItem, resultCB) {
    return webexSDKImpl.controlDevice(meetingKey, action,  actionItem, resultCB)
  },
  controlMedia: function(meetingKey, action,  actionItem, resultCB) {
    return webexSDKImpl.controlDevice(meetingKey, action,  actionItem, resultCB)
  },

  // ----------- Pre/Post meeting ---------------
  // .....

  // ----------- site Operations ----------------
  // ...

  // ---------- Environments --------------------
  /**
   * To get the running environment including running platform OS, browser type, WebRTC
   * support, etc.
   *
   * @returns {*} the running environment which is defined as
   *
   */
  getEnv: function() { return webexSDKImpl.getEnv();},

  // -------- Tracing ---------------------------

  traceLevelDef: {
    TRACE_LEVEL_OFF: 0,
    TRACE_LEVEL_ERROR: 1,
    TRACE_LEVEL_WARN: 2,
    TRACE_LEVEL_INFO: 3,
    TRACE_LEVEL_DEBUG: 4,
    TRACE_LEVEL_VERBOSE: 5,
    TRACE_LEVEL_ALL: 8,
    TRACE_LEVEL_DEFAULT: 3
  },

  errorCode: {
    OK:           0,
    SUCCESS:      0,
    ERROR:        1,
    FATAL_ERROR: -1,

    // parameters in initialization
    SESSION_PARAMETERS_NOT_SET: 100,
    INVALID_SESSION_PARAMETERS: 101,
    INVALID_MEETING_KEY:        102,
    INVALID_MEETING_PARAMETERS: 103,
    INVALID_SITE_URL:           104,
    INVALID_EMAIL:              105,
    INVALID_USERNAME_PASSWORD:  106,

    INVALID_ACTION_PARAMETERS:  120,

    // join meeting
    FAILURE_JOIN_CONFERENCE:    200,
    FAILURE_LEAVE_CONFERENCE:   201,
  },

  /**
   * To set the trace level for on-going running code. The initial trace level could be given in
   * SDK loading <script>
   *
   * @param level  the trace level as defined in traceLevelDef
   */
  setTraceLevel: function(level) { webexSDKImpl.setTraceLevel(level);},

  /**
   * To get the trace level as defined in traceLevelDef
   * @returns {*}
   */
  getTraceLevel: function () { return webexSDKImpl.getTraceLevel();},

  /**
   * close all of connections and clear up internal parameters and set to the initial state.
   * @returns {WebexSDK.resetSDK|(function())}
   */
  resetSDK: function () { return webexSDKImpl.resetSDK();},

  /**
   * set proxy server
   * @param {string} proxyAddr - proxy address such as abc.com:443 or abc.com
   * @param {number} port      - the port number if not given in proxyAddr
   */
  setProxy: function (proxyAddr, port) { webexSDKImpl.setProxy(proxyAddr, port);},
};
window.WebexSDK  = WebexSDK;
export default WebexSDK;
webexSDKImpl._init();
