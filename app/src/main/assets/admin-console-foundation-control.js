/* Skill Saga — Learner App Foundation Admin Control v1
 * Controls Part A points 1–4: Startup, Authentication, First-time Setup and Home.
 * App-side settings are stored under appSettings/{startup|authentication|learnerSetup|home}.
 */
(function(){
'use strict';
function ok(){return ssAdminGuard()}
function db(){return ssAdminDB()}
function au(){return ssAdminAuth()}
function esc(v){return ssAdminEsc(v)}
function page(t,s,b){return ssAdminPage(t,s,b)}
function btn(t,f,k){return ssAdminButton(t,f,k)}
function val(id){var e=document.getElementById(id);return e?e.value.trim():''}
function checked(id){var e=document.getElementById(id);return !!(e&&e.checked)}
function field(id,l,v){return '<label>'+esc(l)+'</label><input id="'+id+'" class="input" value="'+esc(v==null?'':v)+'">'}
function check(id,l,v){return '<label style="display:flex;gap:8px;align-items:center;margin:10px 0"><input id="'+id+'" type="checkbox" '+(v?'checked':'')+'> <span>'+esc(l)+'</span></label>'}
async function readDoc(id,defaults){
  try{var s=await db().collection('appSettings').doc(id).get();return s.exists?Object.assign({},defaults,s.data()):Object.assign({},defaults)}catch(e){return Object.assign({},defaults)}
}
async function saveDoc(id,data){
  data.updatedBy=au().uid;
  data.updatedAt=new Date();
  await db().collection('appSettings').doc(id).set(data,{merge:true});
}
var DEFAULT_STARTUP={enabled:true,logo:'logo.png',appName:'Skill Saga',tagline:'A smarter way to learn',splashDuration:1200,maintenanceMode:false,maintenanceMessage:'Skill Saga is temporarily under maintenance. Please try again shortly.',minimumVersion:'1.0.0',latestVersion:'1.0.0',forceUpdate:false};
var DEFAULT_AUTH={emailLoginEnabled:true,emailSignupEnabled:true,passwordResetEnabled:true,mobileLoginEnabled:false,mobileSignupEnabled:false,learnerSignupEnabled:true,parentSignupEnabled:true,teacherSignupEnabled:true,requireProfileSetup:true,requireEmailVerification:false,requireTerms:true,minimumPasswordLength:6};
var DEFAULT_SETUP={enabled:true,requireBoard:true,requireClass:true,requireSubjects:true,requireLearningGoals:false,requireLearningProfile:false,boards:['CBSE'],classes:[1,2,3,4,5,6,7,8,9,10,11,12],defaultSubjects:[],goals:['Improve school performance','Practice regularly','Build core skills']};
var DEFAULT_HOME={enabled:true,showStats:true,showDailyMission:true,showDailyQuiz:true,showWeeklyQuiz:true,showSkills:true,showMilestone:true,showContinueLearning:true,showBottomNote:true,showNotifications:true,sectionOrder:'stats,dailyMission,skills,milestone,continueLearning',welcomeTitle:'A smarter way to learn — one challenge at a time.',welcomeQuote:'Small Steps | Big Achievements!'};

window.ssAdminFoundationControl=async function(){
  if(!ok())return;
  var s=await readDoc('startup',DEFAULT_STARTUP),a=await readDoc('authentication',DEFAULT_AUTH),o=await readDoc('learnerSetup',DEFAULT_SETUP),h=await readDoc('home',DEFAULT_HOME);
  page('Learner App Foundation','Part A — Startup, Login/Sign Up, First-time Learner Setup and Home controls.',
    '<div class="notice"><b>Foundation controls.</b> These settings control the learner app behaviour. Firebase Authentication provider enablement remains a Firebase project setting.</div>'+
    '<div class="grid">'+
      '<div class="tile" onclick="ssAdminFoundationSection(\'startup\')">🚀<b>Startup / Splash</b><small>Maintenance, minimum version and launch gate</small></div>'+
      '<div class="tile" onclick="ssAdminFoundationSection(\'authentication\')">🔐<b>Authentication</b><small>Login, signup, password reset and role signup</small></div>'+
      '<div class="tile" onclick="ssAdminFoundationSection(\'learnerSetup\')">🎓<b>First-time Setup</b><small>Board, class, subjects and learner goals</small></div>'+
      '<div class="tile" onclick="ssAdminFoundationSection(\'home\')">🏠<b>Home Control</b><small>Sections, visibility and welcome content</small></div>'+
    '</div>'+
    '<div class="section"><b>Current state</b></div>'+
    '<div class="card"><div class="row"><b>Startup</b><span class="badge">'+(s.maintenanceMode?'Maintenance':'Live')+'</span></div><div class="small muted">Minimum version: '+esc(s.minimumVersion)+'</div></div>'+
    '<div class="card"><div class="row"><b>Authentication</b><span class="badge">'+(a.emailLoginEnabled?'Email Login ON':'Email Login OFF')+'</span></div><div class="small muted">Mobile login: '+(a.mobileLoginEnabled?'ON':'OFF')+' • Profile setup: '+(a.requireProfileSetup?'Required':'Optional')+'</div></div>'+
    '<div class="card"><div class="row"><b>First-time Setup</b><span class="badge">'+(o.enabled?'Enabled':'Disabled')+'</span></div><div class="small muted">Board: '+(o.requireBoard?'Required':'Optional')+' • Class: '+(o.requireClass?'Required':'Optional')+'</div></div>'+
    '<div class="card"><div class="row"><b>Home</b><span class="badge">'+(h.enabled?'Enabled':'Disabled')+'</span></div><div class="small muted">Daily Mission: '+(h.showDailyMission?'ON':'OFF')+' • Skills: '+(h.showSkills?'ON':'OFF')+' • Continue: '+(h.showContinueLearning?'ON':'OFF')+'</div></div>'
  );
};
window.ssAdminFoundationSection=async function(section){
  if(!ok())return;
  if(section==='startup'){
    var s=await readDoc('startup',DEFAULT_STARTUP);
    return page('Startup / Splash Control','Control the app launch state without changing the learner UI code.',
      '<div class="card">'+
      check('fsEnabled','Startup gate enabled',s.enabled)+
      field('fsLogo','Logo path / URL',s.logo)+
      field('fsName','App name',s.appName)+
      field('fsTagline','Tagline',s.tagline)+
      field('fsDuration','Splash duration (milliseconds)',s.splashDuration)+
      check('fsMaintenance','Maintenance mode',s.maintenanceMode)+
      field('fsMessage','Maintenance message',s.maintenanceMessage)+
      field('fsMin','Minimum supported app version',s.minimumVersion)+
      field('fsLatest','Latest app version',s.latestVersion)+
      check('fsForce','Force update when version is below minimum',s.forceUpdate)+
      btn('Save Startup Settings','ssAdminFoundationSave(\'startup\')','gold')+
      '</div><div class="notice">The minimum-version comparison is an app-side gate. A production Android force-update flow will also need Play Store/AAB versioning.</div>');
  }
  if(section==='authentication'){
    var a=await readDoc('authentication',DEFAULT_AUTH);
    return page('Authentication & Accounts','Control which authentication paths are visible in Skill Saga.',
      '<div class="card">'+
      check('faEmailLogin','Email login',a.emailLoginEnabled)+
      check('faEmailSignup','Email signup',a.emailSignupEnabled)+
      check('faReset','Forgot-password reset',a.passwordResetEnabled)+
      check('faMobileLogin','Mobile OTP login',a.mobileLoginEnabled)+
      check('faMobileSignup','Mobile OTP signup',a.mobileSignupEnabled)+
      check('faLearner','Learner signup',a.learnerSignupEnabled)+
      check('faParent','Parent signup',a.parentSignupEnabled)+
      check('faTeacher','Teacher signup',a.teacherSignupEnabled)+
      check('faSetup','Require first-time learner setup',a.requireProfileSetup)+
      check('faVerify','Require email verification before learner access',a.requireEmailVerification)+
      check('faTerms','Require Terms & Privacy acceptance',a.requireTerms!==false)+
      field('faMinPass','Minimum password length',a.minimumPasswordLength||6)+
      btn('Save Authentication Settings','ssAdminFoundationSave(\'authentication\')','gold')+
      '</div><div class="notice">Provider activation (Email/Password or Phone) is configured in Firebase Authentication; these controls govern Skill Saga app-side availability.</div>');
  }
  if(section==='learnerSetup'){
    var o=await readDoc('learnerSetup',DEFAULT_SETUP);
    return page('First-time Learner Setup','Configure the onboarding sequence shown after a learner creates or first opens an account.',
      '<div class="card">'+check('foEnabled','First-time setup enabled',o.enabled)+
      check('foBoard','Board required',o.requireBoard)+
      check('foClass','Class required',o.requireClass)+
      check('foSubjects','Subjects required',o.requireSubjects)+
      check('foGoals','Learning goals required',o.requireLearningGoals)+
      check('foProfile','Learning profile required',o.requireLearningProfile)+
      field('foBoards','Boards (comma separated)',(o.boards||[]).join(', '))+
      field('foClasses','Classes (comma separated)',(o.classes||[]).join(', '))+
      field('foSubjectsList','Default subjects (comma separated)',(o.defaultSubjects||[]).join(', '))+
      field('foGoalsList','Learning goals (comma separated)',(o.goals||[]).join(', '))+
      btn('Save First-time Setup','ssAdminFoundationSave(\'learnerSetup\')','gold')+
      '</div>');
  }
  if(section==='home'){
    var h=await readDoc('home',DEFAULT_HOME);
    return page('Home Control','Control the learner Home screen sections and messaging.',
      '<div class="card">'+check('fhEnabled','Home enabled',h.enabled)+
      check('fhStats','Show XP / Streak / Rank stats',h.showStats)+
      check('fhDaily','Show Today\'s Mission',h.showDailyMission)+
      check('fhDailyQuiz','Show Daily Quiz card',h.showDailyQuiz!==false)+
      check('fhWeeklyQuiz','Show Weekly Quiz card',h.showWeeklyQuiz!==false)+
      check('fhSkills','Show Your Skills',h.showSkills)+
      check('fhMilestone','Show Next Milestone',h.showMilestone)+
      check('fhContinue','Show Continue Learning',h.showContinueLearning)+
      check('fhNote','Show bottom motivational note',h.showBottomNote)+
      check('fhNotifications','Show notification entry point',h.showNotifications)+
      field('fhOrder','Section order (stats,dailyMission,skills,milestone,continueLearning)',h.sectionOrder)+
      field('fhTitle','Welcome subtitle',h.welcomeTitle)+
      field('fhQuote','Welcome quote (use | for line break)',h.welcomeQuote)+
      btn('Save Home Settings','ssAdminFoundationSave(\'home\')','gold')+
      '</div>');
  }
};
window.ssAdminFoundationSave=async function(section){
  if(!ok())return;
  try{
    var d={};
    if(section==='startup'){
      d={enabled:checked('fsEnabled'),logo:val('fsLogo')||DEFAULT_STARTUP.logo,appName:val('fsName')||DEFAULT_STARTUP.appName,tagline:val('fsTagline')||DEFAULT_STARTUP.tagline,splashDuration:Math.max(0,Number(val('fsDuration')||DEFAULT_STARTUP.splashDuration)),maintenanceMode:checked('fsMaintenance'),maintenanceMessage:val('fsMessage')||DEFAULT_STARTUP.maintenanceMessage,minimumVersion:val('fsMin')||DEFAULT_STARTUP.minimumVersion,latestVersion:val('fsLatest')||DEFAULT_STARTUP.latestVersion,forceUpdate:checked('fsForce')};
    }else if(section==='authentication'){
      d={emailLoginEnabled:checked('faEmailLogin'),emailSignupEnabled:checked('faEmailSignup'),passwordResetEnabled:checked('faReset'),mobileLoginEnabled:checked('faMobileLogin'),mobileSignupEnabled:checked('faMobileSignup'),learnerSignupEnabled:checked('faLearner'),parentSignupEnabled:checked('faParent'),teacherSignupEnabled:checked('faTeacher'),requireProfileSetup:checked('faSetup'),requireEmailVerification:checked('faVerify'),requireTerms:checked('faTerms'),minimumPasswordLength:Math.min(128,Math.max(6,Number(val('faMinPass')||6)))};
    }else if(section==='learnerSetup'){
      d={enabled:checked('foEnabled'),requireBoard:checked('foBoard'),requireClass:checked('foClass'),requireSubjects:checked('foSubjects'),requireLearningGoals:checked('foGoals'),requireLearningProfile:checked('foProfile'),boards:val('foBoards').split(',').map(function(x){return x.trim()}).filter(Boolean),classes:val('foClasses').split(',').map(function(x){return Number(x.trim())}).filter(function(x){return !isNaN(x)}),defaultSubjects:val('foSubjectsList').split(',').map(function(x){return x.trim()}).filter(Boolean),goals:val('foGoalsList').split(',').map(function(x){return x.trim()}).filter(Boolean)};
    }else if(section==='home'){
      d={enabled:checked('fhEnabled'),showStats:checked('fhStats'),showDailyMission:checked('fhDaily'),showDailyQuiz:checked('fhDailyQuiz'),showWeeklyQuiz:checked('fhWeeklyQuiz'),showSkills:checked('fhSkills'),showMilestone:checked('fhMilestone'),showContinueLearning:checked('fhContinue'),showBottomNote:checked('fhNote'),showNotifications:checked('fhNotifications'),sectionOrder:val('fhOrder')||DEFAULT_HOME.sectionOrder,welcomeTitle:val('fhTitle')||DEFAULT_HOME.welcomeTitle,welcomeQuote:val('fhQuote')||DEFAULT_HOME.welcomeQuote};
    }else return;
    await saveDoc(section,d);
    toast('Settings saved ✓');
    ssAdminFoundationControl();
  }catch(e){toast(e.message||'Could not save settings')}
};
})();