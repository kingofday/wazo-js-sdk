!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("cross-fetch/polyfill"),require("js-base64"),require("sip.js"),require("reconnecting-websocket")):"function"==typeof define&&define.amd?define(["cross-fetch/polyfill","js-base64","sip.js","reconnecting-websocket"],t):e["@wazo/sdk"]=t(null,e.jsBase64,e.SIP,e.ReconnectingWebSocket)}(this,function(e,t,s,n){"use strict";s=s&&s.hasOwnProperty("default")?s.default:s,n=n&&n.hasOwnProperty("default")?n.default:n;class r extends Error{static fromResponse(e,t){return new r(e.message,t,e.timestamp,e.error_id,e.details)}static fromText(e,t){return new r(e,t)}constructor(e,t,s=null,n=null,r=null){super(e),this.timestamp=s,this.status=t,this.errorId=n,this.details=r}}class i extends r{static fromResponse(e,t){return new i(e.message,t,e.timestamp,e.error_id,e.details)}static fromText(e,t){return new i(e,t)}}class a{static hasDebug(){return"undefined"!=typeof process&&(1==+process.env.DEBUG||"true"===process.env.DEBUG)}static logRequest(e,{method:t,body:s,headers:n},r){if(!a.hasDebug())return;const{status:i}=r;let o=`${i} - curl ${"get"!==t?`-X ${t.toUpperCase()}`:""}`;Object.keys(n).forEach(e=>{o+=` -H '${e}: ${n[e]}'`}),o+=` ${e}`,s&&(o+=` -d '${s}'`),console.info(o)}}const o=["head","get","post","put","delete"];class l{static successResponseParser(e,t){return 204===e.status}static defaultParser(e){return e.json().then(e=>e)}static getHeaders(e){return e instanceof Object?e:{"X-Auth-Token":e,Accept:"application/json","Content-Type":"application/json"}}static getQueryString(e){return Object.keys(e).filter(t=>e[t]).map(t=>`${t}=${encodeURIComponent(e[t])}`).join("&")}static base64Encode(e){return"undefined"!=typeof btoa?btoa(e):t.Base64.encode(e)}constructor({server:e,agent:t=null}){this.server=e,this.agent=t,o.forEach(e=>{l.prototype[e]=function(...t){return t.splice(1,0,e),this.call.call(this,...t)}})}call(e,t="get",s=null,n=null,o=l.defaultParser){const u=this.computeUrl(t,e,s),c=s&&"get"!==t?JSON.stringify(s):null,d="head"===t,h="delete"===t||d?l.successResponseParser:o,p={method:t,body:c,headers:n?l.getHeaders(n):{},agent:this.agent};return fetch(u,p).then(e=>{const t=-1!==(e.headers.get("content-type")||"").indexOf("application/json");if(a.logRequest(u,p,e),d&&e.status>=500||!d&&e.status>=400){const s=t?e.json():e.text(),n=e.status>=500?i:r;return s.then(t=>{throw"string"==typeof t?n.fromText(t,e.status):n.fromResponse(t,e.status)})}return h(e,t)})}computeUrl(e,t,s){const n=`${this.baseUrl}/${t}`;return"get"===e&&s&&Object.keys(s).length?`${n}?${l.getQueryString(s)}`:n}get baseUrl(){return`https://${this.server}/api`}}var u=(e,t)=>{const s={};return Object.getOwnPropertyNames(e).forEach(t=>{s[t]=e[t]}),new t(s)};class c{static parse(e){return new c({id:e.id,extensions:e.extensions})}static newFrom(e){return u(e,c)}constructor({id:e,extensions:t}={}){this.id=e,this.extensions=t}}const d={BUSY:"busy",NO_ANSWER:"noanswer",UNCONDITIONAL:"unconditional"};class h{static parse(e,t){return new h({destination:e.destination||"",enabled:e.enabled,key:t})}static newFrom(e){return u(e,h)}constructor({destination:e,enabled:t,key:s}={}){this.destination=e,this.enabled=t,this.key=s}setDestination(e){return this.destination=e,this}is(e){return this.key===e.key}}class p{static parse(e){return new p({id:e.uuid,firstName:e.firstName,lastName:e.lastName,email:e.email,lines:e.lines.map(e=>c.parse(e)),username:e.username,mobileNumber:e.mobile_phone_number||"",forwards:[h.parse(e.forwards.unconditional,d.UNCONDITIONAL),h.parse(e.forwards.noanswer,d.NO_ANSWER),h.parse(e.forwards.busy,d.BUSY)],doNotDisturb:e.services.dnd.enabled})}static newFrom(e){return u(e,p)}constructor({id:e,firstName:t,lastName:s,email:n,lines:r,username:i,mobileNumber:a,forwards:o,doNotDisturb:l,presence:u}={}){this.id=e,this.firstName=t,this.lastName=s,this.email=n,this.lines=r,this.username=i,this.mobileNumber=a,this.forwards=o,this.doNotDisturb=l,this.presence=u}hasId(e){return e===this.id}setMobileNumber(e){return this.mobileNumber=e,this}setForwardOption(e){const t=this.forwards.slice(),s=t.findIndex(t=>t.is(e));return t.splice(s,1,e),this.forwards=t,this}setDoNotDisturb(e){return this.doNotDisturb=e,this}setPresence(e){return this.presence=e,this}}class m{static merge(e,t){return t.map(t=>{const s=e.find(e=>e.is(t));return void 0!==s?t.merge(s):t})}static parseMany(e){return e.results.map(t=>m.parse(t,e.column_types))}static parse(e,t){return new m({name:e.column_values[t.indexOf("name")],number:e.column_values[t.indexOf("number")]||"",favorited:e.column_values[t.indexOf("favorite")],email:e.column_values[t.indexOf("email")]||"",entreprise:e.column_values[t.indexOf("entreprise")]||"",birthday:e.column_values[t.indexOf("birthday")]||"",address:e.column_values[t.indexOf("address")]||"",note:e.column_values[t.indexOf("note")]||"",endpointId:e.relations.endpoint_id,personal:e.column_values[t.indexOf("personal")],source:e.source,sourceId:e.relations.source_entry_id,uuid:e.relations.user_uuid})}static parseManyPersonal(e){return e.map(e=>m.parsePersonal(e))}static parsePersonal(e){return new m({name:`${e.firstName||e.firstname||""} ${e.lastName||e.lastname||""}`,number:e.number||"",email:e.email||"",source:"personal",sourceId:e.id,entreprise:e.entreprise||"",birthday:e.birthday||"",address:e.address||"",note:e.note||"",favorited:!1,personal:!0})}static newFrom(e){return u(e,m)}constructor({id:e,uuid:t,name:s,number:n,email:r,source:i,sourceId:a,entreprise:o,birthday:l,address:u,note:c,presence:d,status:h,endpointId:p,personal:m}={}){this.id=e,this.uuid=t,this.name=s,this.number=n,this.email=r,this.source=i,this.sourceId=a||"",this.entreprise=o,this.birthday=l,this.address=u,this.note=c,this.presence=d,this.status=h,this.endpointId=p,this.personal=m}setFavorite(e){return this.favorited=e,this}is(e){return Boolean(e)&&this.sourceId===e.sourceId&&(!this.uuid||this.uuid===e.uuid)}hasId(e){return this.uuid===e}hasNumber(e){return this.number===e}hasEndpointId(e){return this.endpointId===e}isAvailable(){return"available"===this.presence}isDoNotDisturb(){return"donotdisturb"===this.presence}isDisconnected(){return"disconnected"===this.presence}merge(e){return this.presence=e.presence,this.status=e.status,this}isIntern(){return!!this.uuid}isCallable(e){return!!this.number&&!!e&&!e.is(this)}separateName(){if(!this.name)return{firstName:"",lastName:""};const e=this.name.split(" ");return{firstName:e[0],lastName:e.slice(1).join(" ")}}}class g{static parse(e){return new g({token:e.data.token,uuid:e.data.xivo_user_uuid})}static newFrom(e){return u(e,g)}constructor({token:e,uuid:t,profile:s}={}){this.token=e,this.uuid=t,this.profile=s}is(e){return Boolean(e)&&this.uuid===e.uuid}using(e){return this.profile=e,this}displayName(){return this.profile?`${this.profile.firstName} ${this.profile.lastName}`:""}primaryLine(){return this.profile?this.profile.lines[0]:null}primaryContext(){const e=this.primaryLine();return e?e.extensions[0].context:null}primaryNumber(){const e=this.primaryLine();return e?e.extensions[0].exten:null}}var b=(e,t)=>({checkToken:s=>e.head(`${t}/token/${s}`,null,{}),authenticate:s=>e.get(`${t}/token/${s}`,null,{}).then(e=>g.parse(e)),logIn(s){const n={backend:s.backend||"wazo_user",expiration:s.expiration||3600},r={Authorization:`Basic ${l.base64Encode(`${s.username}:${s.password}`)}`,"Content-Type":"application/json"};return e.post(`${t}/token`,n,r).then(e=>g.parse(e))},logOut:s=>e.delete(`${t}/token/${s}`,null,{},l.successResponseParser),updatePassword(s,n,r,i){const a={new_password:i,old_password:r};return e.put(`${t}/users/${n}/password`,a,s,l.successResponseParser)},sendDeviceToken(s,n,r){const i={token:r};return e.post(`${t}/users/${n}/external/mobile`,i,s)},removeDeviceToken:(s,n)=>e.delete(`${t}/users/${n}/external/mobile`,null,s),getUser:(s,n)=>e.get(`${t}/users/${n}`,null,s),listTenants:s=>e.get(`${t}/tenants`,null,s),getTenant:(s,n)=>e.get(`${t}/tenants/${n}`,null,s),createTenant:(s,n)=>e.post(`${t}/tenants`,{name:n},s),deleteTenant:(s,n)=>e.delete(`${t}/tenants/${n}`,null,s),listUsers:s=>e.get(`${t}/users`,null,s),listGroups:s=>e.get(`${t}/groups`,null,s),listPolicies:s=>e.get(`${t}/policies`,null,s)}),f=(e,t)=>({answerCall(s,n,r,i,a,o){const l=`${t}/${n}/nodes`,u={calls:[{id:r}]};return e.post(l,u,s,e=>e.data.uuid).then(t=>e.post(`${l}/${t}/calls`,{context:i,exten:a,autoanswer:o},s).then(e=>({nodeUuid:t,data:e})))},calls:(s,n)=>e.get(`${t}/${n}/calls`,null,s),hangupCall(s,n,r){const i=`${t}/${n}/calls/${r}`;return e.delete(i,null,s)},playCall:(s,n,r,i,a)=>e.post(`${t}/${n}/calls/${r}/play`,{language:i,uri:a},s),addCallNodes:(s,n,r,i)=>e.put(`${t}/${n}/nodes/${r}/calls/${i}`,null,s),addNewCallNodes(s,n,r,i,a,o){const l={context:i,exten:a,autoanswer:o};return e.post(`${t}/${n}/nodes/${r}/calls`,l,s)},listCallsNodes:(s,n,r)=>e.get(`${t}/${n}/nodes/${r}`,null,s),listNodes:(s,n)=>e.get(`${t}/${n}/nodes`,null,s),removeNode:(s,n,r)=>e.delete(`${t}/${n}/nodes/${r}`,null,s),removeCallNodes:(s,n,r,i)=>e.delete(`${t}/${n}/nodes/${r}/calls/${i}`,null,s)}),$=(e,t)=>({listUsers:s=>e.get(`${t}/users`,null,s),getUser:(s,n)=>e.get(`${t}/users/${n}`,null,s).then(e=>p.parse(e)),updateUser(s,n,r){const i={firstname:r.firstName,lastname:r.lastName,email:r.email,mobile_phone_number:r.mobileNumber};return e.put(`${t}/users/${n}`,i,s,l.successResponseParser)},updateForwardOption(s,n,r,i,a){const o=`${t}/users/${n}/forwards/${r}`;return e.put(o,{destination:i,enabled:a},s,l.successResponseParser)},updateDoNotDisturb(s,n,r){const i=`${t}/users/${n}/services/dnd`;return e.put(i,{enabled:r},s,l.successResponseParser)},getUserLineSip:(s,n,r)=>e.get(`${t}/users/${n}/lines/${r}/associated/endpoints/sip`,null,s),listApplications(s){const n=`${t}/applications?recurse=true`;return e.get(n,null,s)},getSIP:(s,n,r)=>e.get(`${t}/users/${n}/lines/${r}/associated/endpoints/sip`,null,s)}),w=(e,t)=>({listSubscriptions:s=>e.get(`${t}/subscriptions?recurse=true`,null,s),createSubscription(s,{tenantUuid:n,productSku:r,name:i,startDate:a,contractDate:o,autoRenew:l,term:u}){const c={product_sku:r,name:i,start_date:a,contract_date:o,auto_renew:l,term:u},d={"X-Auth-Token":s};return n&&(d["Wazo-Tenant"]=n),e.post(`${t}/subscriptions`,c,d)},getSubscription:(s,n)=>e.get(`${t}/subscriptions/${n}`,null,s),listAuthorizations:(s,n)=>e.get(`${t}/subscriptions/${n}/authorizations`,null,s),getAuthorization:(s,n,r)=>e.get(`${t}/subscriptions/${n}/authorizations/${r}`,null,s),createAuthorization(s,n,{startDate:r,term:i,service:a,rules:o,autoRenew:l}){const u=`${t}/subscriptions/${n}/authorizations`,c={start_date:r,term:i,service:a,rules:o,auto_renew:l};return e.post(u,c,s)}});const N=()=>{const e=()=>Math.floor(65536*(1+Math.random())).toString(16).substring(1);return`${e()}${e()}-${e()}-${e()}-${e()}-${e()}${e()}${e()}`};class y{static parseMany(e){return e.items.map(e=>y.parse(e))}static parse(e){return new y({id:N(),date:new Date(e.date),message:e.msg,direction:e.direction,destination:{serverId:e.destination_server_uuid,userId:e.destination_user_uuid},source:{serverId:e.source_server_uuid,userId:e.source_user_uuid},read:!0})}static parseMessageSent(e){return new y({id:N(),date:new Date,message:e.msg,direction:"sent",destination:{serverId:e.to[0],userId:e.to[1]},source:{serverId:e.from[0],userId:e.from[1]},read:!0})}static parseMessageReceived(e){return new y({id:N(),date:new Date,message:e.msg,direction:"received",destination:{serverId:e.to[0],userId:e.to[1]},source:{serverId:e.from[0],userId:e.from[1]},read:!1})}static newFrom(e){return u(e,y)}constructor({id:e,date:t,message:s,direction:n,destination:r,source:i,read:a=!0}={}){this.id=e,this.date=t,this.message=s,this.direction=n,this.destination=r,this.source=i,this.read=a}is(e){return this.id===e.id}isIncoming(){return"received"===this.direction}acknowledge(){return this.read=!0,this}getTheOtherParty(){return"sent"===this.direction?this.destination.userId:this.source.userId}}class v{static parse(e){return new v({id:e.id,date:new Date(e.timestamp),duration:1e3*e.duration,caller:{name:e.caller_id_name,number:e.caller_id_num},unread:e.folder?"new"===e.folder.type:null})}static parseMany(e){const t=e.folders.filter(e=>"new"===e.type)[0].messages,s=e.folders.filter(e=>"old"===e.type)[0].messages;return[...t.map(e=>v.parse(e)).map(e=>e.makeAsUnRead()),...s.map(e=>v.parse(e)).map(e=>e.acknowledge())]}static newFrom(e){return u(e,v)}constructor({id:e,date:t,duration:s,caller:n}={}){this.id=e,this.date=t,this.duration=s,this.caller=n}is(e){return e&&this.id===e.id}acknowledge(){return this.unread=!1,this}makeAsUnRead(){return this.unread=!0,this}contains(e){return!e||(this.caller.name.toUpperCase().includes(e.toUpperCase())||this.caller.number.includes(e))}}class D{static parseMany(e){return e.map(e=>D.parse(e))}static parse(e){return new D({id:+e.call_id,calleeName:e.peer_caller_id_name,calleeNumber:e.peer_caller_id_number,status:e.status,startingTime:new Date(e.creation_time)})}static newFrom(e){return u(e,D)}constructor({id:e,calleeName:t,calleeNumber:s,status:n,startingTime:r}={}){this.id=e,this.calleeName=t,this.calleeNumber=s,this.status=n,this.startingTime=r}separateCalleeName(){const e=this.calleeName.split(" ");return{firstName:e[0],lastName:e.slice(1).join(" ")}}is(e){return this.id===e.id}hasACalleeName(){return this.calleeName.length>0}isUp(){return"Up"===this.status}isDown(){return"Down"===this.status}isRingingIncoming(){return"Ringing"===this.status}isRingingOutgoing(){return"Ring"===this.status}isFromTransfer(){return"Down"===this.status||"Ringing"===this.status}}var k=(e,t)=>({updatePresence:(s,n)=>e.put(`${t}/users/me/presences`,{presence:n},s,l.successResponseParser),listMessages(s,n){const r=n?{participant_user_uuid:n}:null;return e.get(`${t}/users/me/chats`,r,s).then(e=>y.parseMany(e))},sendMessage(s,n,r,i){const a={alias:n,msg:r,to:i};return e.post(`${t}/users/me/chats`,a,s)},makeCall:(s,n)=>e.post(`${t}/users/me/calls`,{from_mobile:!0,extension:n},s),cancelCall:(s,n)=>e.delete(`${t}/users/me/calls/${n}`,null,s),listCalls:s=>e.get(`${t}/users/me/calls`,null,s).then(e=>D.parseMany(e.items)),relocateCall(s,n,r,i){const a={completions:["answer"],destination:r,initiator_call:n};return i&&(a.location={line_id:i}),e.post(`${t}/users/me/relocates`,a,s)},listVoicemails:s=>e.get(`${t}/users/me/voicemails`,null,s).then(e=>v.parseMany(e)),deleteVoicemail:(s,n)=>e.delete(`${t}/users/me/voicemails/messages/${n}`,null,s),getPresence:(s,n)=>e.get(`${t}/users/${n}/presences`,null,s),getStatus:(s,n)=>e.get(`${t}/lines/${n}/presences`,null,s)});const _=e=>({email:e.email,firstname:e.firstName?e.firstName:null,lastname:e.lastName?e.lastName:null,number:e.phoneNumber?e.phoneNumber:null,entreprise:e.entreprise,birthday:e.birthday,address:e.address,note:e.note});var C=(e,t)=>({search:(s,n,r)=>e.get(`${t}/directories/lookup/${n}`,{term:r},s).then(e=>m.parseMany(e)),listPersonalContacts:s=>e.get(`${t}/personal`,null,s).then(e=>m.parseManyPersonal(e.items)),addContact:(s,n)=>e.post(`${t}/personal`,_(n),s).then(e=>m.parsePersonal(e)),editContact:(s,n)=>e.put(`${t}/personal/${n.id||""}`,_(n),s),deleteContact:(s,n)=>e.delete(`${t}/personal/${n}`,null,s),listFavorites:(s,n)=>e.get(`${t}/directories/favorites/${n}`,null,s).then(e=>m.parseMany(e)),markAsFavorite(s,n,r){const i=`${t}/directories/favorites/${n}/${r}`;return e.put(i,null,s,l.successResponseParser)},removeFavorite:(s,n,r)=>e.delete(`${t}/directories/favorites/${n}/${r}`,null,s)});class P{static merge(e,t){const s=e.concat(t);return s.map(e=>e.id).filter((e,t,s)=>s.indexOf(e)===t).map(e=>s.find(t=>t.id===e))}static parseMany(e){return e.items.map(e=>P.parse(e))}static parse(e){return new P({answer:new Date(e.answer),answered:e.answered,callDirection:e.call_direction,destination:{extension:e.destination_extension,name:e.destination_name||""},source:{extension:e.source_extension,name:e.source_name},id:e.id,duration:1e3*(e.duration||0),start:new Date(e.start),end:new Date(e.end)})}static parseNew(e,t){return new P({answer:new Date(e.answer),answered:e.answered,callDirection:e.call_direction,destination:{extension:e.destination_extension,name:e.destination_name||""},source:{extension:e.source_extension,name:e.source_name},id:e.id,duration:1e3*(e.duration||0),start:new Date(e.start),end:new Date(e.end),newMissedCall:e.destination_extension===t.primaryNumber()&&!e.answered})}static newFrom(e){return u(e,P)}constructor({answer:e,answered:t,callDirection:s,destination:n,source:r,id:i,duration:a,start:o,end:l}={}){this.answer=e,this.answered=t,this.callDirection=s,this.destination=n,this.source=r,this.id=i,this.duration=a,this.start=o,this.end=l}isFromSameParty(e,t){return this.theOtherParty(t).extension===e.theOtherParty(t).extension}theOtherParty(e){return this.source.extension===e.primaryNumber()?this.destination:this.source}isNewMissedCall(){return this.newMissedCall}acknowledgeCall(){return this.newMissedCall=!1,this}isAcknowledged(){return this.newMissedCall}isAnOutgoingCall(e){return this.source.extension===e.primaryNumber()&&this.answered}isAMissedOutgoingCall(e){return this.source.extension===e.primaryNumber()&&!this.answered}isAnIncomingCall(e){return this.destination.extension===e.primaryNumber()&&this.answered}isADeclinedCall(e){return this.destination.extension===e.primaryNumber()&&!this.answered}}var S=(e,t)=>({search:(s,n,r=5)=>e.get(`${t}/users/me/cdr`,{search:n,limit:r},s).then(e=>P.parseMany(e)),listCallLogs:(s,n,r=5)=>e.get(`${t}/users/me/cdr`,{offset:n,limit:r},s).then(e=>P.parseMany(e)),listCallLogsFromDate:(s,n,r)=>e.get(`${t}/users/me/cdr`,{from:n.toISOString(),number:r},s).then(e=>P.parseMany(e))});const O="0.1",x="1.0",I="1.1",T="1.0",A="1.0",U="0.1",R="1.0";class E{constructor(){this.callbacks={}}on(e,t){this.callbacks[e]=t}triggerCallback(e,...t){return t.push(e),this.callbacks["*"]?this.callbacks["*"].apply(void 0,t):e in this.callbacks?this.callbacks[e].apply(void 0,t):null}}const M=["STATUS_NULL","STATUS_NEW","STATUS_CONNECTING","STATUS_CONNECTED","STATUS_COMPLETED"],F=["registered","unregistered","new","ringing","connecting","connected","ended","hold","unhold","mute","unmute","dtmf","message"],j=e=>({caller_id_name:e.remoteIdentity.displayName,caller_id_number:e.remoteIdentity.uri.user}),z=e=>!!e.getHeader("alert-info"),L=/^\+?[0-9#*]+$/;class B{static parse(e){return new B(e?{sound:e.sound,vibration:e.vibration}:{sound:!0,vibration:!0})}static newFrom(e){return u(e,B)}constructor({sound:e=!0,vibration:t=!0}={}){this.sound=e,this.vibration=t}setSound(e){return this.sound=e,this}setVibration(e){return this.vibration=e,this}enable(){return this.vibration=!0,this.sound=!0,this}disable(){return this.vibration=!1,this.sound=!1,this}isEnabled(){return this.sound||this.vibration}}return{WazoApiClient:class{constructor({server:e,agent:t=null}){this.updatePatemers({server:e,agent:t})}initializeEndpoints(){this.auth=b(this.client,`auth/${O}`),this.application=f(this.client,`ctid-ng/${x}/applications`),this.confd=$(this.client,`confd/${I}`),this.accessd=w(this.client,`accessd/${T}`),this.ctidNg=k(this.client,`ctid-ng/${A}`),this.dird=C(this.client,`dird/${U}`),this.callLogd=S(this.client,`call-logd/${R}`)}updatePatemers({server:e,agent:t}){this.client=new l({server:e,agent:t}),this.initializeEndpoints()}},WazoWebRTCClient:class{constructor(e){this.config=e,this.userAgent=this.configureUserAgent(),this.callbacksHandler=new E}configureUserAgent(){const e=new s.Web.Simple(this.getConfig());return F.filter(e=>"new"!==e).forEach(t=>{e.on(t,e=>{this.callbacksHandler.triggerCallback(t,e)})}),e.on("new",e=>{this.callbacksHandler.triggerCallback("new",{callerid:j(e),autoanswer:z(e.request)})}),e}on(e,t){this.callbacksHandler.on(e,t)}getConfig(){const{media:{audio:e,video:t,localVideo:s}}=this.config;return{media:{remote:{audio:t||e,video:t},local:{video:s}},ua:{traceSip:!1,displayName:this.config.displayName,uri:this.config.uri,wsServers:this.config.wsServers,authorizationUser:this.config.authorizationUser,password:this.config.password,sessionDescriptionHandlerFactoryOptions:{peerConnectionOptions:{iceCheckingTimeout:500,rtcpMuxPolicy:"negotiate",rtcConfiguration:{iceServers:{urls:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"]}}}}}}}getState(){return M[this.userAgent.state]}call(e){L.exec(e)&&this.userAgent.call(e)}answer(){this.userAgent.answer()}reject(){this.userAgent.reject()}hangup(){this.userAgent.hangup()}close(){this.userAgent.transport.disconnect()}},WazoWebSocketClient:class{constructor({host:e,token:t,events:s=[]},n={}){this.initialized=!1,this.callbacksHandler=new E,this.socket=null,this.host=e,this.token=t,this.events=s,this.options=n}connect(){this.socket=new n(`wss://${this.host}/api/websocketd/?token=${this.token}`,[],this.options),this.options.binaryType&&(this.socket.binaryType=this.options.binaryType),this.socket.onmessage=(e=>{const t=JSON.parse("string"==typeof e.data?e.data:"{}");this.initialized?this.callbacksHandler.triggerCallback(t.name,t):this.handleMessage(t,this.socket)}),this.socket.onclose=(e=>{e.code})}close(){this.socket&&this.socket.close()}on(e,t){this.callbacksHandler.on(e,t)}handleMessage(e,t){switch(e.op){case"init":this.events.forEach(e=>{const s={op:"subscribe",data:{event_name:e}};t.send(JSON.stringify(s))}),t.send(JSON.stringify({op:"start"}));break;case"subscribe":break;case"start":this.initialized=!0;break;default:this.callbacksHandler.triggerCallback("message",e)}}},BadResponse:r,ServerError:i,Call:D,CallLog:P,ChatMessage:y,Contact:m,COUNTRIES:{BELGIUM:"BE",CANADA:"CA",FRANCE:"FR",GERMANY:"DE",ITALY:"IT",PORTUGAL:"PT",SPAIN:"ES",SWITZERLAND:"CH",UNITED_KINGDOM:"GB",UNITED_STATES:"US"},ForwardOption:h,Line:c,NotificationOptions:B,Profile:p,Session:g,Voicemail:v,DebugPhone:class{makeCall(e){console.info("DebugPhone - calling: ${number}")}acceptCall(){console.info("DebugPhone - Accept call")}mute(){console.info("DebugPhone - Mute phone")}unmute(){console.info("DebugPhone - Unmute phone")}hold(){console.info("DebugPhone - Put on hold")}unhold(){console.info("DebugPhone - Put on unhold")}transfer(e){console.info(`DebugPhone - Transferring to ${e}`)}sendKey(e){console.info("DebugPhone - sending: ${key}")}putOnSpeaker(){console.info("DebugPhone - Put on speaker")}putOffSpeaker(){console.info("DebugPhone - Put off speaker")}endCall(){console.info("DebugPhone - Hang up")}onConnectionMade(){console.info("DebugPhone - Connection made")}close(){console.info("DebugPhone - Close")}},DebugDevice:class{connectToCall(){console.info("DebugDevice - Connected to call")}disconnectFromCall(){console.info("DebugDevice - Disconnected from call")}ringback(){console.info("DebugDevice - Ringback")}stopRingback(){console.info("DebugDevice - Stop ringback")}playRingtone(){console.info("DebugDevice - Play ringtone")}stopRingtone(){console.info("DebugDevice - Stop ringtone")}mute(){console.info("DebugDevice - Mute")}unmute(){console.info("DebugDevice - Unmute")}putOnSpeaker(){console.info("DebugDevice - Put on speaker")}putOffSpeaker(){console.info("DebugDevice - Put off speaker")}},PRESENCE:{AVAILABLE:"available",DO_NOT_DISTURB:"donotdisturb",DISCONNECTED:"disconnected"},FORWARD_KEYS:d}});
