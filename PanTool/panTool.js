/*
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

/**
 ************************************************************************************
 * @file PanTool.js
 * @author Duanpei Wu; duanpei@cisco.com
 * @version 1.0
 *
 ************************************************************************************/
let meetingInfo = document.getElementById("meetingInfo");
let runPanel = document.getElementById("runPanel");
let userRoster = document.getElementById("userRoster");
let userNameInRoster = document.getElementById("userNameInRoster");
let muteMicRosterChecked = document.getElementById("muteMicRosterChecked");
let recvChatText = document.getElementById("recvChatText");
let sendChatText = document.getElementById("sendChatText");
let toWhom = document.getElementById("toWhom");
let sendChatButton = document.getElementById("sendChatButton");
let camList = null;

// buttons
let joinMeetingButton = document.getElementById('JoinMeeting');
let leaveMeetingButton = document.getElementById('LeaveMeeting');
let sendVideoButton = document.getElementById('sendVideo');
let muteAudioCheck = document.getElementById('muteCheck');
let muteAllAudioCheck = document.getElementById('muteAllCheck');

// session parameter
let audioRecvFlag = document.getElementById("audioRecvFlag");
let audioSendFlag = document.getElementById("audioSendFlag");
audioRecvFlag.onclick = function(){
  if (audioSendFlag.checked) {
    audioRecvFlag.checked = true;
  }
};
audioSendFlag.onclick = function(){
  if (audioSendFlag.checked) {
    audioRecvFlag.checked = true; // need audio receiving enabled.
  }
};

let audioViaVoIP = document.getElementById("audioViaVoIP"); // use VoIP only
let audioMuteOnEntry = document.getElementById("audioMuteOnEntry");

let videoRecvFlag = document.getElementById("videoRecvFlag");
let RecvHeight = document.getElementById("RecvHeight");
let RecvBitrate = document.getElementById("RecvBitrate");
let RecvChuNum = document.getElementById("RecvChuNum");

let videoSendFlag = document.getElementById("videoSendFlag");
let SendHeight = document.getElementById("SendHeight");
let SendBitrate = document.getElementById("SendBitrate");

videoRecvFlag.onclick = function(){
  if (videoSendFlag.checked) {
    videoRecvFlag.checked = true;
  }
};

function updateButterText() {
  sendVideoButton.innerHTML = (videoSendFlag.checked)? 'stop Send Video':'start Send Video';
  sendVideoButton.innerHTML = (videoSendFlag.checked)? 'stop Send Video':'start Send Video';
}

videoSendFlag.onclick = function(){
  if (videoSendFlag.checked) {
    videoRecvFlag.checked = true; // need video receiving enabled.
  }
};

let sharingRecvFlag = document.getElementById("sharingRecvFlag");
let sharingSendFlag = document.getElementById("sharingSendFlag");
let sharingFrameRate = document.getElementById("sharingFrameRate");

sharingRecvFlag.onclick = function(){
  if (sharingSendFlag.checked) {
    sharingRecvFlag.checked = true;
  }
};
sharingSendFlag.onclick = function(){
  if (sharingSendFlag.checked) {
    sharingRecvFlag.checked = true; // need video receiving enabled.
  }
};
let autoSubFlag = document.getElementById("autoSubFlag");


// set initial values
let siteUrlInput = document.getElementById("siteUrlInput");
let meetingKeyInput = document.getElementById("meetingKey");
let meetingPw = document.getElementById("meetingPw");
let siteUrlSel = document.getElementById("siteUrl");
let sessionToken = document.getElementById("sessionToken");
let userDisplayName = document.getElementById("userDisplayName");
let userEmail = document.getElementById("email");
let userName = document.getElementById("userName");
let userPassword = document.getElementById("userPassword");

meetingKeyInput.value = siteUrlSel.options[siteUrlSel.selectedIndex].id;
siteUrlInput.value = siteUrlSel.value;
siteUrlSel.onclick = function() {
  siteUrlInput.value = siteUrlSel.value;
  meetingKeyInput.value = siteUrlSel.options[siteUrlSel.selectedIndex].id;
};

// running panel
let liveVideo = document.getElementById("liveVideo");
let liveVideoText = document.getElementById("liveVideoText");
let liveVideoLabel = document.getElementById("liveVideoLabel");

let videoThumb = [];
let videoThumbText = [];
let videoThumbLabel = [];
videoThumb[0] = liveVideo;
videoThumbText[0] = liveVideoText;
videoThumbLabel[0] = liveVideoLabel;
for (let i=1; i< 7; i++) {
  videoThumb[i] = document.getElementById("videoThumb"+i);
  videoThumbText[i] = document.getElementById("videoThumbText"+i);
  videoThumbLabel[i] = document.getElementById("videoThumbLabel"+i);
}
let liveAudio = [];
for (let i=0; i < 4; i++) {
  liveAudio[i] = document.getElementById("liveAudio" + i);
}

// ---------------- UI ----------------------
let audioObject = null;
let videoObject = null;

function setInitAudioDisplay() {
  for (let i =0; i< liveAudio.length; i++) {
    liveAudio[i].setAttribute("hidden", true);
    liveAudio[i].innerHTML = "";
  }
  if (Array.isArray(audioObject)) {
    for (let i = 0; i < audioObject.length; i++) {
      audioObject[i].mediaElement && audioObject[i].mediaElement.pause();
      audioObject[i].mediaElement = null;
    }
  }
  audioObject = null;
}

function setInitVideoDisplay() {

  // live video
  videoThumbText[0].removeAttribute("hidden");
  videoThumbText[0].style.width = '810px';
  videoThumbText[0].style.height = '480px';
  videoThumb[0].setAttribute("hidden", true);
  videoThumb[0].innerHTML = "";
  videoThumbLabel[0].innerHTML = "no body";

  if (Array.isArray(videoObject)) {
    for (let i=0; i< videoObject.length; i++) {
      videoObject[i].mediaElement && videoObject[i].mediaElement.pause();
      videoObject[i].mediaElement = null;
    }
  }

  for (let i =1; i< videoThumbLabel.length; i++) {

    videoThumb[i].innerHTML = "";
    videoThumb[i].setAttribute("hidden", true);
    videoThumbText[i].setAttribute("hidden", true);
    videoThumbLabel[i].setAttribute("hidden", true);
    videoThumbLabel[i].innerHTML = "";
  }
  videoObject = null;
}

function setInitDisplay() {
  setInitVideoDisplay();
  setInitAudioDisplay();
}

function meetingEndUIReset() {
  updateButterText();
  setInitDisplay();
  runPanel.setAttribute("hidden", true);
  meetingInfo.removeAttribute("hidden");
  userRoster.innerText = null;
  toWhom.innerText = null;
  recvChatText.innerText = null;

  // add default option
  let element = document.createElement("option");
  element.text = "Everyone";
  element.nodeId = 0;
  toWhom.add(element);

  // roster mute
  muteMicRosterChecked.checked = false;
  userNameInRoster.innerText = "";
}


function setAudioDisplay(results) {
  let audioArray = results.audio;
  if (!Array.isArray(audioArray)) { return;}

  if (audioArray.length <= 0) {
    setInitAudioDisplay();
    return;
  }

  audioObject = audioObject || [];
  let size = audioObject.length;
  audioArray.forEach(function (audio) {
    if (!audio || audio.peerId >= liveAudio.length ) { return; }
    let peerId = audio.peerId;
    if (peerId < size) { // check if a new element
      if (audio.mediaElement !== audioObject[peerId].mediaElement) { // a new one
        console.error("setAudioDisplay not supposed to be here.......");
        liveAudio[peerId].replaceChild(audio.mediaElement, liveAudio[peerId].firstChild);
        audioObject[peerId].mediaElement = audio.mediaElement;
      }
    } else {
      audioObject.push(audio);
      liveAudio[peerId].insertBefore(audio.mediaElement, liveAudio[peerId].firstChild);
      liveAudio[peerId].removeAttribute("hidden");
    }
    //audio.mediaElement.play();
    audio.mediaElement.controls = true;
    audio.mediaElement.style.width = '195px';
    audio.mediaElement.style.height = '20px';
  });
}

function amIHost() {
  let bHost = false;
  for (let i = 0; i < userRoster.length; i++) {
    if (userRoster[i].userInfo.bHost && userRoster[i].userInfo.bMe) {return true};
  }
  return false;
}

function updateWaitingStatus() {
  if (userRoster.length !== 1) { return;}

  videoThumbText[0].removeAttribute("hidden");
  videoThumb[0].setAttribute("hidden", true);
  videoThumbLabel[0].setAttribute("hidden", true);
  videoThumbText[0].innerHTML = amIHost()? "Waiting for participants to join" : "Waiting for the host to join";
}

function setVideoDisplay(results) {
  let videoArray = results.video;
  if (!Array.isArray(videoArray)) { return;}

  if (videoArray.length <= 0) {
    setInitVideoDisplay();
    return;
  }

  videoObject = videoObject || [];
  let size = videoObject.length;
  videoArray.forEach(function (video) {
    if (!video || video.peerId >= videoThumb.length ) { return; }
    let peerId = video.peerId;
    if (peerId < size) { // check if a new element
      if (video.mediaElement !== videoObject[peerId].mediaElement) { // a refreshed one
        console.error("setVideoDisplay not supposed to be here.......");
        videoThumb[peerId].replaceChild(video.mediaElement, videoThumb[peerId].firstChild);
        videoThumb[peerId].mediaElement = video.mediaElement;
      }
    } else {
      videoObject.push(video);
      videoThumb[peerId].insertBefore(video.mediaElement, videoThumb[peerId].firstChild);
    }
    //video.mediaElement.controls = true;
    video.mediaElement.style.width = (peerId===0)?'810px':'130px';
    video.mediaElement.style.height =(peerId===0)?'480px':'100px';
    if (!video.state.match(/idle/i)) {
      videoThumbText[peerId].setAttribute("hidden", "true");
      videoThumb[peerId].removeAttribute("hidden");
      videoThumbLabel[peerId].innerHTML = getUserName(video.nodeId);
      videoThumbLabel[peerId].removeAttribute("hidden");
      //video.mediaElement.play();

    } else if (peerId !== 0) {
      //videoThumbText[peerId].removeAttribute("hidden");
      videoThumb[peerId].setAttribute("hidden", true);
      videoThumbLabel[peerId].innerHTML = "";
      videoThumbLabel[peerId].setAttribute("hidden", true);

      //video.mediaElement.pause();
    } else { // peerId = 0 and is idle
      updateWaitingStatus();
    }
  });
}

function setSharingDisplay(results) {
  return; // later
}

function setDisplay(results) {
  setAudioDisplay(results);
  setVideoDisplay(results);
  setSharingDisplay(results);
}

function getUserString(userInfo) {
  let userLine = userInfo.activeVideo?"(*) ": "";
  userLine += userInfo.userName + ":" + userInfo.nodeId +((userInfo.bHost) ? "(H" : '(');
  userLine += (userInfo.bPresenter) ? "P" : '';
  userLine += (userInfo.bMe) ? "M" : '';
  userLine += (userInfo.bSpeaking) ? "S)" : ')';
  userLine += !userInfo.mic ? '' : userInfo.audioMuted ? " mic(muted)" : " mic(on)";
  userLine += !userInfo.cam ? '' : userInfo.videoMuted ? " cam(muted)" : " cam(on)";
  return userLine;
}

function handleRoster(roster) {
  roster.forEach(function (user) {
    if (!user) { return;}
    if (user.action.match(/add/i)) {
      addUser(user.userInfo);
    } else if (user.action.match(/update/i)) {
      updateUser(user.userInfo);
    } else if (user.action.match(/delete/i)) {
      removeUser(user.userInfo);
    }

  });

  updateWaitingStatus();

  function addUser(userInfo) {
    let element = document.createElement("option");
    element.text = getUserString(userInfo);
    element.userInfo = userInfo;
    userRoster.add(element);

    // update the mute toggle
    if (userInfo.audioMuted !== undefined && userInfo.bMe) {
      muteAudioCheck.checked = userInfo.audioMuted;
    }

    let element2 = document.createElement("option");
    element2.text = userInfo.userName;
    element2.nodeId = userInfo.nodeId;
    toWhom.add(element2);

  }

  function removeUser(userInfo) {
    for (let i = 0; i < userRoster.length; i++) {
      if (userRoster[i].userInfo.nodeId == (userInfo.nodeId)) {
        userRoster.remove(i);
        toWhom.remove(i+1);
        break;
      }
    }
  }

  function updateUser(userInfo) {
    let user = null;
    for (let i = 0; i < userRoster.length; i++) {
      if (userRoster[i].userInfo.nodeId === (userInfo.nodeId)) {
        user = userRoster[i];
        break;
      }
    }
    if (!user) {
      console.log("updateUser user not exist userInfo = ", userInfo);
      return;
    }
    for (let item in userInfo) {
      user.userInfo[item] = userInfo[item];
    }
    user.text = getUserString(user.userInfo);

    // update the mute toggle
    if (userInfo.audioMuted !== undefined && user.userInfo.bMe) {
      muteAudioCheck.checked = userInfo.audioMuted;
    }
  }
}

function getUserName(nodeId) {
  let userName ="empty";
  for (let i = 0; i<userRoster.length; i++) {
    user = userRoster[i];
    if (user.userInfo.nodeId === nodeId) {
      userName = user.userInfo.userName;
      break;
    }
  }
  return userName;
}


let chatPriviledge = "";
function handleChatMsg(data) {
  if (data.privilege) {
    chatPriviledge = data.privilege;
    return;
  }
  if (data.message) {
    let sender = getUserName(data.message.senderId);
    let displayedMsg = "From " + sender + " " + data.message.scope + " >" + data.message.data;
    let element = document.createElement("option");
    element.text = displayedMsg;
    recvChatText.add(element);
  }
}

// --------------- API calls and callback ------------------------------------------

// functions
let status = "";

/**
 * called when the SDK loading is completed.
 *
 * @param {object} results show load status: "SUCCESS" for success, "FAIL" for failure and "LOADING" for loading in progress
 */
function onSdkLoaded(results) {
  status = results.status;
  console.log('onSdkLoaded:' + status + " with msg " + results.msg);
  if (status === "LOADING") {// loading in progress
  } else if (status === "SUCCESS") {
  } else if (status === "FAIL") {
  } else if (status === "CLOSE") {
  } else {
    console.log("unknown status from loading WebEx WebApp SDK");
  }
  return true;
}

/**
 * Join the meeting with the given parameters, meeting key, user id, site URL
 */
function onLoadingSuccess(results) {

  console.log("WebexSDK.joinMeeting at onLoadingSuccess");
  let meetingParam = {
    meetingKey:meetingKeyInput.value,
    userEmail:userEmail.value,
    siteURL:siteUrlInput.value,
    password:meetingPw.value,
    userName:userName.value,
    userPassword: userPassword.value,
    userDisplayName: userDisplayName.value,
    sessionToken: sessionToken.value // TODO
  };

  let sessionParam = {
    audio:{recv:audioRecvFlag.checked, send:audioSendFlag.checked,
      viaVoIP:audioViaVoIP.checked, muteOnEntry:audioMuteOnEntry.checked},
    autoSubFlag:autoSubFlag.checked,
    video: {recv:false, send:false},
    sharing: {recv:sharingRecvFlag.checked, send:false},
  };
  if (videoRecvFlag.checked) {
    sessionParam.video.recv = {height:RecvHeight.value, bitrate:RecvBitrate.value, chnNum:RecvChuNum.value};
  }
  if (videoSendFlag.checked) {
    sessionParam.video.send = {height:SendHeight.value, bitrate:SendBitrate.value};
  }
  if (sharingSendFlag.checked) {
    sessionParam.sharing.send = {framerate:sharingFrameRate.value};
  }

  if (sessionParam.audio.send) {
    sessionParam.audio.muteOnEntry = audioMuteOnEntry.checked;
  }

  muteAudioCheck.checked = sessionParam.audio.muteOnEntry;

  // now join the meeting
  let rv = WebexSDK.joinMeeting(meetingParam, sessionParam, meetingCbFunc);
  console.log("WebexSDK.joinMeeting return rv = ", rv);

  /**
   * functions for all of callback
   * @param results
   */
  function meetingCbFunc(results) {
    console.log("meetingCbFunc =", JSON.stringify(results));
    if (/monitorMeeting/i.test(results.type)) {
      if (!results.meetingStatus || !results.meetingStatus.match(/failure/i)) {
        if (results.roster) {
          handleRoster(results.roster);

        } else if (results.cam) {
          console.log("cam = ", results.cam);
          camList =  results.cam;

        } else if (results.chat) {
          console.log("results = ", results.chat);
          handleChatMsg(results.chat);

        } else if (results.meetingStatus && results.meetingStatus.match(/end/i)) {
          meetingEndUIReset();
        }
      }
    }
    else if (/joinMeetingUpdate/i.test(results.type)) {
      console.log("WebexSDK.joinMeeting update: " + results);
      setDisplay(results);

    } else if (/joinMeeting/i.test(results.type)) {
      if (results.status.match(/failure/i)) {
        console.error("WebexSDK.joinMeeting meetingKey = ", results.meetingKey,
          " failed with error message ", results.errMsg);
        // rejoin-in ...
        return;
      }

      // in progress or success
      setDisplay(results);
      if (results.status.match(/success/i)) {
        console.log("WebexSDK.joinMeeting success " + JSON.stringify(results));
        this.bCompleted = true;
      } else {
        console.log("WebexSDK.joinMeeting: status:" + JSON.stringify(results));
      }
    }
  }
}

/**
 * join the meeting
 */
joinMeetingButton.onclick = function () {
  this.bCompleted = false;
  meetingInfo.setAttribute("hidden", true);
  runPanel.removeAttribute("hidden");
  updateButterText();
  setInitDisplay();
  let meetingKey = meetingKeyInput.value;
  let siteUrl = siteUrlInput.value;
  let timerId = setInterval(function () {
    if (/success/i.test(status)) {
      clearInterval(timerId);
      onLoadingSuccess();
    } else if (/fail/i.test(status)) {
      clearInterval(timerId);
      console.error("Failed to join the meeting\n" +
        "meetingKey:" + meetingKey + "\n" +
        "user:" + user + "\n" +
        "siteUrl:" + siteUrl);
    }
  }, 200);
};

/**
 * Leave the meeting
 */
leaveMeetingButton.onclick=function () {
  if (status.match(/success/i)) {
    let meetingKey = meetingKeyInput.value;
    console.log("LeaveMeeting from" + " meetingKey:" + meetingKey + " user:" + userEmail.value +
      " siteUrl:" + siteUrlInput.value);
    WebexSDK.leaveMeeting(meetingKey);
  } else {
    meetingEndUIReset();
  }
};

/**
 * send video
 */
sendVideoButton.onclick=function () {
  let bSending = videoSendFlag.checked;
  let sessionParam = {video: {send: !bSending}};
  let meetingKey = meetingKeyInput.value;
  console.log("sendVideoButton to " + " meetingKey:" + meetingKey + " user:" + userEmail.value +
    " siteUrl:" + siteUrlInput.value, " to send: " + !bSending);

  if (status.match(/success/i)) {
    let rv = WebexSDK.updateMeeting(meetingKey, sessionParam);
    bSending = (!rv)? !bSending : bSending;
  }
  videoSendFlag.checked = bSending;
  updateButterText();
};

/**
 * mute/unmute Audio
 */
muteAudioCheck.onclick=function () {
  console.log("muteAudioCheck ", muteAudioCheck.checked?"on":"off");

  let bMute = muteAudioCheck.checked;
  let action = bMute?"mute":"unmute";
  let meetingKey = meetingKeyInput.value;
  console.log("muteAudioCheck to " + " meetingKey:" + meetingKey + " user:" + userEmail.value +
    " siteUrl:" + siteUrlInput.value, " to mute: " + bMute);

  if (status.match(/success/i)) {
    let rv = WebexSDK.controlMeeting(meetingKey, action, 0);
    bMute = (!rv)? bMute : !bMute;
  }
  muteAudioCheck.checked = bMute;
};

/**
 * mute/unmute all Audio users
 */
muteAllAudioCheck.onclick=function () {
  console.log("muteAllAudioCheck ", muteAllAudioCheck.checked?"on":"off");

  let bMute = muteAllAudioCheck.checked;
  let action = bMute?"muteAll":"unmuteAll";
  let meetingKey = meetingKeyInput.value;
  console.log("muteAllAudioCheck to " + " meetingKey:" + meetingKey + " user:" + userEmail.value +
    " siteUrl:" + siteUrlInput.value, " to mute: " + bMute);

  if (status.match(/success/i)) {
    let rv = WebexSDK.controlMeeting(meetingKey, action, 0);
    bMute = (!rv)? bMute : !bMute;
  }
  muteAllAudioCheck.checked = bMute;
};



/**
 * send chat msg
 */
sendChatButton.onclick=function () {
  console.log("chat msg to send ", sendChatText.value);
  let dstNodeId = toWhom[toWhom.selectedIndex].nodeId || 0;
  let action = "sendChatMsg";
  let actionItem = {nodeId:dstNodeId, scope:"toAll", msg:sendChatText.value};
  let meetingKey = meetingKeyInput.value;
  console.log("sendChatButton to " + " meetingKey:" + meetingKey + " actionItem=", actionItem);

  if (status.match(/success/i)) {
    let rv = WebexSDK.controlMeeting(meetingKey, action, actionItem);
  }
  sendChatText.value = "";

};

userRoster.onclick = function () {
  console.log(">>>: ");
  for (let i = 0; i < userRoster.length; i++) {
    console.log(">>>: " + JSON.stringify(userRoster[i].userInfo));
  }
  let selected = userRoster.selectedIndex;
  userNameInRoster.innerText = userRoster[selected].userInfo.userName;
  muteMicRosterChecked.checked = !!userRoster[selected].userInfo.audioMuted;
};

muteMicRosterChecked.onclick = function () {
  let selected = userRoster.selectedIndex;
  if (selected < 0) {
    muteMicRosterChecked.checked = false;
    userNameInRoster.innerText = "";
    return;
  }
  userNameInRoster.innerText = userRoster[selected].userInfo.userName;
  let bMute = muteMicRosterChecked.checked;
  let action = bMute?"mute":"unmute";
  let nodeId = userRoster[selected].userInfo.nodeId;
  if (status.match(/success/i)) {
    let meetingKey = meetingKeyInput.value;
    let rv = WebexSDK.controlMeeting(meetingKey, action, nodeId);
  }

  userRoster.selectedIndex = -1;
  muteMicRosterChecked.checked = false;
  userNameInRoster.innerText = "";
};