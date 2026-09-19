/* Skill Saga learner content routing
 * Adds data routing only; preserves the approved learner UI structure.
 */
(function(){
'use strict';
var patched=false;
function db(){try{return window.firebase&&firebase.firestore?firebase.firestore():null}catch(e){return null}}
function nowLive(x){
 if(!x)return false;
 if(x.status==='draft'||x.status==='archived')return false;
 var n=Date.now(),p=Number(x.publishAtMs||0),e=Number(x.expiresAtMs||0);
 if(p&&p>n)return false;
 if(e&&e<=n)return false;
 return x.published===true||x.status==='published'||x.status==='scheduled'||x.status==='active';
}
async function docs(c){
 var d=db();if(!d)return [];
 try{var s=await d.collection(c).get();return s.docs.map(function(x){return Object.assign({id:x.id},x.data())}).filter(nowLive)}catch(e){console.warn('Skill Saga content load',c,e);return []}
}
function cls(){return Number(window._ssLearnSelectedClass||8)}
function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
function toastx(v){if(window.toast)toast(v)}
function subjectIcon(n){n=String(n||'').toLowerCase();if(n.includes('math')||n.includes('numer'))return '🔢';if(n.includes('science'))return '🧪';if(n.includes('english'))return '📘';if(n.includes('hindi'))return 'हिं';if(n.includes('computer'))return '💻';return '📚'}
async function learn(){
 var original=window.__ssOriginalGo;
 if(original)await original('learn');
 var rows=await docs('curriculum'),c=cls();
 rows=rows.filter(function(x){return Number(x.classNumber||x.classLevel)===c});
 if(!rows.length)return;
 var subjects=[],seen={};
 rows.forEach(function(x){var s=String(x.subject||'').trim();if(s&&!seen[s]){seen[s]=1;subjects.push(s)}});
 var grid=document.querySelector('.ss-subjects');if(!grid)return;
 grid.innerHTML=subjects.slice(0,12).map(function(s){return '<div class="ss-subject" data-ss-subject="'+esc(s)+'"><div class="i">'+subjectIcon(s)+'</div><b>'+esc(s)+'</b><small>Open subject →</small></div>'}).join('');
 grid.querySelectorAll('[data-ss-subject]').forEach(function(el){el.onclick=function(){openSubject(el.getAttribute('data-ss-subject'))}});
}
async function openSubject(subject){
 var c=cls(),rows=await docs('learningMaterials');
 rows=rows.filter(function(x){return Number(x.classNumber||x.classLevel)===c&&String(x.subject||'')===String(subject)});
 var curriculum=await docs('curriculum');
 var topics=curriculum.filter(function(x){return Number(x.classNumber||x.classLevel)===c&&String(x.subject||'')===String(subject)});
 var all={},items=[];
 rows.concat(topics).forEach(function(x){var k=String(x.topic||x.chapter||x.title||'').trim();if(k&&!all[k]){all[k]=1;items.push(x)}});
 var html='<div class="ss-final"><div class="ss-section"><b>'+esc(subject)+'</b><span>Class '+c+'</span></div>';
 if(!items.length)html+='<div class="ss-card"><small>No published learning content is available for this subject yet.</small></div>';
 else html+='<div class="ss-popular">'+items.slice(0,30).map(function(x){var topic=x.topic||x.chapter||x.title;return '<div class="ss-topic" data-ss-topic="'+esc(topic)+'"><div class="i">📚</div><b>'+esc(topic)+'</b><small>Learn & practice</small></div>'}).join('')+'</div>';
 html+='</div>';
 if(typeof window.shell==='function')window.shell(html);
 document.querySelectorAll('[data-ss-topic]').forEach(function(el){el.onclick=function(){openTopic(subject,el.getAttribute('data-ss-topic'))}});
}
async function openTopic(subject,topic){
 var c=cls(),rows=await docs('learningMaterials');
 var mats=rows.filter(function(x){return Number(x.classNumber||x.classLevel)===c&&String(x.subject||'')===String(subject)&&String(x.topic||x.chapter||'')===String(topic)});
 var cur=await docs('curriculum');
 var cr=cur.find(function(x){return Number(x.classNumber||x.classLevel)===c&&String(x.subject||'')===String(subject)&&String(x.topic||x.chapter||'')===String(topic)});
 var html='<div class="ss-final"><div class="ss-section"><b>'+esc(topic)+'</b><span>'+esc(subject)+'</span></div>';
 if(cr&&cr.content)html+='<div class="ss-progress-card"><b>Lesson</b><p class="muted" style="white-space:pre-wrap;margin-top:8px">'+esc(cr.content)+'</p></div>';
 mats.forEach(function(m){html+='<div class="ss-progress-card" style="margin-top:8px"><b>'+esc(m.title||'Learning Material')+'</b><p class="muted" style="white-space:pre-wrap;margin-top:8px">'+esc(m.content||'')+'</p></div>'});
 html+='<div class="ss-final-note">📚 Learn the concept first, then practice it.</div></div>';
 if(typeof window.shell==='function')window.shell(html);
}
async function play(){
 var original=window.__ssOriginalGo;
 if(original)original('play');
 var qs=await docs('quizzes');
 var daily=qs.filter(function(x){return x.primaryModule==='Play'&&x.primaryDestination==='Daily Quiz'}).sort(function(a,b){return String(b.publishAt||'').localeCompare(String(a.publishAt||''))})[0];
 var weekly=qs.filter(function(x){return x.primaryModule==='Compete'&&x.primaryDestination==='Weekly Championship'||x.primaryModule==='Compete'&&x.primaryDestination==='Weekly Challenge'}).sort(function(a,b){return String(b.publishAt||'').localeCompare(String(a.publishAt||''))})[0];
 var cards=[['.ss-home-play-daily',daily,'Daily quiz is not published yet.'],['.ss-home-play-weekly',weekly,'Weekly quiz is not published yet.']];
 cards.forEach(function(item){var card=document.querySelector(item[0]),q=item[1];if(!card)return;var b=card.querySelector('button');if(!b)return;if(q){b.textContent='Start →';b.onclick=function(){if(typeof startQuiz==='function')startQuiz(Object.assign({id:q.id},q))}}else{b.textContent='Not available';b.onclick=function(){toastx(item[2])}}});
 var modes=document.querySelectorAll('.ss-mode');var map={Practice:'Practice', 'Skill Quiz':'Skill Quiz','Quick Quiz':'Quick Quiz'};
 modes.forEach(function(card){var name=(card.querySelector('b')||{}).textContent||'',dest=map[name],b=card.querySelector('button');if(!dest||!b)return;var q=qs.filter(function(x){return x.primaryModule==='Play'&&x.primaryDestination===dest})[0];if(q){b.textContent='Start →';b.onclick=function(){startQuiz(Object.assign({id:q.id},q))}}});
}
function patch(){
 if(patched||typeof window.go!=='function')return;
 patched=true;window.__ssOriginalGo=window.go;
 window.go=function(n){if(n==='learn')return window.__ssOriginalGo(n);if(n==='play')return play();return window.__ssOriginalGo(n)};
}
var timer=setInterval(function(){if(typeof window.go==='function'){clearInterval(timer);patch()}},50);
setTimeout(function(){clearInterval(timer);patch()},10000);
})();