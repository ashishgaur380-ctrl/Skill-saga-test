/* Skill Saga Admin Console core */
(function(){'use strict';
var BOOT='4Jme1MoSmHbjzwVjkvxeNSwPp0U2';
window.ssAdminDB=function(){return firebase&&firebase.firestore?firebase.firestore():null};
window.ssAdminAuth=function(){return firebase&&firebase.auth?firebase.auth().currentUser:null};
window.ssAdminOK=function(){var a=ssAdminAuth(),u=window.user&&window.user();return !!(a&&ssAdminDB()&&(a.uid===BOOT||(u&&u.role==='admin')))};
window.ssAdminGuard=function(){if(!ssAdminOK()){if(window.toast)toast('Admin access required');return false}return true};
window.ssAdminStamp=function(){return firebase.firestore.FieldValue.serverTimestamp()};
window.ssAdminEsc=function(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})};
window.ssAdminDocs=async function(c,n){try{var q=ssAdminDB().collection(c);if(n)q=q.limit(n);var s=await q.get();return s.docs.map(function(d){return Object.assign({id:d.id},d.data())})}catch(e){console.warn(c,e);return[]}};
function stat(v,t){return '<div class="tile"><b>'+ssAdminEsc(v)+'</b><small>'+ssAdminEsc(t)+'</small></div>'}
window.ssAdminLogout=async function(){try{if(firebase&&firebase.auth){await firebase.auth().signOut()}}catch(e){if(window.toast)toast(e.message||'Could not sign out');return}window.location.reload()};
window.ssAdminPage=function(t,s,b){document.getElementById('root').innerHTML='<div class="app"><header class="top"><div class="brand"><img src="logo.png"><b>Skill <span>Saga</span></b></div><div style="display:flex;gap:7px"><button class="iconbtn" onclick="admin()">Back</button><button class="iconbtn" onclick="ssAdminLogout()">Logout</button></div></header><main class="main"><div class="row"><div><h1 style="margin:0">'+ssAdminEsc(t)+'</h1><div class="muted">'+ssAdminEsc(s||'')+'</div></div><span>🛠️</span></div>'+b+'</main></div>'};
/* Encode quotes in dynamic onclick attributes so handlers such as fn("value") remain valid HTML. */
window.ssAdminButton=function(t,f,k){return '<button class="btn '+(k||'light')+'" onclick="'+String(f).replace(/\"/g,'&quot;')+'">'+t+'</button>'};
window.ssAdminSettings=async function(){try{var s=window.SkillSagaCommon?await SkillSagaCommon.getDoc('appSettings','general'):await ssAdminDB().collection('appSettings').doc('general').get();return s||{forumEnabled:false,adsEnabled:false,premiumEnabled:false}}catch(e){return{forumEnabled:false,adsEnabled:false,premiumEnabled:false}}};

/* Admin module bridge. Multiple Admin loaders may execute the core script;
   never wrap an existing bridge a second time. */
var __ssAdminModulePromises={};
function loadAdminModule(src){
  if(__ssAdminModulePromises[src])return __ssAdminModulePromises[src];
  __ssAdminModulePromises[src]=new Promise(function(resolve,reject){
    var existing=document.querySelector('script[data-ss-admin-module="'+src+'"]')||document.querySelector('script[src="'+src+'"]');
    if(existing){
      if(existing.getAttribute('data-loaded')==='1')return resolve();
      existing.addEventListener('load',function(){resolve()},{once:true});
      existing.addEventListener('error',function(){reject(Error('Admin module failed to load: '+src))},{once:true});
      return;
    }
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.setAttribute('data-ss-admin-module',src);
    s.onload=function(){s.setAttribute('data-loaded','1');resolve()};
    s.onerror=function(){reject(Error('Admin module failed to load: '+src))};
    (document.head||document.documentElement).appendChild(s);
  });
  return __ssAdminModulePromises[src];
}
function bridgeAdminHandler(name,src){
  var already=window[name];
  if(already&&already.__ssAdminBridge)return;
  var bridge=function(){
    if(!ssAdminGuard())return;
    if(already)return already.apply(window,arguments);
    var args=arguments;
    loadAdminModule(src).then(function(){
      var fn=window[name];
      if(typeof fn==='function'&&fn!==bridge)return fn.apply(window,args);
      if(window.toast)toast('Admin module is unavailable. Please refresh once.');
    }).catch(function(e){console.warn(e);if(window.toast)toast('Admin module could not be loaded.');});
  };
  bridge.__ssAdminBridge=true;
  window[name]=bridge;
}
bridgeAdminHandler('ssAdminQuiz','admin-console-publishing-v2.js');
bridgeAdminHandler('ssAdminCurriculum','admin-console-publishing-v2.js');
bridgeAdminHandler('ssAdminMaterials','admin-console-publishing-v2.js');
bridgeAdminHandler('ssAdminQuestions','admin-console-publishing-v2.js');

window.admin=async function(){if(window.ssAdminV3)return window.ssAdminV3();if(!ssAdminGuard())return;var cs=['quizzes','curriculum','learningMaterials','questionBank','competitions','forumPosts','forumReports','users','assignments','leaderboards','rewards','badges','notifications','quizAttempts','competitionResults','relationships'],a=await Promise.all(cs.map(function(c){return ssAdminDocs(c)})),m={};cs.forEach(function(c,i){m[c]=a[i].length});var roleCounts={learner:0,parent:0,teacher:0,admin:0};(a[7]||[]).forEach(function(x){var r=x.role||'learner';if(Object.prototype.hasOwnProperty.call(roleCounts,r))roleCounts[r]++});var s=await ssAdminSettings();ssAdminPage('Admin Console','Central control for Skill Saga learning content, learner experience and community.','<div class="notice"><b>Authorized admin area.</b> Firebase Authentication + Firestore rules protect the management collections.</div><div class="grid">'+stat(m.quizzes,'Quizzes')+stat(m.curriculum,'Curriculum')+stat(m.learningMaterials,'Materials')+stat(m.questionBank,'Question Bank')+stat(m.competitions,'Competitions')+stat(m.forumPosts,'Forum Posts')+stat(m.users,'Total Users')+stat(roleCounts.learner,'Learners')+stat(roleCounts.teacher,'Teachers')+stat(roleCounts.parent,'Parents')+stat(roleCounts.admin,'Admins')+stat(m.assignments,'Assignments')+'</div><div class="section"><b>Content & Curriculum</b></div><div class="grid"><div class="tile" onclick="ssAdminQuiz()">📝<b>Quiz Manager</b><small>Create, edit, preview, import, publish, schedule</small></div><div class="tile" onclick="ssAdminCurriculum()">🗂️<b>Curriculum</b><small>Board, year, class, subject, book, chapter, topic</small></div><div class="tile" onclick="ssAdminMaterials()">📚<b>Learning Materials</b><small>Lessons and study content</small></div><div class="tile" onclick="ssAdminQuestions()">❓<b>Question Bank</b><small>Production questions and review</small></div></div><div class="section"><b>Play & Competition</b></div><div class="grid"><div class="tile" onclick="ssAdminCompetitions()">🏆<b>Competitions</b><small>Schedule, manage and publish</small></div><div class="tile" onclick="ssAdminAssignments()">👩‍🏫<b>Assignments</b><small>Teacher-to-learner audit</small></div><div class="tile" onclick="ssAdminV3Leaderboards()">🥇<b>Leaderboards</b><small>Review published ranking records</small></div><div class="tile" onclick="ssAdminV3Rewards()">🎁<b>Rewards & Badges</b><small>Manage catalogue and definitions</small></div></div><div class="section"><b>Community & Communication</b></div><div class="grid"><div class="tile" onclick="ssAdminForum()">💬<b>Forum & Moderation</b><small>Posts, reports, approve/reject/delete</small></div><div class="tile" onclick="ssAdminNotifications()">🔔<b>Notifications</b><small>Announcements by audience</small></div></div><div class="section"><b>Learners, Parents & Teachers</b></div><div class="grid"><div class="tile" onclick="ssAdminUsers()">👥<b>Users & Roles</b><small>Learner, parent, teacher, admin</small></div><div class="tile" onclick="ssAdminV3Relationships()">🔗<b>Relationships</b><small>Parent/teacher/learner links</small></div><div class="tile" onclick="ssAdminV3Learners()">🧑‍🎓<b>Learner Profiles</b><small>Education identity and progress</small></div></div><div class="section"><b>Insights & Platform Controls</b></div><div class="grid"><div class="tile" onclick="ssAdminAnalytics()">📊<b>Analytics</b><small>Attempts and accuracy</small></div><div class="tile" onclick="ssAdminV3Records()">📈<b>Learning Records</b><small>Quiz history and attempts</small></div><div class="tile" onclick="ssAdminAppSettings()">⚙️<b>App Controls</b><small>Forum, ads, premium</small></div><div class="tile" onclick="ssAdminSecurity()">🛡️<b>Security</b><small>Admin authorization</small></div></div><div class="card admin"><div class="row"><b>Discussion Forum</b><span class="badge">'+(s.forumEnabled!==false?'Enabled':'Disabled')+'</span></div><div class="small muted" style="margin-top:6px">Learner posts should enter moderation before public publication.</div></div>')};
})();