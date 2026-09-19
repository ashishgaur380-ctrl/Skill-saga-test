/* Skill Saga — Final learner UI layer
 * Applies the approved Home / Learn / Play / Compete / Profile structure
 * without replacing the tested quiz engine or admin workflows.
 */
(function(){
'use strict';
var legacyShell=window.shell;
var legacyGo=window.go;
var legacyHome=window.home;
var legacyPlay=window.play;
var legacyCompete=window.compete;
var legacySkills=window.skills;
var legacyProfile=window.profile;

function css(){if(document.getElementById('ss-final-ui-css'))return;var s=document.createElement('style');s.id='ss-final-ui-css';s.textContent=`
.ss-final{padding:4px 0 18px}.ss-hero{position:relative;overflow:hidden;border-radius:24px;padding:18px 17px;margin-bottom:11px;background:linear-gradient(135deg,#edf5ff,#e9f0ff 58%,#f3edff);border:1px solid #e1e8f5}.ss-hero.blue{background:linear-gradient(135deg,#1769ff,#315ff1 58%,#7047ef);color:#fff}.ss-hero-copy{position:relative;z-index:2;width:68%}.ss-eyebrow{font-size:10px;font-weight:900;letter-spacing:.5px;color:#1769ff}.blue .ss-eyebrow{color:#fff}.ss-title{font-size:25px;line-height:1.05;margin:5px 0 7px;color:#081b43;letter-spacing:-.5px}.blue .ss-title{color:#fff}.ss-sub{font-size:11px;line-height:1.4;color:#63728d}.blue .ss-sub{color:#fff}.ss-quote{display:inline-block;margin-top:11px;padding:8px 10px;border-radius:11px;background:#fff8;color:#1769ff;font-size:10px;font-weight:900}.ss-hero-art{position:absolute;right:8px;bottom:4px;width:34%;height:145px;display:flex;align-items:flex-end;justify-content:center}.ss-hero-circle{position:absolute;width:115px;height:115px;border-radius:50%;background:#1769ff;opacity:.10}.ss-hero-mascot{position:relative;font-size:67px;z-index:2;filter:drop-shadow(0 6px 7px #12346b22)}.ss-hero-words{position:absolute;right:0;top:5px;font-size:11px;font-weight:1000;line-height:1.02;transform:rotate(-5deg);z-index:4;color:#11275c}.ss-hero-words b{color:#1769ff}.ss-hero-words i{display:block;width:34px;height:3px;background:#ffd32f;border-radius:4px;margin:4px 0 0 7px}.ss-blue-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:10px 0 14px}.ss-stat{background:#fff;border:1px solid #e6ebf4;border-radius:16px;padding:10px 8px;text-align:center}.ss-stat-icon{font-size:18px}.ss-stat b{display:block;font-size:17px;color:#142343}.ss-stat small{font-size:8px;color:#78869d}.ss-section{display:flex;align-items:center;justify-content:space-between;margin:15px 2px 8px}.ss-section b{font-size:15px;color:#101e3d}.ss-section span{font-size:10px;font-weight:900;color:#1769ff}.ss-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:10px 0}.ss-tab{border:1px solid #e1e7f1;border-radius:16px;padding:11px 7px;background:#fff;text-align:left;cursor:pointer}.ss-tab.active{background:#1769ff;color:#fff;border-color:#1769ff}.ss-tab .i{font-size:22px;display:block}.ss-tab b{display:block;font-size:12px;margin-top:4px}.ss-tab small{font-size:9px}.ss-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.ss-card{border:1px solid #e5eaf3;border-radius:17px;padding:12px;background:#fff;box-shadow:0 5px 15px #1c35620b}.ss-card.center{text-align:center}.ss-card .i{font-size:26px}.ss-card b{display:block;font-size:11px;color:#172542;margin-top:5px}.ss-card small{display:block;color:#75829a;font-size:8px;margin-top:3px;line-height:1.3}.ss-action{border:0;border-radius:10px;padding:8px 11px;background:#1769ff;color:#fff;font-size:9px;font-weight:1000;cursor:pointer;margin-top:8px}.ss-soft{background:#eef5ff}.ss-green{background:#e9f8ef}.ss-pink{background:#fff0f4}.ss-purple{background:#f2edff}.ss-yellow{background:#fff7df}.ss-learn-classes{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.ss-class{border:1px solid #e1e8f3;border-radius:12px;padding:10px 2px;text-align:center;background:#fff;font-size:11px;font-weight:900;color:#243452;cursor:pointer}.ss-class.active{background:#1769ff;color:#fff;border-color:#1769ff}.ss-subjects{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.ss-subject{padding:13px;border-radius:17px;border:1px solid #e5eaf3;text-align:center}.ss-subject .i{font-size:27px}.ss-subject b{display:block;font-size:11px;margin-top:4px}.ss-subject small{font-size:8px;color:#78869c}.ss-progress-card{padding:13px;border-radius:18px;background:#fff;border:1px solid #e5eaf3}.ss-progress-row{display:flex;align-items:center;gap:10px}.ss-thumb{width:58px;height:58px;border-radius:14px;background:#dcecff;display:flex;align-items:center;justify-content:center;font-size:30px}.ss-progress-copy{flex:1}.ss-progress-copy b{font-size:11px}.ss-progress-copy small{display:block;color:#75829a;font-size:8px;margin-top:3px}.ss-bar{height:6px;background:#e4eaf3;border-radius:6px;overflow:hidden;margin-top:8px}.ss-bar i{display:block;height:100%;background:#22ae6b}.ss-popular{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.ss-topic{padding:11px;border-radius:16px;text-align:center;border:1px solid #e5eaf3}.ss-topic .i{font-size:25px}.ss-topic b{display:block;font-size:10px}.ss-topic small{font-size:8px;color:#78869c}.ss-locks{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.ss-lock{padding:11px 6px;text-align:center;border:1px solid #dfe6f1;border-radius:15px;background:#fff}.ss-lock .i{font-size:22px}.ss-lock b{display:block;font-size:10px;margin-top:4px}.ss-lock small{font-size:7px;color:#74819a;line-height:1.25;display:block;margin-top:3px}.ss-lock button{border:0;background:#eaf2ff;color:#174fae;border-radius:8px;padding:6px;width:100%;font-size:8px;font-weight:900;margin-top:7px}.ss-lock.current{background:#ebfaf0;border-color:#bde8ce}.ss-lock.current button{background:#c8f1d7;color:#16804d}.ss-play-modes{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.ss-mode{padding:13px;border-radius:17px;text-align:center;border:1px solid #e4eaf3}.ss-mode .i{font-size:27px}.ss-mode b{display:block;font-size:11px;margin-top:4px}.ss-mode small{font-size:8px;color:#75829a;line-height:1.3}.ss-assigned{padding:13px;border-radius:18px;background:#f3efff;border:1px solid #e3d9ff}.ss-assignment{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #e3dcf2}.ss-assignment:last-child{border-bottom:0}.ss-assignment .i{font-size:25px}.ss-assignment-main{flex:1}.ss-assignment-main b{font-size:10px}.ss-assignment-main small{display:block;font-size:8px;color:#74819a;margin-top:3px}.ss-assignment button{border:0;border-radius:9px;background:#1769ff;color:#fff;padding:8px 10px;font-size:8px;font-weight:900}.ss-competition-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.ss-comp{padding:13px;border-radius:17px;border:1px solid #e4eaf3;text-align:center}.ss-comp .i{font-size:27px}.ss-comp b{display:block;font-size:10px;margin-top:5px}.ss-comp small{font-size:8px;color:#74819a;line-height:1.3}.ss-upcoming{display:grid;gap:7px}.ss-event{display:flex;align-items:center;gap:9px;padding:11px;border:1px solid #e4eaf3;border-radius:15px;background:#fff}.ss-date{width:39px;text-align:center;border-radius:9px;background:#eef4ff;color:#1769ff;padding:6px 2px;font-weight:1000;font-size:9px}.ss-event-main{flex:1}.ss-event-main b{font-size:10px}.ss-event-main small{display:block;color:#74819a;font-size:8px;margin-top:3px}.ss-event button{border:0;background:#1769ff;color:#fff;border-radius:8px;padding:7px 9px;font-size:8px;font-weight:900}.ss-board{padding:12px;border-radius:18px;background:#fff;border:1px solid #e4eaf3}.ss-board-row{display:flex;align-items:center;gap:7px;padding:8px 3px;border-bottom:1px solid #eef1f5;font-size:9px}.ss-board-row:last-child{border-bottom:0}.ss-board-rank{width:24px;font-weight:1000;text-align:center}.ss-avatar{width:27px;height:27px;border-radius:50%;background:#e8f0ff;display:flex;align-items:center;justify-content:center}.ss-board-name{flex:1;font-weight:800}.ss-board-xp{font-weight:1000}.ss-forum{padding:13px;border-radius:18px;background:linear-gradient(135deg,#f0eaff,#e8f4ff);border:1px solid #e1ddf3}.ss-forum b{font-size:13px}.ss-forum p{font-size:9px;color:#66758e;line-height:1.35}.ss-forum button{border:0;border-radius:9px;background:#1769ff;color:#fff;padding:8px 11px;font-size:8px;font-weight:900}.ss-final-note{padding:12px;border-radius:17px;background:#edf6ff;color:#27436c;text-align:center;font-size:9px;font-weight:800;margin-top:10px}.ss-home-challenge{margin-top:0;box-shadow:0 7px 18px #17366c14}.ss-home-weekly{margin-bottom:2px}
@media(max-width:380px){.ss-title{font-size:23px}.ss-hero-copy{width:70%}.ss-hero-mascot{font-size:58px}.ss-class{font-size:10px}}
`;document.head.appendChild(s)}
function U(){
  try{var x=typeof user==='function'?user():null;if(x&&x.uid)return x}catch(e){}
  try{
    if(typeof cloudUser!=='undefined'&&cloudUser&&cloudUser.uid){
      return {uid:cloudUser.uid,name:cloudUser.displayName||cloudUser.email||'Learner',displayName:cloudUser.displayName||'',email:cloudUser.email||''};
    }
  }catch(e){}
  try{
    if(window.firebase&&firebase.auth){
      var a=firebase.auth().currentUser;
      if(a&&a.uid)return {uid:a.uid,name:a.displayName||a.email||'Learner',displayName:a.displayName||'',email:a.email||''};
    }
  }catch(e){}
  return null;
}
function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
function stats(){var u=U()||{};return {xp:Number(u.xp||0),coins:Number(u.coins||0),streak:Number(u.streak||0),level:Number(u.level||Math.max(1,Math.floor(Number(u.xp||0)/500)+1)),accuracy:Number(u.accuracy||u.avgAccuracy||0)}}
function skillPct(u,name){var v=u&&u.skillScores&&typeof u.skillScores[name]==='number'?u.skillScores[name]:0;return Math.max(0,Math.min(100,Math.round(v)));}
function competitionStats(u){var x=u&&u.competitionStats&&typeof u.competitionStats==='object'?u.competitionStats:{};return {joined:Number(x.joined||0),top3:Number(x.top3||x.top3Finishes||0),points:Number(x.points||0)};}
function base(content,active){
  if(typeof legacyShell==='function')legacyShell(content);else if(typeof shell==='function')shell(content);
  var nav=document.querySelector('.nav');if(!nav)return;
  notificationCss();
  ssRefreshNotificationBell();
  nav.innerHTML='<button data-s="home">⌂<span>Home</span></button><button data-s="learn">▣<span>Learn</span></button><button data-s="play">▶<span>Play</span></button><button data-s="compete">🏆<span>Compete</span></button><button data-s="profile">●<span>Profile</span></button>';
  nav.querySelectorAll('button').forEach(function(b){b.classList.toggle('active',b.dataset.s===active);b.onclick=function(){window.go(b.dataset.s)}});
}
function headerTitle(){return ''}
async function ssReadHomeSettings(){
  var d={enabled:true,showStats:true,showDailyMission:true,showDailyQuiz:true,showWeeklyQuiz:true,showSkills:true,showMilestone:true,showContinueLearning:true,showBottomNote:true,showNotifications:true,sectionOrder:'stats,dailyMission,skills,milestone,continueLearning',welcomeTitle:'A smarter way to learn — one challenge at a time.',welcomeQuote:'Small Steps | Big Achievements!'};
  try{
    if(window.firebase&&firebase.firestore){
      var db=cloudDb||firebase.firestore();
      var auth=window.firebase&&firebase.auth?firebase.auth().currentUser:null;
      if(auth&&auth.uid){
        var snap=await db.collection('appSettings').doc('home').get({source:'server'});
        if(snap&&snap.exists)d=Object.assign(d,snap.data());
      }
    }
  }catch(e){
    console.warn('Home settings read failed',e);
  }
  return d;
}
function ssQuizForHome(type){
  var arr=(typeof local!=='undefined'&&Array.isArray(local.content))?local.content:[];
  var today=new Date().toISOString().slice(0,10);
  var module=type==='daily'?'Play':'Compete';
  var destination=type==='daily'?'Daily Quiz':'Weekly Challenge';
  function live(x){
    if(!x||x.published===false)return false;
    var pd=x.publishDate||x.date||'';
    return !pd||pd<=today;
  }
  function placement(x){
    var p=x.placement||{};
    return live(x)&&
      (x.primaryModule||p.module||'')===module&&
      (x.primaryDestination||p.destination||'')===destination;
  }
  var q=arr.find(placement);
  if(q)return q;
  try{
    if(type==='daily'&&typeof daily==='function'){
      var d=daily();
      if(d&&d.id&&!d._isFallback)return d;
    }
    if(type==='weekly'&&typeof weekly==='function'){
      var w=weekly();
      if(w&&w.id)return w;
    }
  }catch(e){}
  return null;
}

async function homeFinal(){
  var s=stats(),u=U()||{},cs=competitionStats(u),rankLabel=s.xp>0?'#1':'—',h=await ssReadHomeSettings();
  if(h.enabled===false){
    return base('<div class="ss-final"><section class="ss-hero"><div class="ss-hero-copy"><div class="ss-eyebrow">SKILL SAGA</div><h1 class="ss-title">Home temporarily unavailable</h1><div class="ss-sub">The Home screen has been disabled by Skill Saga Admin.</div><button class="ss-action" onclick="window.go(\'play\')">Open Play →</button></div><div class="ss-hero-art"><div class="ss-hero-mascot">🏠</div></div></section></div>','home');
  }
  var d=ssQuizForHome('daily'),w=ssQuizForHome('weekly');
  var dailyTitle=d&&d.title||'Daily Challenge',dailyQs=d&&Array.isArray(d.questions)?d.questions.length:0,dailyDiff=d&&d.difficulty||'Mixed';
  var weeklyTitle=w&&w.title||'Weekly Challenge',weeklyQs=w&&Array.isArray(w.questions)?w.questions.length:0;
  var dailyMissionBlock=h.showDailyMission!==false?'<div class="ss-section"><b>Today\'s Mission</b><span onclick="window.go(\'play\')">View all →</span></div>':'';
  var dailyQuizBlock=h.showDailyQuiz!==false?'<div class="ss-card ss-blue-stats ss-home-challenge ss-home-daily" style="display:block;background:linear-gradient(135deg,#1769ff,#6544ec);color:#fff;padding:16px"><div style="font-size:9px;font-weight:900">DAILY QUIZ</div><div style="font-size:19px;font-weight:1000;margin:7px 0">'+esc(dailyTitle)+'</div><div style="font-size:10px">'+dailyQs+' Questions • '+esc(dailyDiff)+'</div><button class="ss-action" style="background:#fff;color:#1769ff" onclick="window.go(\'play\')">Open in Play →</button></div>':'';
  var weeklyBlock=h.showWeeklyQuiz!==false?'<div class="ss-section"><b>🏆 Weekly Quiz</b><span onclick="window.go(\'play\')">View in Play →</span></div><div class="ss-card ss-home-challenge ss-home-weekly" style="display:block;background:linear-gradient(135deg,#7a49e8,#b85eea);color:#fff;padding:16px"><div style="font-size:9px;font-weight:900">WEEKLY CHALLENGE</div><div style="font-size:19px;font-weight:1000;margin:7px 0">'+esc(weeklyTitle)+'</div><div style="font-size:10px">'+weeklyQs+' Questions • Weekly Skill Goal</div><button class="ss-action" style="background:#fff;color:#7a49e8" onclick="window.go(\'play\')">Open in Play →</button></div>':'';
  var statsBlock=h.showStats!==false?'<div class="ss-blue-stats"><div class="ss-stat"><div class="ss-stat-icon">⭐</div><b>'+s.xp.toLocaleString()+'</b><small>XP Points</small></div><div class="ss-stat"><div class="ss-stat-icon">🔥</div><b>'+s.streak+'</b><small>Day Streak</small></div><div class="ss-stat"><div class="ss-stat-icon">🏆</div><b>'+rankLabel+'</b><small>Current Rank</small></div></div>':'';
  var skillsBlock=h.showSkills!==false?'<div class="ss-section"><b>Your Skills</b><span onclick="window.go(\'learn\')">View all →</span></div><div class="ss-cards">'+[['🔢','Numerical',skillPct(u,'Numerical')+'%','ss-soft'],['🧪','Scientific Thinking',skillPct(u,'Scientific Thinking')+'%','ss-green'],['📖','Vocabulary',skillPct(u,'Vocabulary')+'%','ss-pink'],['🧠','Reasoning',skillPct(u,'Reasoning')+'%','ss-purple']].map(function(x){return '<div class="ss-card '+x[3]+' center"><div class="i">'+x[0]+'</div><b>'+x[1]+'</b><small style="font-weight:1000;color:#172542">'+x[2]+'</small></div>'}).join('')+'</div>':'';
  var milestoneBlock=h.showMilestone!==false?'<div class="ss-section"><b>Next Milestone</b><span>'+s.xp%500+'/500 XP</span></div><div class="ss-progress-card"><div style="display:flex;justify-content:space-between;font-size:10px;font-weight:900"><b>Level '+s.level+'</b><b>'+s.xp%500+'/500 XP</b></div><div class="ss-bar"><i style="width:'+Math.min(100,(s.xp%500)/5)+'%"></i></div><small style="display:block;color:#78869d;font-size:8px;margin-top:7px">Keep learning to reach your next level.</small></div>':'';
  var continueBlock=h.showContinueLearning!==false?'<div class="ss-section"><b>Continue Learning</b><span onclick="window.go(\'learn\')">Open Learn →</span></div><div class="ss-progress-card"><div class="ss-progress-row"><div class="ss-thumb">📚</div><div class="ss-progress-copy"><b>Continue your learning journey</b><small>Pick up where you left off in Learn.</small><div class="ss-bar"><i style="width:'+Math.min(100,Math.max(0,skillPct(u,'Numerical')))+'%"></i></div></div></div><button class="ss-action" onclick="window.go(\'learn\')">Continue →</button></div>':'';
  var notificationsBlock=h.showNotifications!==false?'<div class="ss-section"><b>Notifications</b><span onclick="window.go(\'profile\')">Open →</span></div><div class="ss-final-note">🔔 Stay updated with Skill Saga announcements and learning reminders.</div>':'';
  var note=h.showBottomNote!==false?'<div class="ss-final-note">💡 “Keep learning, keep growing, and unlock a brighter you!”</div>':'';
  var heroTitle=esc(h.welcomeTitle||'A smarter way to learn — one challenge at a time.');
  var quoteText=String(h.welcomeQuote||'Small Steps | Big Achievements!').replace(/\\|/g,'<br>');
  var heroQuote='<div class="ss-quote">'+quoteText+'</div>';
  var blocks={stats:statsBlock,dailyMission:dailyMissionBlock,dailyQuiz:dailyQuizBlock,weeklyQuiz:weeklyBlock,skills:skillsBlock,milestone:milestoneBlock,continueLearning:continueBlock,notifications:notificationsBlock,note:note};
  var order=String(h.sectionOrder||'stats,dailyMission,skills,milestone,continueLearning').split(',').map(function(x){return x.trim()}).filter(Boolean);
  var ordered='',seenSections={};
  order.forEach(function(k){if(blocks[k]&&!seenSections[k]){ordered+=blocks[k];seenSections[k]=1;}});
  ['stats','dailyMission','dailyQuiz','weeklyQuiz','skills','milestone','continueLearning','notifications','note'].forEach(function(k){if(blocks[k]&&!seenSections[k])ordered+=blocks[k]});
  return base('<div class="ss-final"><section class="ss-hero"><div class="ss-hero-copy"><div class="ss-eyebrow">LEARN • PLAY • COMPETE • GROW</div><h1 class="ss-title">'+heroTitle+'</h1><div class="ss-sub">Explore. Practice. Compete. Build a brighter tomorrow.</div>'+heroQuote+'</div><div class="ss-hero-art"><div class="ss-hero-circle"></div><div class="ss-hero-words">Play<br><b>Learn</b><br>Win<i></i></div><div class="ss-hero-mascot">🎓</div></div></section>'+ordered+'</div>','home');
}
async function ssLearnCurriculum(cls,board,state,stream){
  var rows=[];
  try{
    if(typeof cloudDb!=='undefined'&&cloudDb){
      var snap=await cloudDb.collection('curriculum').where('classNumber','==',Number(cls)).get();
      rows=snap.docs.map(function(d){return Object.assign({id:d.id},d.data())});
      if(!rows.length){
        var snap2=await cloudDb.collection('curriculum').where('classLevel','==',String(cls)).get();
        rows=snap2.docs.map(function(d){return Object.assign({id:d.id},d.data())});
      }
    }
  }catch(e){console.warn('Learn curriculum load failed',e)}
  board=String(board||window._ssLearnSelectedBoard||'CBSE');
  state=String(state||window._ssLearnSelectedState||'');
  stream=String(stream||window._ssLearnSelectedStream||'');
  rows=rows.filter(function(x){
    var b=String(x.board||'CBSE').trim();
    if(board==='State'){
      if(b!=='State'&&b!=='State Board')return false;
      if(state&&String(x.state||'').trim()&&String(x.state||'').trim()!==state)return false;
    }else if(b&&b!==board&&!(board==='CBSE'&&b==='CBSE / NCERT')&&!(board==='ICSE'&&b==='ICSE / ISC'))return false;
    if(Number(cls)>=11&&stream&&String(x.stream||'').trim()!==stream)return false;
    return true;
  });
  return rows;
}
function ssLearnUnique(rows,key){
  var seen={},out=[];
  (rows||[]).forEach(function(x){
    var v=String(x[key]||'').trim();
    if(v&&!seen[v]){seen[v]=1;out.push(v)}
  });
  return out;
}
function ssLearnSubjectIcon(name){
  var n=String(name||'').toLowerCase();
  if(n.indexOf('math')>=0||n.indexOf('numer')>=0)return '🔢';
  if(n.indexOf('science')>=0)return '🧪';
  if(n.indexOf('social')>=0||n.indexOf('geograph')>=0||n.indexOf('histor')>=0)return '🌍';
  if(n.indexOf('computer')>=0||n.indexOf('informat')>=0)return '💻';
  if(n.indexOf('hindi')>=0)return 'हिं';
  if(n.indexOf('english')>=0||n.indexOf('language')>=0)return '📘';
  return '📚';
}
async function learnFinal(){
  var u=U()||{};
  var selected=Number(window._ssLearnSelectedClass||u.studentClass||8);
  if(!selected||selected<1||selected>12)selected=8;
  var board=String(window._ssLearnSelectedBoard||u.board||'CBSE');
  var state=String(window._ssLearnSelectedState||u.state||'');
  var stream=String(window._ssLearnSelectedStream||u.stream||'');
  if(['CBSE','ICSE','State','Other'].indexOf(board)<0)board='CBSE';
  window._ssLearnSelectedBoard=board;
  window._ssLearnSelectedState=state;
  window._ssLearnSelectedStream=stream;
  var rows=await ssLearnCurriculum(selected,board,state,stream);
  var defaultSubjects=['English','Hindi','Mathematics','Science','Social Science','Computer & Technology','General Knowledge','Art & Creativity','Physical Education','Other'];
  var subjects=defaultSubjects.concat(ssLearnUnique(rows,'subject').filter(function(s){return defaultSubjects.indexOf(String(s))===-1;}));
  var subjectHtml=subjects.slice(0,12).map(function(s){
    var icon=ssLearnSubjectIcon(s),score=0,n=String(s).toLowerCase();
    if(n.indexOf('math')>=0)score=skillPct(u,'Numerical');
    else if(n.indexOf('science')>=0)score=skillPct(u,'Scientific Thinking');
    else if(n.indexOf('english')>=0||n.indexOf('hindi')>=0||n.indexOf('language')>=0)score=skillPct(u,'Vocabulary');
    else score=skillPct(u,'Reasoning');
    return '<div class="ss-subject" onclick="ssLearnSubject(\''+esc(s).replace(/'/g,"\\\'")+ '\')"><div class="i">'+icon+'</div><b>'+esc(s)+'</b><small>'+score+'% completed</small></div>';
  }).join('');
  var topics=ssLearnUnique(rows,'topic');
  var popular=topics.slice(0,4);
  var popularHtml=popular.map(function(t,i){
    var icons=['📐','🧮','📚','🧠'];
    return '<div class="ss-topic" onclick="ssLearnTopic(\''+esc(t).replace(/'/g,"\\\'")+ '\')"><div class="i">'+icons[i%icons.length]+'</div><b>'+esc(t)+'</b><small>Practice & learn</small></div>';
  }).join('');
  var continueTopic=topics[0]||'';
  base(`<div class="ss-final"><section class="ss-hero"><div class="ss-hero-copy"><div class="ss-eyebrow">LEARN</div><h1 class="ss-title">Explore. Understand. Grow.</h1><div class="ss-sub">Build your knowledge step by step with concepts, examples, videos and practice.</div><div class="ss-quote">“Better Learning. Brighter Tomorrow!”</div></div><div class="ss-hero-art"><div class="ss-hero-circle"></div><div class="ss-hero-mascot">📚</div></div></section><div class="ss-tabs"><button class="ss-tab active" onclick="learnFinal()"><span class="i">🎓</span><b>Academic</b><small>Class subjects</small></button><button class="ss-tab" onclick="learnSkills()"><span class="i">🧠</span><b>Skills</b><small>Thinking & skills</small></button><button class="ss-tab" onclick="learnOther()"><span class="i">🌍</span><b>Other</b><small>GK & life skills</small></button></div><div class="ss-section"><b>Choose Board</b><span>Academic pathway</span></div><select class="input" onchange="ssBoard(this.value)"><option value="CBSE" ${board==='CBSE'?'selected':''}>CBSE / NCERT</option><option value="ICSE" ${board==='ICSE'?'selected':''}>ICSE / ISC</option><option value="State" ${board==='State'?'selected':''}>State Board</option><option value="Other" ${board==='Other'?'selected':''}>Other</option></select>${board==='State'?'<div class="ss-section"><b>Choose State</b><span>State curriculum</span></div><select class="input" onchange="ssState(this.value)">'+ssStateOptions(state)+'</select>':''}${selected>=11?'<div class="ss-section"><b>Choose Stream</b><span>Senior secondary pathway</span></div><select class="input" onchange="ssStream(this.value)"><option value="">All streams</option><option value="Science" '+(stream==='Science'?'selected':'')+'>Science</option><option value="Commerce" '+(stream==='Commerce'?'selected':'')+'>Commerce</option><option value="Humanities" '+(stream==='Humanities'?'selected':'')+'>Humanities</option><option value="Vocational" '+(stream==='Vocational'?'selected':'')+'>Vocational</option></select>':''}<div class="ss-section"><b>Choose Your Class</b><span>Academic class</span></div><select class="input" onchange="ssClass(this.value)"><option value="1" ${selected===1?"selected":""}>Class 1</option><option value="2" ${selected===2?"selected":""}>Class 2</option><option value="3" ${selected===3?"selected":""}>Class 3</option><option value="4" ${selected===4?"selected":""}>Class 4</option><option value="5" ${selected===5?"selected":""}>Class 5</option><option value="6" ${selected===6?"selected":""}>Class 6</option><option value="7" ${selected===7?"selected":""}>Class 7</option><option value="8" ${selected===8?"selected":""}>Class 8</option><option value="9" ${selected===9?"selected":""}>Class 9</option><option value="10" ${selected===10?"selected":""}>Class 10</option><option value="11" ${selected===11?"selected":""}>Class 11</option><option value="12" ${selected===12?"selected":""}>Class 12</option></select></div><div class="ss-section"><b>Class ${selected} Subjects</b><span>${subjects.length?subjects.length+' available':'Not published yet'}</span></div><div class="ss-subjects">${subjects.length?subjectHtml:'<div class="ss-card" style="grid-column:1/-1"><b>No subjects published</b><small>Add this board/class curriculum from Admin → Curriculum.</small></div>'}</div>${topics.length?'<div class="ss-section"><b>Continue Learning</b><span>View all →</span></div><div class="ss-progress-card"><div class="ss-progress-row"><div class="ss-thumb">🔢</div><div class="ss-progress-copy"><b>'+esc(subjects[0]||'')+' • '+esc(continueTopic)+'</b><small>Continue from where you left off.</small><div class="ss-bar"><i style="width:'+skillPct(u,'Numerical')+'%"></i></div></div></div></div><div class="ss-section"><b>Popular Topics</b><span>Explore</span></div><div class="ss-popular">'+popularHtml+'</div>':''}<div class="ss-section"><b>Learning Note</b></div><div class="ss-final-note">📚 Learn concepts first, then practice and take a quiz to master the topic.</div></div>`,'learn');
}
async function ssLearnSubject(subject){
  var cls=Number(window._ssLearnSelectedClass||8),board=String(window._ssLearnSelectedBoard||'CBSE'),state=String(window._ssLearnSelectedState||''),stream=String(window._ssLearnSelectedStream||'');
  try{
    var materials=[],quizzes=[],topicRows=[];
    if(typeof cloudDb!=='undefined'&&cloudDb){
      var ms=await cloudDb.collection('learningMaterials').where('classNumber','==',cls).where('subject','==',subject).get();
      materials=ms.docs.map(function(d){return Object.assign({id:d.id},d.data())}).filter(function(x){return String(x.status||'').toLowerCase()==='published'&&String(x.board||'CBSE')===board&&(!state||!x.state||String(x.state)===state)&&(!stream||!x.stream||String(x.stream)===stream)});
      var qs=await cloudDb.collection('quizzes').where('classNumber','==',cls).where('subject','==',subject).get();
      quizzes=qs.docs.map(function(d){return Object.assign({id:d.id},d.data())}).filter(function(x){return String(x.status||'').toLowerCase()==='published'&&(!x.publishAtMs||Number(x.publishAtMs)<=Date.now())&&String(x.board||'CBSE')===board&&(!state||!x.state||String(x.state)===state)&&(!stream||!x.stream||String(x.stream)===stream)});
    }
    topicRows=await ssLearnCurriculum(cls,board,state,stream);
    var topics=ssLearnUnique(topicRows.filter(function(x){return String(x.subject||'')===String(subject)}),'topic');
    var topicCards=topics.map(function(t){return '<div class="ss-topic" onclick="ssLearnTopic('+JSON.stringify(t)+')"><div class="i">📘</div><b>'+esc(t)+'</b><small>Learn & practice</small></div>';}).join('');
    var resources=materials.map(function(x){var url=x.pdfUrl||x.fileUrl||x.url||'',kind=String(x.resourceType||x.type||'').toLowerCase(),isPdf=!!url&& (kind==='pdf'||/\\.pdf(?:$|\\?)/i.test(url));return '<div class="ss-card ss-soft"><div class="i">'+(isPdf?'📄':'📚')+'</div><b>'+esc(x.title||'Learning Material')+'</b><small>'+esc(x.chapter||'')+(x.topic?' • '+esc(x.topic):'')+'</small>'+(url?'<button class="ss-action" onclick="window.open('+JSON.stringify(url)+',\'_blank\')">'+(isPdf?'Open PDF':'Open Resource')+' →</button>':'<button class="ss-action" onclick="ssLearnTopic('+JSON.stringify(x.topic||x.chapter||x.title||'')+')">Open Lesson →</button>')+'</div>';}).join('');
    var quizCards=quizzes.map(function(x){return '<div class="ss-card ss-purple"><div class="i">📝</div><b>'+esc(x.title||'Quiz')+'</b><small>'+esc(x.chapter||'')+(x.topic?' • '+esc(x.topic):'')+' • '+(Array.isArray(x.questions)?x.questions.length:0)+' questions</small><button class="ss-action" onclick="startQuiz('+JSON.stringify(x.id)+')">Start Quiz →</button></div>';}).join('');
    base('<div class="ss-final"><div class="ss-section"><b>'+esc(subject)+'</b><span>Class '+cls+'</span></div><div class="ss-final-note">📚 '+esc(board)+(state?' • '+esc(state):'')+(stream?' • '+esc(stream):'')+'</div><div class="ss-section"><b>Topics</b><span>'+topics.length+' available</span></div><div class="ss-popular">'+(topicCards||'<div class="ss-card"><b>No topics published</b><small>Add chapters/topics in Admin → Curriculum.</small></div>')+'</div><div class="ss-section"><b>Learning Materials</b><span>'+materials.length+'</span></div><div class="ss-cards">'+(resources||'<div class="ss-card"><b>No materials published</b><small>Published PDF or lesson resources will appear here.</small></div>')+'</div><div class="ss-section"><b>Quizzes</b><span>'+quizzes.length+'</span></div><div class="ss-cards">'+(quizCards||'<div class="ss-card"><b>No quizzes published</b><small>Quizzes mapped to this subject will appear here.</small></div>')+'</div></div>','learn');
  }catch(e){if(typeof toast==='function')toast(e.message||'Could not load subject content.');}
}
function learnOther(){
  base('<div class="ss-final"><section class="ss-hero"><div class="ss-hero-copy"><div class="ss-eyebrow">OTHER</div><h1 class="ss-title">Explore Beyond the Classroom.</h1><div class="ss-sub">Add GK, life skills, sports, finance, creativity or any custom learning content.</div></div><div class="ss-hero-art"><div class="ss-hero-circle"></div><div class="ss-hero-mascot">🌍</div></div></section><div class="ss-tabs"><button class="ss-tab" onclick="learnFinal()"><span class="i">🎓</span><b>Academic</b><small>Class subjects</small></button><button class="ss-tab" onclick="learnSkills()"><span class="i">🧠</span><b>Skills</b><small>Thinking & skills</small></button><button class="ss-tab active"><span class="i">🌍</span><b>Other</b><small>Custom learning</small></button></div><div class="ss-section"><b>Other Learning</b><span>Admin controlled</span></div><div class="ss-cards"><div class="ss-card ss-soft"><div class="i">🌐</div><b>General Knowledge</b><small>Current affairs, world knowledge and discovery.</small></div><div class="ss-card ss-green"><div class="i">💰</div><b>Finance</b><small>Money, saving, budgeting and financial awareness.</small></div><div class="ss-card ss-pink"><div class="i">🏅</div><b>Sports</b><small>Sports knowledge, rules and healthy competition.</small></div><div class="ss-card ss-purple"><div class="i">🎨</div><b>Creativity & Life Skills</b><small>Creative thinking, communication and everyday skills.</small></div></div><div class="ss-final-note">Content published from Admin → Learning Materials or Question Bank can be organised into the Other section.</div></div>','learn');
}
async function ssLearnTopic(topic){
  var cls=Number(window._ssLearnSelectedClass||8),board=String(window._ssLearnSelectedBoard||'CBSE'),state=String(window._ssLearnSelectedState||''),stream=String(window._ssLearnSelectedStream||'');
  try{
    var rows=await ssLearnCurriculum(cls,board,state,stream),match=rows.filter(function(x){return String(x.topic||'')===String(topic)});
    if(match.length){
      var r=match[0],material=r.content||r.lesson||r.learningMaterial||'';
      if(material){
        base('<div class="ss-final"><div class="ss-section"><b>'+esc(topic)+'</b><span>Class '+cls+'</span></div><div class="ss-progress-card"><b>'+esc(r.subject||'Learning')+'</b><p class="muted" style="margin-top:8px;white-space:pre-wrap">'+esc(material)+'</p><button class="ss-action" onclick="ssLearnPractice('+JSON.stringify(cls)+','+JSON.stringify(r.subject||'')+','+JSON.stringify(r.chapter||'')+','+JSON.stringify(topic)+')">Practice this topic →</button></div></div>','learn');
        return;
      }
    }
  }catch(e){}
  if(typeof toast==='function')toast(topic+' selected. Add/publish its lesson content in Admin → Curriculum / Learning Materials.');
}
async function ssLearnPractice(cls,subject,chapter,topic){
  var board=String(window._ssLearnSelectedBoard||'CBSE'),state=String(window._ssLearnSelectedState||''),stream=String(window._ssLearnSelectedStream||'');
  if(typeof cloudDb==='undefined'||!cloudDb)return;
  try{
    var snap=await cloudDb.collection('questionBank').where('classNumber','==',Number(cls)).where('subject','==',subject).where('chapter','==',chapter).where('topic','==',topic).get();
    var rows=snap.docs.map(function(d){return Object.assign({id:d.id},d.data())}).filter(function(x){return String(x.status||'').toLowerCase()==='published' && String(x.board||'CBSE')===board && (!state || !x.state || String(x.state)===state) && (!stream || !x.stream || String(x.stream)===stream)});
    if(!rows.length)return toast('Practice questions for this topic are not published yet.');
    var quiz={id:'learn_'+cls+'_'+subject+'_'+chapter+'_'+topic,title:topic+' Practice',questions:rows.slice(0,10).map(function(x){return [String(x.question||''),String(x.options||'').split('|'),Number(x.correctAnswer||0),String(x.explanation||'')]})};
    window._ssLearnQuiz=quiz;
    if(typeof startQuiz==='function')return startQuiz(quiz);
  }catch(e){toast(e.message||'Could not load practice questions.')}
}
function learnSkills(){
  var u=U()||{},profileClass=Number(u.studentClass||u.classNumber||u.class||8);
  if(profileClass<1||profileClass>12)profileClass=8;
  var classCards=[1,2,3,4,5,6,7,8,9,10,11,12].map(function(n){
    var unlocked=n===profileClass;
    return '<div class="ss-lock '+(unlocked?'current':'')+'"><div class="i">'+(unlocked?'🔓':'🔒')+'</div><b>Class '+n+'</b><small>'+(unlocked?'Your profile class':'Locked for Class '+profileClass)+'</small><button onclick="'+(unlocked?"toast('Class "+n+" skills are unlocked for your profile.')":"toast('Class "+n+" skills are locked. Your profile class is Class "+profileClass+".')")+'">'+(unlocked?'✓ Unlocked':'Locked')+'</button></div>';
  }).join('');
  base(`<div class="ss-final"><section class="ss-hero"><div class="ss-hero-copy"><div class="ss-eyebrow">SKILLS</div><h1 class="ss-title">Think Better.<br>Learn Smarter.</h1><div class="ss-sub">Build reasoning, numerical, scientific and language skills alongside school learning.</div></div><div class="ss-hero-art"><div class="ss-hero-circle"></div><div class="ss-hero-mascot">🧠</div></div></section><div class="ss-tabs"><button class="ss-tab" onclick="learnFinal()"><span class="i">🎓</span><b>Academic</b><small>Class subjects</small></button><button class="ss-tab active"><span class="i">🧠</span><b>Skills</b><small>Thinking & skills</small></button><button class="ss-tab" onclick="learnOther()"><span class="i">🌍</span><b>Other</b><small>GK & life skills</small></button></div><div class="ss-section"><b>Locked / Unlocked Classes</b><span>Profile: Class ${profileClass}</span></div><div class="ss-locks">${classCards}</div><div class="ss-section"><b>Core Skills</b><span>Practice regularly</span></div><div class="ss-cards">${[['🔢','Numerical',skillPct(u,'Numerical')+'%','ss-soft'],['🧪','Scientific Thinking',skillPct(u,'Scientific Thinking')+'%','ss-green'],['📖','Vocabulary',skillPct(u,'Vocabulary')+'%','ss-pink'],['🧠','Reasoning',skillPct(u,'Reasoning')+'%','ss-purple'],['🧩','Problem Solving',skillPct(u,'Problem Solving')+'%','ss-yellow'],['💭','Memory',skillPct(u,'Memory')+'%','ss-soft']].map(function(x){return '<div class="ss-card center '+x[3]+'"><div class="i">'+x[0]+'</div><b>'+x[1]+'</b><small>'+x[2]+' mastery</small><button class="ss-action" onclick="ssSkillAction('+JSON.stringify(x[1])+')">Practice →</button></div>}).join('')}</div><div class="ss-section"><b>Puzzles</b><span>Sharpen your thinking</span></div><div class="ss-cards">${[['⚙️','Logic Puzzles'],['🧩','Number Puzzles'],['💡','Visual Reasoning'],['🎲','Word Puzzles']].map(function(x){return '<div class="ss-card ss-soft"><div class="i">'+x[0]+'</div><b>'+x[1]+'</b><small>Solve & think</small></div>}).join('')}</div><div class="ss-final-note">🎁 Your Skills class access follows the class selected in your Profile. Complete quizzes, earn XP and coins, and build mastery.</div></div>`,'learn');
}
function ssSkillAction(name){if(typeof toast==='function')toast(name+' practice is ready — content integration remains connected to the existing engine.');}
var SS_STATES=[['Uttar Pradesh','Uttar Pradesh Board']];
function ssStateOptions(selected){return '<option value="">Select State Board</option>'+SS_STATES.map(function(s){return '<option value="'+esc(s[0])+'"'+(s[0]===String(selected||'')?' selected':'')+'>'+esc(s[1])+'</option>'}).join('')}
function ssBoard(v){window._ssLearnSelectedBoard=String(v||'CBSE');if(window._ssLearnSelectedBoard!=='State')window._ssLearnSelectedState='';return learnFinal();}
function ssState(v){window._ssLearnSelectedState=String(v||'');return learnFinal();}
function ssClass(n){window._ssLearnSelectedClass=Number(n)||8;window._ssLearnSelectedStream='';return learnFinal();}
function ssStream(v){window._ssLearnSelectedStream=String(v||'');return learnFinal();}
function playFinal(){
  var u=U()||{},d=ssQuizForHome('daily'),w=ssQuizForHome('weekly');
  var today=challengeDateKey(),hist=Array.isArray(u.history)?u.history:[];
  var doneToday=hist.some(function(x){return x&&x.date&&String(x.date).slice(0,10)===today});
  var dailyId=d&&d.id?String(d.id):'',weeklyId=w&&w.id?String(w.id):'';
  var dailyQuestions=d&&Array.isArray(d.questions)?d.questions.length:0;
  var weeklyQuestions=w&&Array.isArray(w.questions)?w.questions.length:0;
  var dailyTitle=d&&d.title||"Today's Science Challenge";
  var weeklyTitle=w&&w.title||'Weekly Challenge';
  function safeId(id){return String(id||'').replace(/\\/g,"\\\\").replace(/'/g,"\'");}
  function quizButton(id,label,fallback){
    if(id)return '<button class="ss-action" style="background:#1769ff;color:#fff" onclick="startQuiz(\''+safeId(id)+'\')">'+label+' →</button>';
    return '<button class="ss-action" onclick="toast(\''+fallback+'\')">Not available</button>';
  }
  var dButton=quizButton(dailyId,doneToday?'Practice Daily':'Start Daily','Daily quiz is not published yet.');
  var wButton=quizButton(weeklyId,'Start Weekly','Weekly quiz is not published yet.');
  base('<div class="ss-final">'+
    '<section class="ss-hero"><div class="ss-hero-copy"><div class="ss-eyebrow">PLAY</div><h1 class="ss-title">Play. Practice. Master.</h1><div class="ss-sub">Choose a quiz, build your streak and turn practice into progress.</div><div class="ss-quote">“Every question makes you stronger!”</div></div><div class="ss-hero-art"><div class="ss-hero-circle"></div><div class="ss-hero-mascot">🎯</div></div></section>'+
    '<div class="ss-section"><b>Daily & Weekly Challenges</b><span>Live quizzes</span></div>'+
    '<div class="ss-home-play-grid">'+
      '<div class="ss-home-play-card ss-home-play-daily"><div class="ss-home-play-pill">DAILY</div><b>'+esc(dailyTitle)+'</b><small>'+dailyQuestions+' Questions • '+esc(d&&d.difficulty||'Mixed')+' • '+(doneToday?'Completed today':'Ready')+'</small>'+dButton+'</div>'+
      '<div class="ss-home-play-card ss-home-play-weekly"><div class="ss-home-play-pill">WEEKLY</div><b>'+esc(weeklyTitle)+'</b><small>'+weeklyQuestions+' Questions • Weekly skill goal</small>'+wButton+'</div>'+
    '</div>'+
    '<div class="ss-section"><b>Quiz Modes</b><span>More practice</span></div>'+
    '<div class="ss-play-modes">'+
      '<div class="ss-mode"><div class="i">⚡</div><b>Quick Quiz</b><small>5 questions • Fast practice</small><button class="ss-action" onclick="ssPlayAction(\'Quick Quiz\')">Start →</button></div>'+
      '<div class="ss-mode"><div class="i">📚</div><b>Practice</b><small>Practice by subject & topic</small><button class="ss-action" onclick="ssPlayAction(\'Practice\')">Start →</button></div>'+
      '<div class="ss-mode"><div class="i">🎯</div><b>Skill Quiz</b><small>Focus on core skills</small><button class="ss-action" onclick="ssPlayAction(\'Skill Quiz\')">Start →</button></div>'+
      '<div class="ss-mode"><div class="i">👩‍🏫</div><b>Assigned</b><small>Quizzes assigned to you</small><button class="ss-action" onclick="showStudentAssignments()">Open →</button></div>'+
    '</div>'+
    '<div class="ss-section"><b>Assigned Quizzes</b><span>View assigned</span></div>'+
    '<div class="ss-assigned"><div class="ss-assignment"><div class="i">📝</div><div class="ss-assignment-main"><b>Teacher Assignments</b><small>Complete quizzes assigned to your learning profile.</small></div><button onclick="showStudentAssignments()">Open</button></div></div>'+
    '<div class="ss-final-note">🎮 Play with purpose — practice, review mistakes and improve every day.</div>'+
    '</div>','play');
}
function ssPlayAction(mode){if(mode==='Daily Quiz'&&typeof legacyPlay==='function'){try{return legacyPlay()}catch(e){}}if(typeof toast==='function')toast(mode+' is ready — quiz integration remains connected to the existing engine.');}
function competeFinal(){var u=U()||{},cs=competitionStats(u);base(`<div class="ss-final"><section class="ss-hero blue"><div class="ss-hero-copy"><div class="ss-eyebrow">COMPETE</div><h1 class="ss-title">Challenge Yourself.<br>Show What You Know!</h1><div class="ss-sub">Take part in quizzes, win rewards, climb the leaderboard and become a Skill Saga champion!</div><div class="ss-quote">“Learn. Compete. Grow Together!”</div></div><div class="ss-hero-art"><div class="ss-hero-circle"></div><div class="ss-hero-words" style="color:#fff">Good<br><b style="color:#fff">Students</b><br>Make<br>Great<br>Champions!<i></i></div><div class="ss-hero-mascot">🏆</div></div></section><div class="ss-blue-stats"><div class="ss-stat"><div class="ss-stat-icon">🏆</div><b>${cs.joined}</b><small>Competitions Joined</small></div><div class="ss-stat"><div class="ss-stat-icon">📊</div><b>${cs.top3}</b><small>Top 3 Finishes</small></div><div class="ss-stat"><div class="ss-stat-icon">🥇</div><b>${cs.points}</b><small>Competition Points</small></div></div><div class="ss-section"><b>Competition Types</b><span>View All →</span></div><div class="ss-competition-grid">${[['🏆','Weekly Championship','Compete with students in your class'],['🎯','Subject Challenge','Test your subject mastery'],['👥','Class Challenge','Compete within your class'],['🏫','Inter-Class Quiz','Compete with other classes']].map(function(x){return '<div class="ss-comp"><div class="i">'+x[0]+'</div><b>'+x[1]+'</b><small>'+x[2]+'</small><button class="ss-action">Explore →</button></div>'}).join('')}</div><div class="ss-section"><b>Discussion Forum</b><span>View all →</span></div><div class="ss-forum"><b>💬 Learn. Discuss. Grow.</b><p>Ask questions, share ideas and discuss subjects, skills and competitions with the Skill Saga community.</p><button onclick="window.ssForum()">Open Discussion Forum →</button></div><div class="ss-section"><b>Upcoming Competitions</b><span>View All →</span></div><div class="ss-upcoming">${[['SEP 18','Maths Weekly Championship','Class 8 • 20 Questions • 30 Minutes'],['SEP 20','Science Challenge','Class 6–8 • 25 Questions • 30 Minutes'],['SEP 24','General Knowledge Showdown','Class 6–10 • 30 Questions • 30 Minutes']].map(function(x){return '<div class="ss-event"><div class="ss-date">'+x[0]+'</div><div class="ss-event-main"><b>'+x[1]+'</b><small>'+x[2]+'</small></div><button>Register</button></div>'}).join('')}</div><div class="ss-section"><b>Leaderboard (This Week)</b><span>View All →</span></div><div class="ss-board">${[['🥇','Aarav Sharma','2,850 XP'],['🥈','Diya Verma','2,610 XP'],['🥉','Rohan Mehta','2,430 XP'],['#18','You (Ashish)','850 XP']].map(function(x){return '<div class="ss-board-row"><div class="ss-board-rank">'+x[0]+'</div><div class="ss-avatar">👦</div><div class="ss-board-name">'+x[1]+'</div><div class="ss-board-xp">'+x[2]+'</div></div>'}).join('')}</div><div class="ss-final-note">🎁 Compete • Learn • Earn • Grow — every challenge makes you stronger.</div></div>`,'compete')}
async function forum(){
  var u=U();
  if(!u||!(typeof cloudDb!=='undefined'&&cloudDb)||!window.firebase)return typeof toast==='function'&&toast('Please sign in to use the Discussion Forum.');
  try{
    var ss=await cloudDb.collection('appSettings').doc('general').get();
    var settings=ss.exists?ss.data():{};
    if(settings.forumEnabled===false){
      base('<div class="ss-final"><section class="ss-hero"><div class="ss-hero-copy"><div class="ss-eyebrow">COMMUNITY</div><h1 class="ss-title">Discussion Forum</h1><div class="ss-sub">The forum is temporarily disabled by Skill Saga Admin.</div></div><div class="ss-hero-art"><div class="ss-hero-mascot">💬</div></div></section><div class="ss-final-note">Please check again later.</div></div>','compete');
      return;
    }
    var pubSnap=await cloudDb.collection('forumGroups').where('status','==','published').get();
    var ownSnap=await cloudDb.collection('forumGroups').where('ownerUid','==',u.uid).get();
    var seen={};
    var groups=pubSnap.docs.concat(ownSnap.docs).filter(function(d){if(seen[d.id])return false;seen[d.id]=true;return true}).map(function(d){return Object.assign({id:d.id},d.data())});
    var mine=groups.filter(function(g){return g.ownerUid===u.uid});
    var visible=groups.filter(function(g){return g.status==='published'||g.ownerUid===u.uid});
    var approval=settings.forumGroupApproval!==false;
    var groupHtml=visible.slice(0,60).map(function(g){
      var mineFlag=g.ownerUid===u.uid;
      return '<div class="ss-card">'+
        '<div style="font-size:22px">💬</div><b>'+esc(g.title||'Discussion Group')+'</b>'+
        '<small>'+esc(g.subject||'General')+' • Class '+esc(g.classLevel||'All')+' • '+esc(g.memberCount||0)+' members</small>'+
        '<small>'+esc(g.description||'')+'</small>'+
        '<small style="margin-top:6px;font-weight:900">'+(g.status==='pending'?'⏳ Pending admin approval':(mineFlag?'👑 You own this group':'Open learning discussion'))+'</small>'+
        '<button class="ss-action" onclick="ssOpenForumGroup(\''+esc(g.id)+'\')">'+(g.status==='pending'?'View':'Open')+' →</button>'+
      '</div>';
    }).join('');
    base('<div class="ss-final"><section class="ss-hero"><div class="ss-hero-copy"><div class="ss-eyebrow">COMMUNITY</div><h1 class="ss-title">Learn. Discuss. Grow.</h1><div class="ss-sub">Create learning groups, ask questions, share ideas and learn together.</div></div><div class="ss-hero-art"><div class="ss-hero-mascot">💬</div></div></section>'+
      '<div class="ss-card ss-soft" style="margin-bottom:10px"><b>Create a Discussion Group</b><small>Choose a class and subject. '+(approval?'New groups are reviewed by Admin before publication.':'New groups are published immediately and remain under Admin moderation.')+'</small>'+
      '<input id="fgTitle" class="input" placeholder="Group title">'+
      '<textarea id="fgDesc" class="area" rows="3" placeholder="What will learners discuss?"></textarea>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><input id="fgClass" class="input" type="number" min="1" max="12" placeholder="Class (1–12)"><input id="fgSubject" class="input" placeholder="Subject"></div>'+
      '<button class="ss-action" onclick="ssCreateForumGroup()">Create Group →</button></div>'+
      '<div class="ss-section"><b>My Groups ('+mine.length+')</b><span>Admin controlled</span></div>'+
      (mine.length?mine.slice(0,20).map(function(g){return '<div class="ss-card ss-purple"><b>👑 '+esc(g.title||'Discussion Group')+'</b><small>Class '+esc(g.classLevel||'All')+' • '+esc(g.subject||'General')+' • '+esc(g.status||'pending')+'</small><button class="ss-action" onclick="ssOpenForumGroup(\''+esc(g.id)+'\')">Open →</button></div>'}).join(''):'<div class="ss-card"><small>You have not created a group yet.</small></div>')+
      '<div class="ss-section"><b>Discover Groups</b><span>'+visible.length+' available</span></div>'+
      (groupHtml||'<div class="ss-card"><small>No published groups yet. Create the first learning discussion.</small></div>')+
      '<div class="ss-final-note">🛡️ Admin has final control over every group, post, reply and report.</div></div>','compete');
  }catch(e){if(typeof toast==='function')toast(e.message||'Could not load Discussion Forum.');}
}
window.ssCreateForumGroup=async function(){
  var u=U();if(!u||!(typeof cloudDb!=='undefined'&&cloudDb)||!window.firebase)return;
  var title=(document.getElementById('fgTitle')||{}).value||'',desc=(document.getElementById('fgDesc')||{}).value||'',cls=(document.getElementById('fgClass')||{}).value||'',sub=(document.getElementById('fgSubject')||{}).value||'';
  title=title.trim();desc=desc.trim();cls=cls.trim();sub=sub.trim();
  if(!title||!desc||!cls||!sub)return typeof toast==='function'&&toast('Enter group title, description, class and subject.');
  var n=Number(cls);if(n<1||n>12)return typeof toast==='function'&&toast('Class must be between 1 and 12.');
  try{
    var s=await cloudDb.collection('appSettings').doc('general').get(),cfg=s.exists?s.data():{};
    var status=cfg.forumGroupApproval===false?'published':'pending';
    var ref=await cloudDb.collection('forumGroups').add({title:title,description:desc,classLevel:n,subject:sub,ownerUid:u.uid,ownerName:u.name||u.displayName||'Learner',status:status,memberCount:1,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    try{
      await cloudDb.collection('forumGroupMembers').doc(ref.id+'_'+u.uid).set({groupId:ref.id,memberUid:u.uid,memberName:u.name||u.displayName||'Learner',role:'owner',joinedAt:firebase.firestore.FieldValue.serverTimestamp()});
    }catch(memberErr){
      console.warn('Owner membership will be created when the group is opened after publication.',memberErr);
    }
    if(typeof toast==='function')toast(status==='published'?'Group created ✓':'Group submitted for Admin approval ✓');
    forum();
  }catch(e){if(typeof toast==='function')toast(e.message||'Could not create group.');}
};
window.ssOpenForumGroup=async function(id){
  var u=U();if(!u||!(typeof cloudDb!=='undefined'&&cloudDb))return;
  try{
    var gSnap=await cloudDb.collection('forumGroups').doc(id).get();if(!gSnap.exists)return toast('Group not found.');
    var g=Object.assign({id:id},gSnap.data());
    if(g.status!=='published'&&g.ownerUid!==u.uid)return toast('This group is not published yet.');
    var isOwner=g.ownerUid===u.uid;
    var mem=null;
    if(isOwner){
      if(g.status==='published'){
        try{
          mem=await cloudDb.collection('forumGroupMembers').doc(id+'_'+u.uid).get();
          if(!mem.exists){
            await cloudDb.collection('forumGroupMembers').doc(id+'_'+u.uid).set({
              groupId:id,
              memberUid:u.uid,
              memberName:u.name||u.displayName||'Learner',
              role:'owner',
              joinedAt:firebase.firestore.FieldValue.serverTimestamp()
            });
            mem={exists:true};
          }
        }catch(ownerMemberErr){
          console.warn('Owner membership sync failed',ownerMemberErr);
          mem={exists:true};
        }
      }else{
        mem={exists:true};
      }
    }else{
      mem=await cloudDb.collection('forumGroupMembers').doc(id+'_'+u.uid).get();
      if(!mem.exists)return ssJoinForumGroup(id,g);
    }
    var ps=await cloudDb.collection('forumPosts').where('groupId','==',id).where('status','==','published').get();
    var posts=ps.docs.map(function(d){return Object.assign({id:d.id},d.data())}).sort(function(a,b){return String(b.createdAt||'').localeCompare(String(a.createdAt||''))});
    var body=posts.slice(0,50).map(function(p){
      return '<div class="ss-card"><div class="row"><b>'+esc(p.title||'Discussion')+'</b><span class="badge">'+esc(p.authorName||'Learner')+'</span></div><small>'+esc(String(p.body||''))+'</small><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:7px"><button class="ss-action" onclick="ssReplyForumPost(\''+esc(p.id)+'\')">Reply</button><button class="ss-action" style="background:#fff;color:#1769ff;border:1px solid #dfe6f2" onclick="ssReportForumPost(\''+esc(p.id)+'\')">Report</button></div><div id="reply_'+esc(p.id)+'"></div></div>';
    }).join('');
    base('<div class="ss-final"><section class="ss-hero"><div class="ss-hero-copy"><div class="ss-eyebrow">DISCUSSION GROUP</div><h1 class="ss-title">'+esc(g.title||'Discussion Group')+'</h1><div class="ss-sub">'+esc(g.description||'')+'</div></div><div class="ss-hero-art"><div class="ss-hero-mascot">👥</div></div></section>'+
      '<div class="ss-card ss-soft"><div class="row"><b>Class '+esc(g.classLevel||'All')+' • '+esc(g.subject||'General')+'</b><span class="badge">'+esc(g.memberCount||0)+' members</span></div><small>Owner: '+esc(g.ownerName||'Learner')+'</small></div>'+
      '<div class="ss-card"><b>Start a Discussion</b><input id="fpTitle" class="input" placeholder="Discussion title"><textarea id="fpBody" class="area" rows="4" placeholder="Ask a question or share an idea"></textarea><button class="ss-action" onclick="ssCreateForumPost(\''+esc(id)+'\')">Post →</button></div>'+
      '<div class="ss-section"><b>Published Discussions</b><span>'+posts.length+'</span></div>'+(body||'<div class="ss-card"><small>No published discussions yet.</small></div>')+
      (isOwner?'<div class="ss-final-note">👑 You are the Group Owner. Admin can override any group decision.</div>':'')+'</div>','compete');
  }catch(e){toast(e.message||'Could not open group.');}
};
window.ssJoinForumGroup=async function(id,g){
  var u=U();if(!u||!(typeof cloudDb!=='undefined'&&cloudDb))return;
  try{
    await cloudDb.collection('forumGroupMembers').doc(id+'_'+u.uid).set({groupId:id,memberUid:u.uid,memberName:u.name||u.displayName||'Learner',role:'member',joinedAt:firebase.firestore.FieldValue.serverTimestamp()});
    await cloudDb.collection('forumGroups').doc(id).update({memberCount:firebase.firestore.FieldValue.increment(1),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    toast('Joined group ✓');ssOpenForumGroup(id);
  }catch(e){toast(e.message||'Could not join group.');}
};
window.ssCreateForumPost=async function(groupId){
  var u=U();if(!u||!(typeof cloudDb!=='undefined'&&cloudDb))return;
  var t=(document.getElementById('fpTitle')||{}).value||'',b=(document.getElementById('fpBody')||{}).value||'';t=t.trim();b=b.trim();
  if(!t||!b)return toast('Enter a discussion title and message.');
  try{
    await cloudDb.collection('forumPosts').add({groupId:groupId,title:t,body:b,authorUid:u.uid,authorName:u.name||u.displayName||'Learner',status:'published',type:'post',createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    toast('Discussion posted ✓');ssOpenForumGroup(groupId);
  }catch(e){toast(e.message||'Could not submit discussion.');}
};
window.ssReplyForumPost=function(postId){
  var box=document.getElementById('reply_'+postId);if(!box)return;
  box.innerHTML='<textarea id="replyText_'+esc(postId)+'" class="area" rows="2" placeholder="Write a helpful reply"></textarea><button class="ss-action" onclick="ssSubmitForumReply(\''+esc(postId)+'\')">Submit Reply →</button>';
};
window.ssSubmitForumReply=async function(postId){
  var u=U();if(!u||!(typeof cloudDb!=='undefined'&&cloudDb))return;
  var el=document.getElementById('replyText_'+postId),body=(el&&el.value||'').trim();if(!body)return toast('Write a reply first.');
  try{
    var p=await cloudDb.collection('forumPosts').doc(postId).get();if(!p.exists)return toast('Discussion not found.');
    var d=p.data();
    await cloudDb.collection('forumPosts').add({groupId:d.groupId,parentId:postId,title:'Reply',body:body,authorUid:u.uid,authorName:u.name||u.displayName||'Learner',status:'published',type:'reply',createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    toast('Reply posted ✓');ssOpenForumGroup(d.groupId);
  }catch(e){toast(e.message||'Could not submit reply.');}
};
window.ssReportForumPost=async function(postId){
  var u=U();if(!u||!(typeof cloudDb!=='undefined'&&cloudDb))return;
  var reason=prompt('Why are you reporting this discussion?','Inappropriate or unrelated content');if(!reason)return;
  try{await cloudDb.collection('forumReports').add({postId:postId,reporterUid:u.uid,reason:reason.trim(),status:'open',createdAt:firebase.firestore.FieldValue.serverTimestamp()});toast('Report submitted ✓');}catch(e){toast(e.message||'Could not submit report.');}
};
function notificationCss(){if(document.getElementById('ss-notification-css'))return;var s=document.createElement('style');s.id='ss-notification-css';s.textContent=".ss-notification-bell{position:relative!important}.ss-notification-badge{position:absolute;right:3px;top:2px;min-width:15px;height:15px;padding:0 4px;border-radius:9px;background:#ef3f4f;color:#fff;font-size:9px;font-weight:1000;line-height:15px;text-align:center;border:2px solid #07152f;box-sizing:border-box}.ss-notification-new{display:inline-block;padding:3px 6px;border-radius:7px;background:#fff0f1;color:#d62f40;font-size:8px;font-weight:1000;margin-left:5px}.ss-notification-card{position:relative}.ss-notification-card.unread{border:1px solid #d7e4ff;box-shadow:0 7px 22px rgba(23,105,255,.10)}.ss-notification-card .ss-notification-time{display:block;margin-top:5px;font-size:9px;color:#8793a8}";document.head.appendChild(s)}
function ssNotificationSeenKey(){var u=U()||{};return 'skillSagaSeenNotifications_'+String(u.uid||'guest');}
function ssNotificationSeen(){try{var a=JSON.parse(localStorage.getItem(ssNotificationSeenKey())||'[]');return Array.isArray(a)?a:[]}catch(e){return []}}
function ssNotificationMarkSeen(ids){try{localStorage.setItem(ssNotificationSeenKey(),JSON.stringify(ids.slice(-200)))}catch(e){}}
async function ssPublishedNotifications(){
  var u=U()||{},role=String(u.role||'learner').toLowerCase(),arr=[];
  try{
    if(typeof cloudDb==='undefined'||!cloudDb)return [];
    var snap=await cloudDb.collection('notifications').where('status','==','published').get();
    arr=snap.docs.map(function(d){return Object.assign({id:d.id},d.data())}).filter(function(x){
      var a=String(x.audience||'all').toLowerCase();
      return a==='all'||a===role;
    });
    arr.sort(function(a,b){
      var at=a.createdAt&&typeof a.createdAt.toMillis==='function'?a.createdAt.toMillis():(a.createdAt&&a.createdAt.seconds?Number(a.createdAt.seconds)*1000:0);
      var bt=b.createdAt&&typeof b.createdAt.toMillis==='function'?b.createdAt.toMillis():(b.createdAt&&b.createdAt.seconds?Number(b.createdAt.seconds)*1000:0);
      return bt-at;
    });
  }catch(e){console.warn('Published notifications load failed',e)}
  return arr.slice(0,50);
}
async function ssRefreshNotificationBell(){
  notificationCss();
  var buttons=document.querySelectorAll('.top .iconbtn');
  if(!buttons.length)return;
  var bell=buttons[buttons.length-1];
  bell.classList.add('ss-notification-bell');
  var old=bell.querySelector('.ss-notification-badge');if(old)old.remove();
  var arr=await ssPublishedNotifications(),seen=ssNotificationSeen();
  var unread=arr.filter(function(x){return seen.indexOf(x.id)===-1}).length;
  if(unread){
    var b=document.createElement('span');b.className='ss-notification-badge';b.textContent=unread>99?'99+':String(unread);bell.appendChild(b);
  }
}
async function ssLiveNotifications(){
  var u=U();if(!u)return loginScreen();
  var requests=typeof loadLinkRequests==='function'?await loadLinkRequests():[];
  var requestHtml=requests.length?
    '<div class="section"><b>Pending Link Requests</b></div>'+
    requests.map(function(r){
      var role=r.fromRole==='teacher'?'👩‍🏫':'👨‍👩‍👧',roleText=r.fromRole==='teacher'?'Teacher':'Parent';
      return '<div class="card" style="margin-bottom:10px"><div class="row"><div style="font-size:28px">'+role+'</div><div style="flex:1"><b>'+esc(r.fromName||roleText)+'</b><div class="muted">'+esc(roleText)+' wants to connect with your Skill Saga learning profile.</div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn" onclick="respondLinkRequest(\''+r.id+'\',\'accepted\')">Accept</button><button class="btn light" onclick="respondLinkRequest(\''+r.id+'\',\'rejected\')">Reject</button></div></div></div></div>';
    }).join(''):'';
  var arr=await ssPublishedNotifications(),seen=ssNotificationSeen();
  var notificationHtml=arr.length?
    '<div class="section"><b>Admin Updates</b><span class="muted">'+arr.length+' published</span></div>'+
    arr.map(function(n){
      var unread=seen.indexOf(n.id)===-1;
      var dt=n.createdAt&&typeof n.createdAt.toDate==='function'?n.createdAt.toDate():null;
      var when=dt?dt.toLocaleString():'';
      return '<div class="card ss-notification-card '+(unread?'unread':'')+'" style="margin-bottom:10px"><div class="row"><div style="font-size:28px">🔔</div><div style="flex:1"><b>'+esc(n.title||'Notification')+(unread?'<span class="ss-notification-new">NEW</span>':'')+'</b><div class="muted" style="margin-top:4px">'+esc(n.body||'')+'</div>'+(when?'<span class="ss-notification-time">'+esc(when)+'</span>':'')+'</div></div></div>';
    }).join('')
    :'<div class="section"><b>Admin Updates</b></div><div class="card"><div class="muted">No admin announcements yet.</div></div>';
  shell('<div class="row" style="margin-bottom:14px"><div><h1 style="margin:0">Notifications</h1><div class="muted">Stay updated with your Skill Saga journey.</div></div></div>'+requestHtml+notificationHtml+'<div class="section"><b>For You</b><span class="muted">Your latest learning updates</span></div><div class="card" style="margin-bottom:10px"><div class="row"><div style="font-size:28px">🎯</div><div style="flex:1"><b>Daily Challenge is Ready</b><div class="muted" style="margin-top:4px">Complete today\'s challenge and keep building your streak.</div><button class="btn gold block" style="margin-top:10px" onclick="startQuiz(\''+daily().id+'\')">Start Challenge</button></div></div></div>'+ (u.streak>0?'<div class="card" style="margin-bottom:10px"><div class="row"><div style="font-size:28px">🔥</div><div style="flex:1"><b>'+u.streak+' day streak!</b><div class="muted" style="margin-top:4px">Keep practicing today to protect your learning streak.</div></div></div></div>':'<div class="card" style="margin-bottom:10px"><div class="row"><div style="font-size:28px">🌱</div><div style="flex:1"><b>Start Your Learning Streak</b><div class="muted" style="margin-top:4px">Complete a quiz today and begin building your streak.</div></div></div></div>'));
  ssNotificationMarkSeen(arr.map(function(x){return x.id}).concat(seen).filter(function(x,i,a){return a.indexOf(x)===i}));
}
function ensureFinalNav(){var nav=document.querySelector('.nav');if(!nav)return;nav.innerHTML='<button data-s="home">⌂<span>Home</span></button><button data-s="learn">▣<span>Learn</span></button><button data-s="play">▶<span>Play</span></button><button data-s="compete">🏆<span>Compete</span></button><button data-s="profile">●<span>Profile</span></button>';nav.querySelectorAll('button').forEach(function(b){b.onclick=function(){window.go(b.dataset.s)}})}
function bind(){css();notificationCss();ensureFinalNav()}
window.shell=function(content){legacyShell(content);ensureFinalNav()};
function profileFinal(){if(typeof legacyProfile==='function'){legacyProfile();}else{return;}setTimeout(function(){var nav=document.querySelector('.nav');if(!nav)return;nav.innerHTML='<button data-s="home">⌂<span>Home</span></button><button data-s="learn">▣<span>Learn</span></button><button data-s="play">▶<span>Play</span></button><button data-s="compete">🏆<span>Compete</span></button><button data-s="profile" class="active">●<span>Profile</span></button>';nav.querySelectorAll('button').forEach(function(b){b.onclick=function(){window.go(b.dataset.s)}});notificationCss();ssRefreshNotificationBell();},0)}
window.go=function(n){window.screen=n;if(n==='home')return homeFinal();if(n==='learn'||n==='skills')return learnFinal();if(n==='play')return playFinal();if(n==='compete')return competeFinal();if(n==='profile')return profileFinal();return legacyGo(n)};
window.home=homeFinal;window.play=playFinal;window.compete=competeFinal;window.notifications=ssLiveNotifications;window.skills=learnSkills;window.ssLearnSkills=learnSkills;window.ssClass=ssClass;window.ssPlayAction=ssPlayAction;window.ssForum=forum;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
