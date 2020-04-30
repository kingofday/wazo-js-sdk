/* global window */
import Auth from './Auth';
import Phone from './Phone';
import Websocket from './Websocket';
import Room from './room/Room';
import RemoteParticipant from './room/RemoteParticipant';
import LocalParticipant from './room/LocalParticipant';
import Stream from './room/Stream';

const Wazo = {
  Auth,
  Phone,
  Websocket,
  Room,
  RemoteParticipant,
  LocalParticipant,
  Stream,
};

if (window) {
  window.Wazo = Wazo;
}
if (global) {
  global.Wazo = Wazo;
}

export default Wazo;
