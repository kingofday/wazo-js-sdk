import Line from '../Line';
import CallSession from '../CallSession';

export type PhoneEventCallbacks = {
  onCallIncoming?: (number: string) => void;
  onCallOutgoing?: (number: string) => void;
  onCallRinging?: () => void;
  onCallAccepted?: () => void;
  onCallHeld?: () => void;
  onCallResumed?: () => void;
  onCallMuted?: () => void;
  onCallUnmuted?: () => void;
  onCallEnded?: () => void;
  onCallFailed?: (message: string) => void;
};
type PhoneVoid = Promise<void> | void;
export type AvailablePhoneOptions = {
  accept: boolean;
  addParticipant: boolean;
  decline: boolean;
  hold: boolean;
  merge: boolean;
  mute: boolean;
  record: boolean;
  sendKey: boolean;
  transfer: boolean;
};
export interface Phone {
  accept(callSession: CallSession, enableVideo: boolean): Promise<string | null>;
  changeAudioDevice(id: string): PhoneVoid;
  changeRingDevice(id: string): PhoneVoid;
  changeAudioVolume(volume: number): PhoneVoid;
  changeRingVolume(volume: number): PhoneVoid;
  changeAudioInputDevice(id: string): Promise<MediaStream | null | undefined> | null | undefined;
  changeVideoInputDevice(id: string): Promise<MediaStream | null | undefined> | null | undefined;
  onConnectionMade(): PhoneVoid;
  close(): Promise<PhoneVoid>;
  disableRinging(): PhoneVoid;
  enableRinging(): PhoneVoid;
  endCurrentCall(CallSession: CallSession): PhoneVoid;
  getLocalStreamForCall(callSession: CallSession): MediaStream | null | undefined;
  getLocalVideoStream(callSession: CallSession): MediaStream | null | undefined;
  getOptions(): AvailablePhoneOptions;
  getRemoteStreamForCall(callSession: CallSession): MediaStream | null | undefined;
  ignore(callSession: CallSession): PhoneVoid;
  hangup(callSession: CallSession): Promise<boolean>;
  hasAnActiveCall(): boolean;
  hold(callSession: CallSession): Promise<any> | null | undefined;
  indirectTransfer(source: CallSession, destination: CallSession): Promise<boolean>;
  initiateCTIIndirectTransfer(callSession: CallSession, number: string): PhoneVoid;
  cancelCTIIndirectTransfer(transferId: string): PhoneVoid;
  confirmCTIIndirectTransfer(transferId: string): PhoneVoid;
  hasVideo(callSession: CallSession): boolean;
  hasAVideoTrack(callSession: CallSession): boolean;
  isWebRTC(): boolean;
  getUserAgent(): string;
  makeCall(number: string, line: Line, enableVideo?: boolean, audioOnly?: boolean): (CallSession | null | undefined) | Promise<CallSession | null | undefined>;
  mute(callSession: CallSession): PhoneVoid;
  reject(callSession: CallSession): PhoneVoid;
  resume(callSession: CallSession): Promise<any> | null | undefined;
  sendKey(callSession: CallSession, tone: string): PhoneVoid;
  transfer(callSession: CallSession, target: string): PhoneVoid;
  turnCameraOff(callSession: CallSession): PhoneVoid;
  turnCameraOn(callSession: CallSession): PhoneVoid;
  unmute(callSession: CallSession): PhoneVoid;
  setActiveSipSession(callSession: CallSession): PhoneVoid;
  isRegistered(): boolean;
  hasIncomingCallSession(): boolean;
  setMediaConstraints(media: MediaStreamConstraints): PhoneVoid;
}
