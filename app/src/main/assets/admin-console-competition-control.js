/* Skill Saga Admin Console — Competition Control v1
 * Central administration for competitions. Uses the existing competitions and quizzes collections.
 */
(function(){'use strict';
if(window.__SS_ADMIN_COMP_V1)return;window.__SS_ADMIN_COMP_V1=true;
function ok(){return ssAdminGuard()}function db(){return ssAdminDB()}function au(){return ssAdminAuth()}function esc(v){return ssAdminEsc(v)}function page(t,s,b){return ssAdminPage(t,s,b)}function btn(t,f,k){return ssAdminButton(t,f,k)}function stamp(){return ssAdminStamp()}function val(id){var e=document.getElementById(id);return e?e.value.trim():''}
var TYPES=['Skill Sprint','Weekly Challenge','Monthly Challenge','Academic Challenge','Practice Competition'];
var STATUS=['draft','scheduled','published','unpublished','archived'];
function select(id,label,options,value){return '<label>'+esc(label)+'</label><select id="'+id+'" class="input">'+options.map(function(x){return '<option value="'+esc(x)+'"'+(String(value||'')===String(x)?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select>'}
function field(id,label,value,type){return '<label>'+esc(label)+'</label><input id="'+id+'" class="input" type="'+(type||'text')+'" value="'+esc(value==null?'':value)+'" placeholder="'+esc(label)+'">'}
function area(id,label,value){return '<label>'+esc(label)+'</label><textarea id="'+id+'" class="area" rows="3" placeholder="'+esc(label)+'">'+esc(value||'')+'</textarea>'}
window.ssAdminCompetitionControl=async function(){
 if(!ok())return;
 var a=await db().collection('competitions').get().then(function(s){return s.docs.map(function(d){return Object.assign({id:d.id},d.data())})});
 var counts={draft:0,scheduled:0,published:0,unpublished:0,archived:0};a.forEach(function(x){if(counts[x.status]!=null)counts[x.status]++});
 var cards=a.slice(0,100).map(function(x){
   return '<div class="card"><div class="row"><div><b>'+esc(x.title||'Competition')+'</b><div class="small muted">'+esc(x.type||'')+' • '+esc(x.classLevel||'All classes')+' • '+esc(x.subject||'All subjects')+'</div></div><span class="badge">'+esc(x.status||'draft')+'</span></div><div class="small muted">'+esc(x.startAt||'')+' → '+esc(x.endAt||'')+' • '+esc(x.questionCount||0)+' questions</div><div class="row" style="margin-top:8px">'+btn('Edit','ssAdminCompetitionEdit("'+esc(x.id)+'")')+btn('Delete','ssAdminCompetitionDelete("'+esc(x.id)+'")','light')+'</div></div>';
 }).join('');
 page('Competition Control','Create, schedule, publish, unpublish and archive competitions.','<div class="notice"><b>Competition scope:</b> schedule, eligibility, quiz references, access and publication. Learner competition results remain records.</div><div class="grid"><div class="tile"><b>'+a.length+'</b><small>Total</small></div><div class="tile"><b>'+counts.draft+'</b><small>Draft</small></div><div class="tile"><b>'+counts.scheduled+'</b><small>Scheduled</small></div><div class="tile"><b>'+counts.published+'</b><small>Published</small></div></div><div class="card admin">'+btn('＋ Create Competition','ssAdminCompetitionEdit("")','gold')+'</div>'+ (cards||'<div class="card">No competitions yet.</div>'));
};
window.ssAdminCompetitionEdit=async function(id){
 if(!ok())return;
 var x={};if(id){var s=await db().collection('competitions').doc(id).get();if(s.exists)x=s.data()}
 page(id?'Edit Competition':'Create Competition','Configure the competition before publication.','<div class="card">'+field('ccTitle','Competition title',x.title)+select('ccType','Competition type',TYPES,x.type||TYPES[0])+field('ccCategory','Category',x.category)+field('ccClass','Class level',x.classLevel||'All')+field('ccSubject','Subject',x.subject||'All')+field('ccStart','Start date/time',x.startAt,'datetime-local')+field('ccEnd','End date/time',x.endAt,'datetime-local')+field('ccDuration','Duration (minutes)',x.durationMinutes||30,'number')+field('ccCount','Question count',x.questionCount||10,'number')+field('ccEntry','Entry coins',x.entryCoins||0,'number')+field('ccQuizIds','Existing quiz IDs (comma separated)',Array.isArray(x.quizIds)?x.quizIds.join(','):x.quizIds)+select('ccStatus','Status',STATUS,x.status||'draft')+area('ccDescription','Description',x.description)+btn('Save Competition','ssAdminCompetitionSave("'+esc(id||'')+'")','gold')+'</div>');
};
window.ssAdminCompetitionSave=async function(id){
 if(!ok())return;
 var title=val('ccTitle');if(!title)return toast('Enter a competition title.');
 var ids=val('ccQuizIds').split(',').map(function(x){return x.trim()}).filter(Boolean);
 try{
   if(ids.length){var q=await Promise.all(ids.map(function(qid){return db().collection('quizzes').doc(qid).get()}));var bad=ids.filter(function(qid,i){return !q[i].exists});if(bad.length)return toast('Unknown quiz ID(s): '+bad.join(', '))}
   var status=val('ccStatus');var d={title:title,type:val('ccType'),category:val('ccCategory'),classLevel:val('ccClass'),subject:val('ccSubject'),startAt:val('ccStart'),endAt:val('ccEnd'),durationMinutes:Number(val('ccDuration'))||0,questionCount:Number(val('ccCount'))||0,entryCoins:Number(val('ccEntry'))||0,quizIds:ids,description:val('ccDescription'),status:status,published:status==='published',updatedBy:au().uid,updatedAt:stamp()};
   if(id)await db().collection('competitions').doc(id).set(d,{merge:true});else{d.createdBy=au().uid;d.createdAt=stamp();await db().collection('competitions').add(d)}
   toast('Competition saved ✓');ssAdminCompetitionControl();
 }catch(e){toast(e.message||'Could not save competition')}
};
window.ssAdminCompetitionDelete=async function(id){if(!ok()||!id)return;if(!confirm('Delete this competition permanently?'))return;try{await db().collection('competitions').doc(id).delete();toast('Competition deleted ✓');ssAdminCompetitionControl()}catch(e){toast(e.message||'Could not delete competition')}};
})();
