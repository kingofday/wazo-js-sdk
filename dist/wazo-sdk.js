!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("cross-fetch/polyfill"),require("js-base64"),require("sip.js"),require("reconnecting-websocket")):"function"==typeof define&&define.amd?define(["cross-fetch/polyfill","js-base64","sip.js","reconnecting-websocket"],t):e["@wazo/sdk"]=t(null,e.jsBase64,e.SIP,e.ReconnectingWebSocket)}(this,function(e,t,s,n){"use strict";s=s&&s.hasOwnProperty("default")?s.default:s,n=n&&n.hasOwnProperty("default")?n.default:n;class r{static fromResponse(e){return new r(e.message,e.timestamp,e.error_id,e.details)}static fromText(e){return new r(e)}constructor(e,t=null,s=null,n=null){this.message=e,this.timestamp=t,this.errorId=s,this.details=n}}class i{static hasDebug(){return 1==+process.env.DEBUG||"true"===process.env.DEBUG}static logRequest(e,{method:t,body:s,headers:n},r){if(!i.hasDebug())return;const{status:a}=r;let o=`${a} - curl ${"get"!==t?`-X ${t.toUpperCase()}`:""}`;Object.keys(n).forEach(e=>{o+=` -H '${e}: ${n[e]}'`}),o+=` ${e}`,s&&(o+=` -d '${s}'`),console.info(o)}}const a=["head","get","post","put","delete"];class o{static successResponseParser(e,t){return 204===e.status}static defaultParser(e,t){return e.ok?e.json().then(e=>e):(t?e.json():e.text()).then(e=>t?r.fromResponse(e):r.fromText(e))}static getHeaders(e){return e instanceof Object?e:{"X-Auth-Token":e,Accept:"application/json","Content-Type":"application/json"}}static getQueryString(e){return Object.keys(e).filter(t=>e[t]).map(t=>`${t}=${encodeURIComponent(e[t])}`).join("&")}constructor({server:e,agent:t=null}){this.server=e,this.agent=t,a.forEach(e=>{o.prototype[e]=function(...t){return t.splice(1,0,e),this.call.call(this,...t)}})}call(e,t="get",s=null,n=null,r=o.defaultParser){const a=this.computeUrl(t,e,s),l=s&&"get"!==t?JSON.stringify(s):null,c="delete"===t||"head"===t?o.successResponseParser:r,u={method:t,body:l,headers:n?o.getHeaders(n):{},agent:this.agent};return fetch(a,u).then(e=>{const t=-1!==(e.headers.get("content-type")||"").indexOf("application/json");if(i.logRequest(a,u,e),e.status>=500){return(t?e.json():e.text()).then(e=>{throw e})}return c(e,t)})}computeUrl(e,t,s){const n=`${this.baseUrl}/${t}`;return"get"===e&&s&&Object.keys(s).length?`${n}?${o.getQueryString(s)}`:n}get baseUrl(){return`https://${this.server}/api`}}var l=(e,s)=>({checkToken:t=>e.head(`${s}/token/${t}`,null,{}),authenticate:t=>e.get(`${s}/token/${t}`,null,{}),logIn(n={}){const r={backend:n.backend||"wazo_user",expiration:n.expiration||3600},i={Authorization:`Basic ${t.Base64.encode(`${n.username}:${n.password}`)}`,"Content-Type":"application/json"};return e.post(`${s}/token`,r,i)},logOut:t=>e.delete(`${s}/token/${t}`,null,{},o.successResponseParser),updatePassword(t,n,r,i){const a={new_password:i,old_password:r};return e.put(`${s}/users/${n}/password`,a,t,o.successResponseParser)},sendDeviceToken(t,n,r){const i={token:r};return e.post(`${s}/users/${n}/external/mobile`,i,t)},removeDeviceToken:(t,n)=>e.delete(`${s}/users/${n}/external/mobile`,null,t),listTenants:t=>e.get(`${s}/tenants`,null,t),createTenant:(t,n)=>e.post(`${s}/tenants`,{name:n},t),deleteTenant:(t,n)=>e.delete(`${s}/tenants/${n}`,null,t),listUsers:t=>e.get(`${s}/users`,"get",null,t),listGroups:t=>e.get(`${s}/groups`,null,t),listPolicies:t=>e.get(`${s}/policies`,null,t)}),c=(e,t)=>({answerCall(s,n,r,i,a,o){const l=`${t}/${n}/nodes`,c={calls:[{id:r}]};return e.post(l,c,s,e=>e.data.uuid).then(t=>e.post(`${l}/${t}/calls`,{context:i,exten:a,autoanswer:o},s).then(e=>({nodeUuid:t,data:e})))},calls:(s,n)=>e.get(`${t}/${n}/calls`,null,s),hangupCall(s,n,r){const i=`${t}/${n}/calls/${r}`;return e.delete(i,"delete",null,s)},playCall:(s,n,r,i,a)=>e.post(`${t}/${n}/calls/${r}/play`,{language:i,uri:a},s),addCallNodes:(s,n,r,i)=>e.put(`${t}/${n}/nodes/${r}/calls/${i}`,null,s),addNewCallNodes(s,n,r,i,a,o){const l={context:i,exten:a,autoanswer:o};return e.post(`${t}/${n}/nodes/${r}/calls`,l,s)},listCallsNodes:(s,n,r)=>e.get(`${t}/${n}/nodes/${r}`,null,s),listNodes:(s,n)=>e.get(`${t}/${n}/nodes`,null,s),removeNode:(s,n,r)=>e.delete(`${t}/${n}/nodes/${r}`,null,s),removeCallNodes:(s,n,r,i)=>e.delete(`${t}/${n}/nodes/${r}/calls/${i}`,"delete",null,s)}),u=(e,t)=>({listUsers:s=>e.get(`${t}/users`,null,s),getUser:(s,n)=>e.get(`${t}/users/${n}`,null,s),updateUser(s,n,{firstName:r,lastName:i,email:a,mobileNumber:l}){const c={firstname:r,lastname:i,email:a,mobile_phone_number:l};return e.put(`${t}/users/${n}`,c,s,o.successResponseParser)},updateForwardOption(s,n,r,i,a){const l=`${t}/users/${n}/forwards/${r}`;return e.put(l,{destination:i,enabled:a},s,o.successResponseParser)},updateDoNotDisturb(s,n,r){const i=`${t}/users/${n}/services/dnd`;return e.put(i,{enabled:r},s,o.successResponseParser)},getUserLineSip:(s,n,r)=>e.put(`${t}/users/${n}/lines/${r}/associated/endpoints/sip`,null,s),listApplications(s){const n=`${t}/applications?recurse=true`;return e.get(n,null,s)},getSIP:(s,n,r)=>e.get(`${t}/users/${n}/lines/${r}/associated/endpoints/sip`,null,s)}),d=(e,t)=>({listSubscriptions:s=>e.get(`${t}/subscriptions?recurse=true`,null,s),createSubscription(s,{tenantUuid:n,productSku:r,name:i,startDate:a,contractDate:o,autoRenew:l,term:c}){const u={product_sku:r,name:i,start_date:a,contract_date:o,auto_renew:l,term:c},d={"X-Auth-Token":s};return n&&(d["Wazo-Tenant"]=n),e.post(`${t}/subscriptions`,u,d)},getSubscription:(s,n)=>e.get(`${t}/subscriptions/${n}`,null,s),listAuthorizations:(s,n)=>e.get(`${t}/subscriptions/${n}/authorizations`,null,s),getAuthorization:(s,n,r)=>e.get(`${t}/subscriptions/${n}/authorizations/${r}`,null,s),createAuthorization(s,n,{startDate:r,term:i,service:a,rules:o,autoRenew:l}){const c=`${t}/subscriptions/${n}/authorizations`,u={start_date:r,term:i,service:a,rules:o,auto_renew:l};return e.post(c,u,s)}}),p=(e,t)=>({updatePresence:(s,n)=>e.put(`${t}/users/me/presences`,{presence:n},s,o.successResponseParser),listMessages(s,n){const r=n?{participant_user_uuid:n}:null;return e.get(`${t}/users/me/chats`,r,s)},sendMessage(s,n,r,i){const a={alias:n,message:r,to:i};return e.post(`${t}/users/me/chats`,a,s)},makeCall:(s,n)=>e.post(`${t}/users/me/calls`,{from_mobile:!0,extension:n},s),cancelCall:(s,n)=>e.delete(`${t}/users/me/calls/${n}`,null,s),listCalls:s=>e.get(`${t}/users/me/calls`,null,s),relocateCall(s,n,r,i){const a={completions:["answer"],destination:r,initiator_call:n};return i&&(a.location={line_id:i}),e.post(`${t}/users/me/relocates`,a,s)},listVoicemails:s=>e.get(`${t}/users/me/voicemails`,null,s),deleteVoicemail:(s,n)=>e.delete(`${t}/users/me/voicemails/messages/${n}`,null,s),getPresence:(s,n)=>e.get(`${t}/users/${n}/presences`,null,s),getStatus:(s,n)=>e.get(`${t}/lines/${n}/presences`,null,s)});const $=e=>({email:e.email,firstname:e.firstName,lastname:e.lastName,number:e.phoneNumber,entreprise:e.entreprise,birthday:e.birthday,address:e.address,note:e.note});var h=(e,t)=>({search:(s,n,r)=>e.get(`${t}/directories/lookup/${n}`,{term:r},s),listPersonalContacts:s=>e.get(`${t}/personal`,null,s),addContact:(s,n)=>e.post(`${t}/personal`,$(n),s),editContact:(s,n)=>e.put(`${t}/personal/${n.id}`,$(n),s),deleteContact:(s,n)=>e.delete(`${t}/personal/${n}`,null,s),listFavorites:(s,n)=>e.get(`${t}/directories/favorites/${n}`,null,s),markAsFavorite(s,n,r){const i=`${t}/directories/favorites/${n}/${r}`;return e.put(i,"put",null,s,o.successResponseParser)},removeFavorite:(s,n,r)=>e.delete(`${t}/directories/favorites/${n}/${r}`,null,s)}),g=(e,t)=>({search:(s,n,r=5)=>e.get(`${t}/users/me/cdr`,{search:n,limit:r},s),listCallLogs:(s,n,r=5)=>e.get(`${t}/users/me/cdr`,{offset:n,limit:r},s),listCallLogsFromDate:(s,n,r)=>e.get(`${t}/users/me/cdr`,{from:n,number:r},s)});const m="0.1",f="1.0",b="1.1",k="1.0",w="1.0",v="0.1",C="1.0";const y=["STATUS_NULL","STATUS_NEW","STATUS_CONNECTING","STATUS_CONNECTED","STATUS_COMPLETED"],S=e=>({caller_id_name:e.remoteIdentity.displayName,caller_id_number:e.remoteIdentity.uri.user}),_=e=>!!e.getHeader("alert-info"),N=/^\+?[0-9#*]+$/;return{WazoApiClient:class{constructor({server:e,agent:t=null}){this.updatePatemers({server:e,agent:t})}initializeEndpoints(){this.auth=l(this.client,`auth/${m}`),this.application=c(this.client,`ctid-ng/${f}/applications`),this.confd=u(this.client,`confd/${b}`),this.accessd=d(this.client,`accessd/${k}`),this.ctidng=p(this.client,`ctid-ng/${w}`),this.dird=h(this.client,`dird/${v}`),this.callLogd=g(this.client,`call-logd/${C}`)}updatePatemers({server:e,agent:t}){this.client=new o({server:e,agent:t}),this.initializeEndpoints()}},WazoWebRTCClient:class{constructor(e,t){this.config=e,this.ua=this.configureUa(),this.callback=t}configureUa(){const e=new s.Web.Simple(this.getConfig());return e.on("registered",()=>{this.callback("phone-events-registered")}),e.on("unregistered",()=>{this.callback("phone-events-unregistered")}),e.on("new",e=>{const t={callerid:S(e),autoanswer:_(e.request)};this.callback("phone-events-new",t)}),e.on("ringing",()=>{this.callback("phone-events-ringing")}),e.on("connected",()=>{this.callback("phone-events-connected")}),e.on("ended",()=>{this.callback("phone-events-ended")}),e}getConfig(){return{media:{remote:{audio:this.config.media.audio}},ua:{traceSip:!1,displayName:this.config.displayName,uri:this.config.uri,wsServers:this.config.wsServers,authorizationUser:this.config.authorizationUser,password:this.config.password,sessionDescriptionHandlerFactoryOptions:{peerConnectionOptions:{iceCheckingTimeout:500,rtcpMuxPolicy:"negotiate",rtcConfiguration:{iceServers:{urls:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"]}}}}}}}getState(){return y[this.ua.state]}call(e){N.exec(e)&&this.ua.call(e)}answer(){this.ua.answer()}reject(){this.ua.reject()}hangup(){this.ua.hangup()}close(){this.ua.ua.transport.disconnect()}},WazoWebSocketClient:class{constructor(e){this.ws_init=!1,this.callback=e.callback,this.host=e.host,this.token=e.token,this.events=e.events}init(){const e=new n(`wss://${this.host}/api/websocketd/?token=${this.token}`);return e.debug=!1,e.onmessage=(t=>{const s=JSON.parse(t.data);this.ws_init?this.callback(s):this.initialize(s,e)}),e.onclose=(e=>{e.code}),e}initialize(e,t){switch(e.op){case"init":this.events.forEach(e=>{const s={op:"subscribe",data:{event_name:e}};t.send(JSON.stringify(s))}),t.send(JSON.stringify({op:"start"}));break;case"subscribe":break;case"start":this.ws_init=!0}}},BadResponse:r}});
