// @flow
import type Inviter from 'sip.js/lib/api/inviter';
import type Invitation from 'sip.js/lib/api/invitation';
import { SessionState } from 'sip.js/lib/api/session-state';

import type SipLine from '../domain/SipLine';
import type Session from '../domain/Session';
import type CallSession from '../domain/CallSession';
import AdHocAPIConference from '../domain/AdHocAPIConference';
import WebRTCPhone, * as PHONE_EVENTS from '../domain/Phone/WebRTCPhone';
import { MESSAGE_TYPE_CHAT, MESSAGE_TYPE_SIGNAL } from '../domain/Phone/WebRTCPhone';
import WazoWebRTCClient, { events as clientEvents, transportEvents } from '../web-rtc-client';
import IssueReporter from '../service/IssueReporter';
import Emitter from '../utils/Emitter';

import Wazo from './index';

const logger = IssueReporter.loggerFor('simple-phone');
const sipLogger = IssueReporter.loggerFor('sip.js');
const protocolLogger = IssueReporter.loggerFor('sip');

const protocolDebugMessages = ['Received WebSocket text message:', 'Sending WebSocket message:'];

class Phone extends Emitter {
  client: WazoWebRTCClient;
  phone: ?WebRTCPhone;
  session: Session;
  sipLine: ?SipLine;

  ON_CHAT: string;
  ON_SIGNAL: string;
  SessionState: Object;

  constructor() {
    super();

    // Sugar syntax for `Wazo.Phone.EVENT_NAME`
    Object.keys(PHONE_EVENTS).forEach(key => {
      // $FlowFixMe
      this[key] = PHONE_EVENTS[key];
    });

    this.SessionState = SessionState;
  }

  async connect(options: Object = {}, sipLine: ?SipLine = null) {
    if (this.phone) {
      // Already connected

      // let's update media constraints if they're being fed
      if (options.media) {
        this.phone.setMediaConstraints(options.media);
      }

      return;
    }

    const server = Wazo.Auth.getHost();
    const session = Wazo.Auth.getSession();
    if (!server || !session) {
      throw new Error('Please connect to the server using `Wazo.Auth.logIn` or `Wazo.Auth.authenticate` '
        + 'before using Room.connect().');
    }

    this.session = session;
    this.sipLine = sipLine || this.getPrimaryWebRtcLine();

    if (!this.sipLine) {
      throw new Error('Sorry, no sip lines found for this user');
    }

    this.connectWithCredentials(server, this.sipLine, session.displayName(), options);
  }

  connectWithCredentials(server: string, sipLine: SipLine, displayName: string, rawOptions: Object = {}) {
    if (this.phone) {
      // Already connected
      return;
    }
    const [host, port = 443] = server.split(':');

    const options = rawOptions;
    options.media = options.media || { audio: true, video: false };
    options.uaConfigOverrides = options.uaConfigOverrides || {};

    if (IssueReporter.enabled) {
      options.uaConfigOverrides.traceSip = true;
      options.log = options.log || {};

      options.log.builtinEnabled = false;
      options.log.logLevel = 'debug';
      options.log.connector = (level, className, label, content) => {
        const protocolIndex = content && content.indexOf
          ? protocolDebugMessages.findIndex(prefix => content.indexOf(prefix) !== -1) : -1;

        if (className === 'sip.Transport' && protocolIndex !== -1) {
          const direction = protocolIndex === 0 ? 'receiving' : 'sending';
          const message = content.replace(`${protocolDebugMessages[protocolIndex]}\n\n`, '').replace('\r\n', '\n');

          protocolLogger.trace(message, { className, direction });
        } else {
          sipLogger.trace(content, { className });
        }
      };
    }

    this.client = new WazoWebRTCClient({
      host,
      port,
      displayName,
      authorizationUser: sipLine.username,
      password: sipLine.secret,
      uri: `${sipLine.username}@${server}`,
      ...options,
    }, null, options.uaConfigOverrides);

    this.phone = new WebRTCPhone(this.client, options.audioDeviceOutput, true, options.audioDeviceRing);

    this._transferEvents();
  }

  async disconnect() {
    if (this.phone) {
      if (this.phone.hasAnActiveCall()) {
        logger.info('hangup call on disconnect');
        // $FlowFixMe
        await this.phone.hangup();
      }
      // $FlowFixMe
      await this.phone.close();
    }

    this.phone = null;
  }

  // If audioOnly is set to true, all video stream will be deactivated, even remotes ones.
  async call(extension: string, withCamera: boolean = false, rawSipLine: ?SipLine = null, audioOnly: boolean = false,
    conference: boolean = false) {
    if (!this.phone) {
      return;
    }
    const sipLine = rawSipLine || this.getPrimaryWebRtcLine();

    return this.phone.makeCall(extension, sipLine, withCamera, audioOnly, conference);
  }

  async hangup(callSession: CallSession) {
    logger.info('hangup via simple phone', { callId: callSession.getId() });

    return this.phone && this.phone.hangup(callSession);
  }

  async accept(callSession: CallSession, cameraEnabled?: boolean) {
    logger.info('accept via simple phone', { callId: callSession.getId(), cameraEnabled });

    return this.phone && this.phone.accept(callSession, cameraEnabled);
  }

  async startConference(host: CallSession, otherCalls: CallSession[]): Promise<AdHocAPIConference> {
    const participants = [host, ...otherCalls].reduce((acc: Object, participant: CallSession) => {
      acc[participant.getTalkingToIds()[0]] = participant;
      return acc;
    }, {});

    if (!this.phone) {
      return Promise.reject();
    }

    const adHocConference = new AdHocAPIConference({ phone: this.phone, host, participants });

    return adHocConference.start();
  }

  mute(callSession: CallSession) {
    this.muteViaAPI(callSession);
    return this.phone && this.phone.mute(callSession);
  }

  unmute(callSession: CallSession) {
    this.unmuteViaAPI(callSession);

    return this.phone && this.phone.unmute(callSession);
  }

  muteViaAPI(callSession: CallSession) {
    if (callSession && callSession.callId) {
      Wazo.getApiClient().calld.mute(callSession.callId).catch(e => {
        logger.error('Mute via API, error', e);
      });
    }
  }

  unmuteViaAPI(callSession: CallSession) {
    if (callSession && callSession.callId) {
      Wazo.getApiClient().calld.unmute(callSession.callId).catch(e => {
        logger.error('Unmute via API, error', e);
      });
    }
  }

  hold(callSession: CallSession, isConference: boolean = false) {
    return this.phone && this.phone.hold(callSession, true, isConference);
  }

  unhold(callSession: CallSession, isConference: boolean = false) {
    return this.phone && this.phone.unhold(callSession, true, isConference);
  }

  resume(callSession: CallSession, isConference: boolean = false) {
    return this.phone && this.phone.resume(callSession, isConference);
  }

  reject(callSession: CallSession) {
    return this.phone && this.phone.reject(callSession);
  }

  transfer(callSession: CallSession, target: string) {
    return this.phone && this.phone.transfer(callSession, target);
  }

  atxfer(sipSession: Inviter | Invitation) {
    return this.phone && this.phone.atxfer(sipSession);
  }

  async reinvite(callSession: CallSession, constraints: Object = null, conference: boolean = false) {
    return this.phone ? this.phone.sendReinvite(this.phone.findSipSession(callSession), constraints, conference) : null;
  }

  useLocalVideoElement(element: HTMLVideoElement) {
    return this.phone ? this.phone.useLocalVideoElement(element) : null;
  }

  getSipSessionId(sipSession: Session): ?string {
    return this.phone ? this.phone.getSipSessionId(sipSession) : null;
  }

  sendMessage(body: string, sipSession: Inviter | Invitation = null, contentType: string = 'text/plain') {
    const toSipSession = sipSession || this.getCurrentSipSession();
    if (!toSipSession || !this.phone) {
      return null;
    }

    return this.phone.sendMessage(toSipSession, body, contentType);
  }

  sendChat(content: string, sipSession: Inviter | Invitation = null) {
    return this.sendMessage(
      JSON.stringify({ type: MESSAGE_TYPE_CHAT, content }),
      sipSession,
      'application/json',
    );
  }

  sendSignal(content: any, sipSession: Inviter | Invitation = null) {
    return this.sendMessage(
      JSON.stringify({ type: MESSAGE_TYPE_SIGNAL, content }),
      sipSession,
      'application/json',
    );
  }

  turnCameraOff(callSession: CallSession) {
    return this.phone && this.phone.turnCameraOff(callSession);
  }

  turnCameraOn(callSession: CallSession) {
    return this.phone && this.phone.turnCameraOn(callSession);
  }

  async startScreenSharing(constraints: Object, callSession?: CallSession) {
    return this.phone && this.phone.startScreenSharing(constraints, callSession);
  }

  stopScreenSharing(callSession?: CallSession, restoreLocalStream: boolean = true) {
    return this.phone && this.phone.stopScreenSharing(restoreLocalStream, callSession);
  }

  sendDTMF(tone: string, callSession: CallSession) {
    return this.phone && this.phone.sendKey(callSession, tone);
  }

  getLocalStream(callSession: CallSession) {
    return this.phone && this.phone.getLocalStream(callSession);
  }

  hasLocalVideo(callSession: CallSession) {
    return this.phone && this.phone.hasLocalVideo(callSession);
  }

  getLocalMediaStream(callSession: CallSession) {
    return this.phone && this.phone.getLocalMediaStream(callSession);
  }

  getLocalVideoStream(callSession: CallSession) {
    return this.phone && this.phone.getLocalVideoStream(callSession);
  }

  getRemoteStreams(callSession: CallSession) {
    return this.phone ? this.phone.getRemoteStreams(callSession) : [];
  }

  getRemoteVideoStreams(callSession: CallSession) {
    return this.phone ? this.phone.getRemoteVideoStreams(callSession) : [];
  }

  getRemoteAudioStreams(callSession: CallSession) {
    return this.phone ? this.phone.getRemoteAudioStreams(callSession) : [];
  }

  getRemoteStreamForCall(callSession: CallSession) {
    logger.warn('Phone.getRemoteStreamForCall is deprecated, use Phone.getRemoteStreams instead');
    return this.getRemoteStreams(callSession);
  }

  // Returns remote streams directly from the peerConnection
  getRemoteStreamsForCall(callSession: CallSession) {
    logger.warn('Phone.getRe is deprecated, use Phone.getLocalStream instead');
    return this.getLocalStream(callSession);
  }

  getRemoteVideoStreamForCall(callSession: CallSession) {
    logger.warn('Phone.getRemoteVideoStreamForCall is deprecated, use Phone.getRemoteVideoStreams instead');

    return this.getRemoteVideoStreams(callSession);
  }

  getRemoteAudioStreamForCall(callSession: CallSession) {
    logger.warn('Phone.getRemoteAudioStreamForCall is deprecated, use Phone.getRemoteAudioStreams instead');

    return this.getRemoteAudioStreamForCall(callSession);
  }

  getCurrentSipSession() {
    return this.phone ? this.phone.currentSipSession : null;
  }

  getPrimaryWebRtcLine() {
    const session = Wazo.Auth.getSession();
    return session ? session.primaryWebRtcLine() : null;
  }

  getOutputDevice() {
    return this.phone ? this.phone.audioOutputDeviceId : null;
  }

  getPrimaryLine() {
    const session = Wazo.Auth.getSession();
    return session ? session.primarySipLine() : null;
  }

  getLineById(lineId: string) {
    return this.getSipLines().find(line => line && line.id === lineId);
  }

  getSipLines() {
    const session = Wazo.Auth.getSession();
    if (!session) {
      return [];
    }

    return session.profile ? session.profile.sipLines : [];
  }

  _transferEvents() {
    this.unbind();
    [...clientEvents, ...transportEvents].forEach(event => {
      this.client.on(event, (...args) =>
        this.eventEmitter.emit.apply(this.eventEmitter.emit, [`client-${event}`, ...args]));
    });

    Object.values(PHONE_EVENTS).forEach(event => {
      if (typeof event !== 'string' || !this.phone) {
        return;
      }
      this.phone.on(event, (...args) => this.eventEmitter.emit.apply(this.eventEmitter, [event, ...args]));
    });
  }

  hasSfu() {
    return this.sipLine && this.sipLine.hasVideoConference();
  }

  checkSfu() {
    if (!this.hasSfu()) {
      throw new Error('Sorry your user is not configured to support video conference');
    }
  }
}

if (!global.wazoTelephonyInstance) {
  global.wazoTelephonyInstance = new Phone();
}

export default global.wazoTelephonyInstance;
