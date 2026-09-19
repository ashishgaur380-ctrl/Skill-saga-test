/* Skill Saga — Common Data Contract
 * Single shared data contract for Learner App + Admin Console.
 * Passive by design: defining this layer does not replace or alter any existing UI.
 */
(function(){
  'use strict';
  if(window.SkillSagaCommon)return;
  var C={
    quizzes:'quizzes',
    curriculum:'curriculum',
    learningMaterials:'learningMaterials',
    questionBank:'questionBank',
    competitions:'competitions',
    assignments:'assignments',
    notifications:'notifications',
    users:'users',
    relationships:'relationships',
    quizAttempts:'quizAttempts',
    competitionResults:'competitionResults',
    leaderboards:'leaderboards',
    rewards:'rewards',
    badges:'badges',
    forumGroups:'forumGroups',
    forumPosts:'forumPosts',
    forumReports:'forumReports',
    appSettings:'appSettings'
  };
  function db(){try{return window.firebase&&firebase.firestore?firebase.firestore():null}catch(e){return null}}
  async function getDoc(collection,id){
    var d=db();if(!d)throw Error('Firebase is not ready.');
    var s=await d.collection(collection).doc(id).get();
    return s.exists?Object.assign({id:s.id},s.data()):null;
  }
  async function list(collection){
    var d=db();if(!d)throw Error('Firebase is not ready.');
    var s=await d.collection(collection).get();
    return s.docs.map(function(x){return Object.assign({id:x.id},x.data())});
  }
  async function settings(id){
    return (await getDoc(C.appSettings,id))||{};
  }
  function isPublished(x){
    return !!x && x.published===true && String(x.status||'published').toLowerCase()!=='draft' && String(x.status||'published').toLowerCase()!=='archived';
  }
  function placement(x,module,destination){
    if(!isPublished(x))return false;
    var p=x.placement||{};
    return String(x.primaryModule||p.module||'')===String(module||'') &&
      String(x.primaryDestination||p.destination||'')===String(destination||'');
  }
  try{var s=document.createElement('script');s.src='learner-content-routing.js?v=20260919-2';s.async=false;(document.head||document.documentElement).appendChild(s)}catch(e){console.warn('Learner content routing unavailable',e)}\n  window.SkillSagaCommon={
    version:'1.0.0',
    collections:C,
    db:db,
    getDoc:getDoc,
    list:list,
    settings:settings,
    isPublished:isPublished,
    placement:placement
  };
})();