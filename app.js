(function(){
var C=window.FBCFG,LITE=!!window.LITE,FS="https://firestore.googleapis.com/v1/projects/"+C.pid+"/databases/(default)/documents",
S=null,cur=null,oth=null,last=0,rdy=false,lastAct=0,lastSend=0,tab="c",FR=[],BL=[],frT=0,fdT=0,fdC=[],ls=window.localStorage,
EM=["🙂","😂","😍","👍","❤","😢","😮","🎉"],MAXDAY=150,LIM=LITE?15:30;
function $(i){return document.getElementById(i)}
function sv(k,v){try{ls.setItem(k,v)}catch(e){}}function gv(k){try{return ls.getItem(k)}catch(e){return null}}
function el(t,c,x,f){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined&&x!==null)e.appendChild(document.createTextNode(x));if(f)e.onclick=f;return e}
function X(m,u,b,cb,t){var r=new XMLHttpRequest();r.open(m,u,true);r.setRequestHeader("Content-Type","application/json");if(t)r.setRequestHeader("Authorization","Bearer "+t);
r.onreadystatechange=function(){if(r.readyState==4){var j=null;try{j=JSON.parse(r.responseText)}catch(e){}cb(r.status,j)}};r.send(b?JSON.stringify(b):null)}
function tk(cb){if(Date.now()<S.exp)return cb(S.t);
X("POST","https://securetoken.googleapis.com/v1/token?key="+C.key,{grant_type:"refresh_token",refresh_token:S.r},function(s,j){
if(s!=200){logout();return}S.t=j.id_token;S.r=j.refresh_token;S.exp=Date.now()+(j.expires_in-120)*1000;sv("s",JSON.stringify(S));cb(S.t)})}
function api(m,p,b,cb){tk(function(t){X(m,FS+p,b,cb||function(){},t)})}
function F(o){var f={},k;for(k in o)f[k]=typeof o[k]=="number"?{integerValue:""+o[k]}:{stringValue:o[k]};return{fields:f}}
function V(d,k){var v=d.fields&&d.fields[k];return v?(v.stringValue!==undefined?v.stringValue:parseInt(v.integerValue,10)):""}
function col(n){var h=0,i;for(i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%360;return"hsl("+h+",35%,42%)"}
function av(n){var s=el("span","av",n.charAt(0));s.style.background=col(n);return s}
function tm(t){var h=new Date(t),m=h.getMinutes();return h.getDate()+"/"+(h.getMonth()+1)+" "+h.getHours()+":"+(m<10?"0":"")+m}
function nk(v){return v.toLowerCase().replace(/\s/g,"")}
function rm(a,id){var i;for(i=0;i<a.length;i++)if(a[i].id==id){a.splice(i,1);return}}
function cid(o){return[S.u,o].sort().join("_")}
function err(t){$("err").textContent=t}
document.getElementById("root").innerHTML='<div id="auth"><h2>friendbook</h2><p>Accedi o iscriviti per chattare con i tuoi amici.</p><input id="un" placeholder="Nickname (a-z, 0-9)" maxlength="16" autocapitalize="off" autocorrect="off"><input id="pw" type="password" placeholder="Password (min. 6)"><div id="err"></div><button class="btn" id="bi">Accedi</button> <button class="btn g" id="br">Iscriviti</button><div class="sm">'+(LITE?'<a href="index.html">Versione completa</a>':'<a href="lite.html">Versione light</a>')+'</div></div><div id="app" class="hid"><div id="top"><a id="back">&lsaquo; Indietro</a><div id="logo">friendbook</div><div id="me"><b id="mn"></b> <a id="out">Esci</a></div></div><div id="wrap"><div id="list"><div id="tabs"><a id="tc">Chat</a><a id="tf">Amici</a><a id="ts">Stati</a></div><div id="lc"></div></div><div id="chat"><div id="ct"></div><div id="msgs"></div><div id="bar"><div id="em"></div><input id="msg" maxlength="200" placeholder="Scrivi un messaggio..."><button class="btn" id="sd">Invia</button> <a id="rf">Aggiorna</a></div></div></div></div>';
/* auth */
function go(kind){var n=nk($("un").value),p=$("pw").value;
if(!/^[a-z0-9]{3,16}$/.test(n)){err("Nickname: 3-16 lettere o numeri.");return}
if(p.length<6){err("La password deve avere almeno 6 caratteri.");return}
err("...");
X("POST","https://identitytoolkit.googleapis.com/v1/accounts:"+kind+"?key="+C.key,{email:n+"@fb14.app",password:p,returnSecureToken:true},function(s,j){
if(s!=200){var m=j&&j.error&&j.error.message||"";err(m.indexOf("EMAIL_EXISTS")>-1?"Nickname già preso.":(m.indexOf("INVALID")>-1||m.indexOf("EMAIL_NOT_FOUND")>-1)?"Nickname o password errati.":"Errore di connessione.");return}
S={t:j.idToken,r:j.refreshToken,exp:Date.now()+3480000,u:j.localId,n:n};sv("s",JSON.stringify(S));
if(kind=="signUp")api("POST","/nicknames?documentId="+n,F({u:S.u}),function(){api("POST","/users?documentId="+S.u,F({n:n,c:Date.now(),s:"",st:0}),start)});else start()})}
function logout(){try{ls.clear()}catch(e){}location.reload()}
function start(){$("auth").className="hid";$("app").className="";$("mn").textContent=S.n;
var e=$("em"),i;for(i=0;i<EM.length;i++)e.appendChild(el("a","",EM[i],(function(x){return function(){$("msg").value+=x}})(EM[i])));
$("ct").textContent="Scegli un amico per chattare.";draw();tick()}
/* amici */
function qr(coll,cb){api("POST","/users/"+S.u+":runQuery",{structuredQuery:{from:[{collectionId:coll}],limit:100}},function(s,j){var r=[],i,d;
if(s==200&&j)for(i=0;i<j.length;i++){d=j[i].document;if(d)r.push({id:d.name.split("/").pop(),n:V(d,"n"),s:V(d,"s")})}cb(r)})}
function loadFr(force,cb){if(!force&&Date.now()-frT<120000)return cb();qr("f",function(a){FR=a;qr("bl",function(b){BL=b;frT=Date.now();cb()})})}
function addF(){var n=nk($("fn").value),m=$("fm"),i;
if(!/^[a-z0-9]{3,16}$/.test(n)){m.textContent="Nickname non valido.";return}
if(n==S.n){m.textContent="Quello sei tu!";return}
for(i=0;i<FR.length;i++)if(FR[i].n==n){m.textContent="È già nella tua lista.";return}
m.textContent="...";
api("GET","/nicknames/"+n,null,function(s,j){if(s!=200||!j){m.textContent="Nickname non trovato.";return}var id=V(j,"u"),t=Date.now();
api("POST","/users/"+S.u+"/f?documentId="+id,F({n:n,s:"o",t:t}),function(s1){if(s1!=200){m.textContent="Impossibile aggiungere questo utente.";return}
api("POST","/users/"+id+"/f?documentId="+S.u,F({n:S.n,s:"i",t:t}),function(s2){if(s2!=200){api("DELETE","/users/"+S.u+"/f/"+id);m.textContent="Impossibile aggiungere questo utente.";return}
FR.push({id:id,n:n,s:"o"});draw()})})})}
function acc(f){var b={fields:{s:{stringValue:"a"}}},q="?updateMask.fieldPaths=s";
api("PATCH","/users/"+S.u+"/f/"+f.id+q,b,function(s){if(s!=200)return;api("PATCH","/users/"+f.id+"/f/"+S.u+q,b);f.s="a";fdT=0;draw()})}
function closeIf(id){if(oth==id){cur=null;oth=null;$("msgs").innerHTML="";$("ct").textContent="Scegli un amico per chattare.";document.body.className=""}}
function del(f){api("DELETE","/users/"+S.u+"/f/"+f.id);api("DELETE","/users/"+f.id+"/f/"+S.u);rm(FR,f.id);fdT=0;closeIf(f.id);draw()}
function blk(f){if(!confirm("Bloccare "+f.n+"?"))return;api("DELETE","/users/"+S.u+"/f/"+f.id);api("DELETE","/users/"+f.id+"/f/"+S.u);
api("POST","/users/"+S.u+"/bl?documentId="+f.id,F({n:f.n,t:Date.now()}));rm(FR,f.id);BL.push({id:f.id,n:f.n,s:""});fdT=0;closeIf(f.id);draw()}
function ubl(b){api("DELETE","/users/"+S.u+"/bl/"+b.id);rm(BL,b.id);draw()}
/* viste */
function sec(b,t){b.appendChild(el("h3","",t))}
function row(b,n,acts,f){var r=el("div","u"),a=el("span","act"),i;for(i=0;i<acts.length;i++)a.appendChild(acts[i]);r.appendChild(av(n));r.appendChild(a);r.appendChild(el("b","",n));if(f)r.onclick=f;b.appendChild(r)}
function draw(){var b=$("lc"),t=tab;b.innerHTML="";$("tc").className=t=="c"?"on":"";$("tf").className=t=="f"?"on":"";$("ts").className=t=="s"?"on":"";
b.appendChild(el("div","pad","..."));loadFr(false,function(){if(t!=tab)return;b.innerHTML="";if(t=="c")dChat(b);else if(t=="f")dFr(b);else dSt(b)})}
function dChat(b){var i,n=0;for(i=0;i<FR.length;i++)if(FR[i].s=="a"){n++;row(b,FR[i].n,[],(function(f){return function(){openChat(f)}})(FR[i]))}
if(!n)b.appendChild(el("div","pad","Nessun amico ancora. Vai su Amici e aggiungi qualcuno con il suo nickname."))}
function dFr(b){var i,f,d=el("div","box"),inp=el("input"),m=el("div","pad");inp.id="fn";inp.maxLength=16;inp.placeholder="Aggiungi amico con il nickname";inp.setAttribute("autocapitalize","off");
d.appendChild(inp);d.appendChild(el("button","btn","Aggiungi",addF));m.id="fm";d.appendChild(m);b.appendChild(d);
var g={i:[],o:[],a:[]};for(i=0;i<FR.length;i++)if(g[FR[i].s])g[FR[i].s].push(FR[i]);
if(g.i.length){sec(b,"Richieste ricevute");for(i=0;i<g.i.length;i++){f=g.i[i];row(b,f.n,[el("a","",
"Conferma",(function(x){return function(){acc(x)}})(f)),el("a","","Elimina",(function(x){return function(){del(x)}})(f))])}}
if(g.o.length){sec(b,"Richieste inviate");for(i=0;i<g.o.length;i++){f=g.o[i];row(b,f.n,[el("a","","Annulla",(function(x){return function(){del(x)}})(f))])}}
sec(b,"Amici ("+g.a.length+")");for(i=0;i<g.a.length;i++){f=g.a[i];row(b,f.n,[el("a","","Rimuovi",(function(x){return function(){del(x)}})(f)),el("a","","Blocca",(function(x){return function(){blk(x)}})(f))])}
if(BL.length){sec(b,"Bloccati");for(i=0;i<BL.length;i++){f=BL[i];row(b,f.n,[el("a","","Sblocca",(function(x){return function(){ubl(x)}})(f))])}}}
function dSt(b){var d=el("div","box"),inp=el("input"),i;inp.id="sm";inp.maxLength=140;inp.placeholder="Cosa stai pensando?";inp.value=gv("ms")||"";d.appendChild(inp);
d.appendChild(el("button","btn","Pubblica",function(){var x=inp.value.replace(/^\s+|\s+$/g,"").substring(0,140);
api("PATCH","/users/"+S.u+"?updateMask.fieldPaths=s&updateMask.fieldPaths=st",F({s:x,st:Date.now()}),function(s){if(s==200){sv("ms",x);fdT=0;draw()}else alert("Stato non pubblicato.")})}));b.appendChild(d);
var ids=[];for(i=0;i<FR.length&&ids.length<50;i++)if(FR[i].s=="a")ids.push("projects/"+C.pid+"/databases/(default)/documents/users/"+FR[i].id);
function show(){var l=el("div"),k,x;sec(l,"Stati degli amici");fdC.sort(function(a,c){return c.st-a.st});
for(k=0;k<fdC.length;k++){x=fdC[k];if(!x.s)continue;var r=el("div","u st");r.appendChild(av(x.n));r.appendChild(el("b","",x.n));r.appendChild(el("div","",x.s));r.appendChild(el("i","",tm(x.st)));l.appendChild(r)}
if(l.childNodes.length<2)l.appendChild(el("div","pad","Nessuno stato da mostrare."));l.appendChild(el("div","pad","",null)).appendChild(el("a","","Aggiorna",function(){fdT=0;draw()}));b.appendChild(l)}
if(!ids.length||Date.now()-fdT<180000){show();return}
api("POST",":batchGet",{documents:ids},function(s,j){if(s==200&&j){fdC=[];for(var k=0;k<j.length;k++)if(j[k].found)fdC.push({n:V(j[k].found,"n"),s:V(j[k].found,"s"),st:V(j[k].found,"st")||0});fdT=Date.now()}if(tab=="s")show()})}
/* chat */
function openChat(f){cur=cid(f.id);oth=f.id;last=0;rdy=false;$("msgs").innerHTML="";$("ct").textContent=f.n;document.body.className="ch";lastAct=Date.now();pull(true)}
function pull(first){if(!cur)return;var id=cur,q={structuredQuery:{from:[{collectionId:"m"}],orderBy:[{field:{fieldPath:"t"},direction:first?"DESCENDING":"ASCENDING"}],limit:first?LIM:40}};
if(!first)q.structuredQuery.where={fieldFilter:{field:{fieldPath:"t"},op:"GREATER_THAN",value:{integerValue:""+last}}};
api("POST","/chats/"+id+":runQuery",q,function(s,j){if(s!=200||!j||id!=cur)return;var r=[],i;
for(i=0;i<j.length;i++)if(j[i].document)r.push(j[i].document);if(first)r.reverse();
for(i=0;i<r.length;i++)add(V(r[i],"n"),V(r[i],"x"),V(r[i],"t"));if(r.length)lastAct=Date.now();rdy=true})}
function add(n,x,t){if(t>last)last=t;var d=el("div","m"),b=el("div","t"),m=$("msgs"),down=m.scrollTop+m.clientHeight>=m.scrollHeight-40;
d.appendChild(av(n));b.appendChild(el("b","",n));b.appendChild(document.createTextNode(" "+x));b.appendChild(el("i","",tm(t)));d.appendChild(b);m.appendChild(d);if(down||n==S.n)m.scrollTop=m.scrollHeight}
function send(){var x=$("msg").value.replace(/^\s+|\s+$/g,""),now=Date.now(),k="d"+new Date().toDateString(),c=parseInt(gv(k)||0,10);
if(!x||!cur||now-lastSend<2000)return;if(c>=MAXDAY){alert("Limite giornaliero di messaggi raggiunto. Riprova domani.");return}
lastSend=now;sv(k,""+(c+1));$("msg").value="";var id=cur;
api("POST","/chats/"+id+"/m",F({u:S.u,n:S.n,x:x.substring(0,200),t:now}),function(s){if(s==200){lastAct=Date.now();pull(false)}else alert("Messaggio non inviato. Controlla che siate ancora amici e che nessuno abbia bloccato l'altro.")})}
function tick(){var w=Date.now()-lastAct>180000?(LITE?60000:30000):(LITE?15000:8000);setTimeout(function(){if(document.hidden!==true&&cur&&rdy)pull(false);tick()},w)}
try{document.addEventListener("visibilitychange",function(){if(document.hidden===false){lastAct=Date.now();if(cur&&rdy)pull(false)}},false)}catch(e){}
/* eventi */
$("bi").onclick=function(){go("signInWithPassword")};$("br").onclick=function(){go("signUp")};
$("pw").onkeydown=function(e){if((e||window.event).keyCode==13)go("signInWithPassword")};
$("sd").onclick=send;$("msg").onkeydown=function(e){if((e||window.event).keyCode==13)send()};$("rf").onclick=function(){pull(false)};
$("tc").onclick=function(){tab="c";draw()};$("tf").onclick=function(){tab="f";frT=0;draw()};$("ts").onclick=function(){tab="s";draw()};
$("out").onclick=logout;$("back").onclick=function(){document.body.className="";cur=null;oth=null};
try{var s0=gv("s");if(s0){S=JSON.parse(s0);start()}}catch(e){}
if(!LITE&&"serviceWorker" in navigator&&location.protocol.indexOf("http")==0)navigator.serviceWorker.register("sw.js");
})();
