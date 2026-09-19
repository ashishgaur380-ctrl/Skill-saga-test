/* Skill Saga Admin operations - non-content administration */
(function(){'use strict';
function ok(){return ssAdminGuard()}function db(){return ssAdminDB()}function au(){return ssAdminAuth()}function ts(){return ssAdminStamp()}function esc(v){return ssAdminEsc(v)}function page(t,s,b){return ssAdminPage(t,s,b)}function btn(t,f,k){return ssAdminButton(t,f,k)}function docs(c){return ssAdminDocs(c)}function toastx(x){if(window.toast)toast(x)}
function val(id){var e=document.getElementById(id);return e?e.value.trim():''}
function input(id,p,v){return '<input id="'+id+'" class="input" placeholder="'+esc(p)+'" value="'+esc(v||'')+'">'}
function area(id,p,v){return '<textarea id="'+id+'" class="area" rows="3" placeholder="'+esc(p)+'">'+esc(v||'')+'</textarea>'}
window.ssAdminCompetitions=async function(){if(!ok())return;var a=await docs('competitions');page('Competition Manager','Create and manage competitions. Select existing quiz IDs instead of duplicating quiz content.','<div class="card admin">'+btn('＋ Create Competition','ssAdminCompetitionForm()','gold')+'</div>'+(a.length?a.slice(0,100).map(function(x){return '<div class="card"><div class="row"><b>'+esc(x.title||'Competition')+'</b><span class="badge">'+esc(x.status||'draft')+'</span></div><div class="small muted">'+esc(x.type||'')+' • '+esc(x.startAt||'')+' → '+esc(x.endAt||'')+'<br>Quiz IDs: '+esc(Array.isArray(x.quizIds)?x.quizIds.join(', '):(x.quizIds||'—'))+'</div>'+btn('Edit','ssAdminCompetitionForm(\''+esc(x.id)+'\')')+'</div>'}).join(''):'<div class="card">No competitions yet.</div>'))};
window.ssAdminCompetitionForm=async function(id){if(!ok())return;var x={};if(id){var s=await db().collection('competitions').doc(id).get();if(s.exists)x=s.data()}page(id?'Edit Competition':'Create Competition','Configure schedule, eligibility and existing quiz references.','<div class="card">'+input('cpTitle','Competition title',x.title)+input('cpType','Type (Skill Sprint / Weekly Challenge / etc.)',x.type)+input('cpCategory','Category',x.category)+input('cpClass','Class level',x.classLevel)+input('cpSubject','Subject',x.subject)+input('cpStart','Start date/time',x.startAt)+input('cpEnd','End date/time',x.endAt)+input('cpDuration','Duration in minutes',x.durationMinutes)+input('cpCount','Question count',x.questionCount)+input('cpQuizIds','Existing quiz IDs (comma separated)',Array.isArray(x.quizIds)?x.quizIds.join(','):x.quizIds)+input('cpEntry','Entry coins',x.entryCoins)+area('cpDesc','Description',x.description)+btn('Save Competition','ssAdminSaveCompetition('+JSON.stringify(id||'')+')','gold')+'</div>')};
window.ssAdminSaveCompetition=async function(id){if(!ok())return;var title=val('cpTitle');if(!title)return toastx('Enter a competition title.');var ids=val('cpQuizIds').split(',').map(function(x){return x.trim()}).filter(Boolean);try{if(ids.length){var q=await Promise.all(ids.map(function(x){return db().collection('quizzes').doc(x).get()}));var bad=ids.filter(function(x,i){return !q[i].exists});if(bad.length)return toastx('Unknown quiz ID(s): '+bad.join(', '))}var d={title:title,type:val('cpType'),category:val('cpCategory'),classLevel:val('cpClass'),subject:val('cpSubject'),startAt:val('cpStart'),endAt:val('cpEnd'),durationMinutes:Number(val('cpDuration'))||0,questionCount:Number(val('cpCount'))||0,quizIds:ids,entryCoins:Number(val('cpEntry'))||0,description:val('cpDesc'),status:'draft',published:false,updatedBy:au().uid,updatedAt:ts()};if(id)await db().collection('competitions').doc(id).set(d,{merge:true});else{d.createdBy=au().uid;d.createdAt=ts();await db().collection('competitions').add(d)}toastx('Competition saved ✓');ssAdminCompetitions()}catch(e){toastx(e.message||'Could not save competition')}};
function assignmentGroupId(){return 'asg_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
function learnerField(u,a,b,c){u=u||{};return String(u[a]||u[b]||u[c]||'').trim()}
window.ssAdminAssignments=async function(){
 if(!ok())return;
 try{
   var a=await docs('assignments'), groups={}, order=[];
   a.forEach(function(x){
     if(!x)return;
     var gid=x.assignmentGroupId||x.id;
     if(!groups[gid]){groups[gid]={id:gid,representative:x,count:0};order.push(gid)}
     groups[gid].count++;
   });
   var cards=order.slice(0,100).map(function(g){
     var x=(g&&g.representative)||{},target=x.targetType||'individual',scope=target==='individual'?(x.studentName||x.studentUid||x.learnerUid||'—'):(target==='class'?'Class '+(x.targetValue||'—'):target==='school'?'School: '+(x.targetValue||'—'):'District: '+(x.targetValue||'—'));
     return '<div class="card">'+
       '<div class="row"><b>'+esc(x.title||x.assignmentTitle||'Assignment')+'</b><span class="badge">'+esc(x.status||'assigned')+'</span></div>'+
       '<div class="small muted">Teacher: '+esc(x.teacherName||x.teacherUid||x.assignedBy||'—')+
       '<br>Target: '+esc(scope)+
       '<br>Quiz: '+esc(x.quizTitle||x.quizId||'—')+
       '<br>Learners: '+esc(x.targetCount||g.count)+
       (x.dueAt?'<br>Due: '+esc(x.dueAt):'')+
       '</div>'+
       '<div class="row" style="margin-top:8px">'+
       btn('Edit','ssAdminAssignmentForm("'+esc(x.id)+'")')+
       btn('Delete','ssAdminAssignmentDelete("'+esc(x.id)+'")','light')+
       '</div></div>';
   }).join('');
   page('Assignments','Create and manage assignments for individual learners, classes, schools or districts.',
     '<div class="card admin">'+btn('＋ Create Assignment','ssAdminAssignmentForm("")','gold')+
     '<p class="small muted">Group assignments create one learner record per matching student and keep a shared assignment group for management.</p></div>'+
     (cards||'<div class="card">No assignments found.</div>'));
 }catch(e){toastx(e.message||'Could not load assignments')}
};
window.ssAdminAssignmentForm=async function(id){
 if(!ok())return;
 try{
   var x={},users=await docs('users'),quizzes=await docs('quizzes');
   if(id){var s=await db().collection('assignments').doc(id).get();if(s.exists)x=s.data()}
   var teachers=users.filter(function(u){return u.role==='teacher'}),
       learners=users.filter(function(u){return !u.role||u.role==='learner'});
   function opt(value,label,selected){return '<option value="'+esc(value)+'"'+(String(value||'')===String(selected||'')?' selected':'')+'>'+esc(label)+'</option>'}
   function uniqBy(fields){
     var m={};
     return learners.map(function(u){return learnerField(u,fields[0],fields[1],fields[2])}).filter(function(v){if(!v||m[v])return false;m[v]=1;return true}).sort();
   }
   var schools=uniqBy(['school','schoolName','schoolTitle']),
       districts=uniqBy(['district','schoolDistrict','districtName']),
       classes=uniqBy(['studentClass','classNumber','classLevel']);
   var targetType=x.targetType||(x.studentUid?'individual':'individual'),targetValue=x.targetValue||'';
   var th='<label>Teacher</label><select id="asTeacher" class="input">'+opt('','Select teacher',x.teacherUid)+teachers.map(function(u){return opt(u.uid||u.id,u.name||u.displayName||u.email||'Teacher',x.teacherUid)}).join('')+'</select>';
   var target='<label>Assignment target</label><select id="asTargetType" class="input">'+
     opt('individual','Individual learner',targetType)+opt('class','Class level',targetType)+opt('school','Entire school',targetType)+opt('district','Entire district',targetType)+'</select>'+
     '<label>Target value</label><select id="asTargetValue" class="input">'+opt('',targetType==='individual'?'Select learner':targetType==='class'?'Select class':targetType==='school'?'Select school':'Select district',targetValue)+
     (targetType==='individual'?learners.map(function(u){return opt(u.uid||u.id,(u.name||u.displayName||u.email||'Learner')+' • '+learnerField(u,'school','schoolName','schoolTitle')+' • '+learnerField(u,'district','schoolDistrict','districtName')+' • Class '+learnerField(u,'studentClass','classNumber','classLevel'),targetValue)}).join(''):
      targetType==='class'?classes.map(function(v){return opt(v,'Class '+v,targetValue)}).join(''):
      targetType==='school'?schools.map(function(v){return opt(v,v,targetValue)}).join(''):
      districts.map(function(v){return opt(v,v,targetValue)}).join(''))+'</select>'+
     '<div id="asScopeHint" class="small muted">Individual: assign to one learner.</div>';
   var q='<label>Quiz</label><select id="asQuiz" class="input">'+opt('','Select quiz',x.quizId)+quizzes.map(function(v){return opt(v.id,v.title||'Quiz',x.quizId)}).join('')+'</select>';
   var statuses=['assigned','draft','completed','cancelled'];
   var st='<label>Status</label><select id="asStatus" class="input">'+statuses.map(function(v){return opt(v,v,x.status||'assigned')}).join('')+'</select>';
   page(id?'Edit Assignment':'Create Assignment','Assign an existing quiz to an individual learner, class, school or district.',
     '<div class="card">'+input('asTitle','Assignment title',x.title||x.assignmentTitle)+area('asDesc','Description',x.description)+th+target+q+input('asDue','Due date/time',x.dueAt||'')+st+
     '<p class="small muted">Group targets create one assignment record per matching learner and share one assignment group for Edit/Delete management.</p>'+
     btn('Save Assignment','ssAdminAssignmentSave("'+esc(id||'')+'")','gold')+'</div>');
   var tt=document.getElementById('asTargetType'),tv=document.getElementById('asTargetValue'),hint=document.getElementById('asScopeHint');
   function refreshTarget(){
     if(!tt||!tv)return;
     var typ=tt.value,vals=[],labels=[];
     if(typ==='individual'){vals=learners.map(function(u){return u.uid||u.id});labels=learners.map(function(u){return (u.name||u.displayName||u.email||'Learner')+' • '+learnerField(u,'school','schoolName','schoolTitle')+' • '+learnerField(u,'district','schoolDistrict','districtName')+' • Class '+learnerField(u,'studentClass','classNumber','classLevel')})}
     else if(typ==='class'){vals=classes;labels=classes.map(function(v){return 'Class '+v})}
     else if(typ==='school'){vals=schools;labels=schools}
     else{vals=districts;labels=districts}
     tv.innerHTML=opt('',typ==='individual'?'Select learner':typ==='class'?'Select class':typ==='school'?'Select school':'Select district','')+vals.map(function(v,i){return opt(v,labels[i],'')}).join('');
     hint.textContent=typ==='individual'?'Individual: assign to one learner.':typ==='class'?'Class: assigns to every learner in the selected class.':typ==='school'?'School: assigns to every learner in the selected school.':'District: assigns to every learner in the selected district.';
   }
   if(tt)tt.addEventListener('change',refreshTarget);
 }catch(e){toastx(e.message||'Could not open assignment form')}
};
window.ssAdminAssignmentSave=async function(id){
 if(!ok())return;
 var title=val('asTitle'),teacher=val('asTeacher'),quiz=val('asQuiz'),targetType=val('asTargetType'),targetValue=val('asTargetValue');
 if(!title)return toastx('Enter an assignment title.');
 if(!teacher)return toastx('Select a teacher.');
 if(!targetType||!targetValue)return toastx('Select an assignment target.');
 if(!quiz)return toastx('Select a quiz.');
 try{
   var t=await db().collection('users').doc(teacher).get(),q=await db().collection('quizzes').doc(quiz).get();
   if(!t.exists)return toastx('Selected teacher was not found.');
   if(!q.exists)return toastx('Selected quiz was not found.');
   var learners=await docs('users'),matches=[];
   if(targetType==='individual')matches=learners.filter(function(u){return (u.uid||u.id)===targetValue&&(!u.role||u.role==='learner')});
   else if(targetType==='class')matches=learners.filter(function(u){return (!u.role||u.role==='learner')&&learnerField(u,'studentClass','classNumber','classLevel')===String(targetValue)});
   else if(targetType==='school')matches=learners.filter(function(u){return (!u.role||u.role==='learner')&&learnerField(u,'school','schoolName','schoolTitle')===String(targetValue)});
   else if(targetType==='district')matches=learners.filter(function(u){return (!u.role||u.role==='learner')&&learnerField(u,'district','schoolDistrict','districtName')===String(targetValue)});
   if(!matches.length)return toastx('No learners match this target.');
   var status=val('asStatus')||'assigned',gid=assignmentGroupId();
   var base={title:title,assignmentTitle:title,description:val('asDesc'),teacherUid:teacher,teacherName:t.data().name||t.data().displayName||t.data().email||'Teacher',quizId:quiz,quizTitle:q.data().title||'Quiz',dueAt:val('asDue'),status:status,targetType:targetType,targetValue:targetValue,targetCount:matches.length,assignmentGroupId:gid,updatedBy:au().uid,updatedAt:ts()};
   if(id){
     var existing=await db().collection('assignments').doc(id).get();
     if(!existing.exists)return toastx('Assignment was not found.');
     var old=existing.data(),oldGid=old.assignmentGroupId||id,oldDocs=await docs('assignments'),groupDocs=oldDocs.filter(function(d){return (d.assignmentGroupId||d.id)===oldGid});
     if(groupDocs.length>1||old.assignmentGroupId){
       if(old.status==='completed')return toastx('Completed group assignments cannot be retargeted.');
       for(var j=0;j<groupDocs.length;j++)await db().collection('assignments').doc(groupDocs[j].id).delete();
       for(var k=0;k<matches.length;k++){var gu=matches[k];await db().collection('assignments').add(Object.assign({},base,{studentUid:gu.uid||gu.id,studentName:gu.name||gu.displayName||gu.email||'Learner',createdBy:old.createdBy||au().uid,createdAt:old.createdAt||ts()}))}
     }else{
       var one=matches[0];
       await db().collection('assignments').doc(id).set(Object.assign({},base,{studentUid:one.uid||one.id,studentName:one.name||one.displayName||one.email||'Learner',assignmentGroupId:gid}),{merge:true});
     }
   }else{
     for(var i=0;i<matches.length;i++){var u=matches[i];await db().collection('assignments').add(Object.assign({},base,{studentUid:u.uid||u.id,studentName:u.name||u.displayName||u.email||'Learner',createdBy:au().uid,createdAt:ts()}))}
   }
   toastx('Assignment saved ✓ ('+matches.length+' learner'+(matches.length===1?'':'s')+')');
   ssAdminAssignments();
 }catch(e){toastx(e.message||'Could not save assignment')}
};
window.ssAdminAssignmentDelete=async function(id){
 if(!ok()||!id)return;
 try{
   var existing=await db().collection('assignments').doc(id).get();
   if(!existing.exists)return toastx('Assignment was not found.');
   var x=existing.data(),gid=x.assignmentGroupId||id,a=await docs('assignments'),group=a.filter(function(d){return (d.assignmentGroupId||d.id)===gid});
   if(!confirm('Delete this assignment'+(group.length>1?' for all '+group.length+' learners':'')+' permanently?'))return;
   for(var i=0;i<group.length;i++)await db().collection('assignments').doc(group[i].id).delete();
   toastx('Assignment deleted ✓'+(group.length>1?' ('+group.length+' learners)':''));
   ssAdminAssignments();
 }catch(e){toastx(e.message||'Could not delete assignment')}
};
window.ssAdminV3Leaderboards=async function(){
 if(!ok())return;
 try{
   var users=await docs('users'), learners=users.filter(function(x){return !x.role||x.role==='learner'});
   learners.sort(function(a,b){return Number(b.xp||0)-Number(a.xp||0)});
   var rows=learners.slice(0,100).map(function(x,i){
     return '<div class="card"><div class="row"><b>#'+(i+1)+' '+esc(x.name||x.displayName||x.email||'Learner')+'</b><span class="badge">'+Number(x.xp||0)+' XP</span></div><div class="small muted">Level '+esc(x.level||1)+' • 🔥 '+esc(x.streak||0)+' day streak • Class '+esc(x.studentClass||x.classNumber||'—')+' • School '+esc(x.school||'—')+' • District '+esc(x.district||x.schoolDistrict||'—')+'</div></div>';
   }).join('');
   page('Leaderboards','Live leaderboard generated from learner XP. This is the same XP-based ranking used by the learner Compete screen.',
     '<div class="notice"><b>Live ranking:</b> '+learners.length+' learners found. Rankings update from learner XP; no separate leaderboard record is required.</div>'+
     '<div class="card admin"><b>Current ranking scope</b><p class="small muted">Learner-facing leaderboard currently shows the overall top learners by XP.</p><div class="grid"><div class="tile"><b>'+learners.length+'</b><small>Learners</small></div><div class="tile"><b>'+((learners[0]&&learners[0].xp)||0)+'</b><small>Top XP</small></div><div class="tile"><b>'+Math.min(20,learners.length)+'</b><small>Learner top list</small></div></div></div>'+
     (rows||'<div class="card">No learner ranking data yet.</div>')
   );
 }catch(e){toastx(e.message||'Could not load leaderboard')}
};
if(!window.ssAdminV3Rewards)window.ssAdminV3Rewards=async function(){if(!ok())return;var r=await docs('rewards'),bds=await docs('badges');page('Rewards & Badges','Manage reward and badge definitions used by the learner experience.','<div class="card admin">'+btn('＋ Add Reward','ssAdminV3RewardForm()','gold')+'</div><div class="section"><b>Rewards ('+r.length+')</b></div>'+(r.length?r.slice(0,100).map(function(x){return '<div class="card"><div class="row"><b>'+esc(x.title||x.name||'Reward')+'</b><span class="badge">'+esc(x.status||'draft')+'</span></div><div class="small muted">Coins: '+esc(x.coins||0)+' • XP: '+esc(x.xp||0)+'<br>'+esc(x.description||'')+'</div></div>'}).join(''):'<div class="card">No rewards yet.</div>')+'<div class="section"><b>Badges ('+bds.length+')</b></div>'+(bds.length?bds.slice(0,100).map(function(x){return '<div class="card"><div class="row"><b>'+esc(x.title||x.name||'Badge')+'</b><span class="badge">'+esc(x.status||'draft')+'</span></div><div class="small muted">'+esc(x.description||'')+'</div></div>'}).join(''):'<div class="card">No badges yet.</div>'))};
if(!window.ssAdminV3Relationships)window.ssAdminV3Relationships=async function(){if(!ok())return;var r=await docs('relationships');page('Relationships','Review parent, teacher and learner links.','<div class="notice">Relationship records are read for administration and audit. Do not expose private learner data unnecessarily.</div>'+(r.length?r.slice(0,100).map(function(x){return '<div class="card"><div class="row"><b>'+esc(x.status||'active')+'</b><span class="badge">'+esc(x.type||'relationship')+'</span></div><div class="small muted">Learner: '+esc(x.studentUid||x.learnerUid||'—')+'<br>Parent: '+esc(x.parentUid||'—')+'<br>Teacher: '+esc(x.teacherUid||'—')+'</div></div>'}).join(''):'<div class="card">No relationships found.</div>'))};
if(!window.ssAdminV3Learners)window.ssAdminV3Learners=async function(){if(!ok())return;var u=await docs('users'),l=u.filter(function(x){return !x.role||x.role==='learner'});page('Learner Profiles','Administrative learner profile view.','<div class="notice">Read-only profile audit. Changes to learner identity should be handled through the dedicated Users & Roles workflow.</div>'+(l.length?l.slice(0,100).map(function(x){return '<div class="card"><div class="row"><b>'+esc(x.name||x.displayName||x.email||'Learner')+'</b><span class="badge">'+esc(x.role||'learner')+'</span></div><div class="small muted">Class: '+esc(x.studentClass||x.classNumber||'—')+' • Board: '+esc(x.board||'—')+'<br>Academic Year: '+esc(x.academicYear||'—')+'<br>School: '+esc(x.school||'—')+'<br>XP: '+esc(x.xp||0)+' • Coins: '+esc(x.coins||0)+' • Level: '+esc(x.level||1)+'</div></div>'}).join(''):'<div class="card">No learner profiles found.</div>'))};
if(!window.ssAdminV3Records)window.ssAdminV3Records=async function(){if(!ok())return;var a=await docs('quizAttempts');page('Learning Records','Administrative audit of quiz attempts and learning history.','<div class="card"><b>Total attempts: '+a.length+'</b><p class="small muted">Latest records are shown below. Detailed learner analytics remain available through Analytics.</p></div>'+(a.length?a.slice(0,100).map(function(x){return '<div class="card"><div class="row"><b>'+esc(x.quizTitle||x.quizId||'Quiz')+'</b><span class="badge">'+esc(x.percentage||0)+'%</span></div><div class="small muted">Learner: '+esc(x.uid||x.studentUid||'—')+' • Score: '+esc(x.score||0)+' / '+esc(x.total||0)+'</div></div>'}).join(''):'<div class="card">No quiz attempts yet.</div>'))};
})();
