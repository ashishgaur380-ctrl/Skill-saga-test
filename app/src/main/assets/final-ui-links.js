/* Skill Saga — final UI tap-target bridge */
(function(){
'use strict';
function goForViewAll(){
  var screen=String(window.screen||'').toLowerCase();
  if(screen==='home'&&typeof window.go==='function') return window.go('learn');
  if(screen==='compete'&&typeof window.go==='function') return window.go('compete');
  if(screen==='play'&&typeof window.toast==='function') return window.toast('More Play options are ready for the next content integration.');
  if(screen==='learn'&&typeof window.toast==='function') return window.toast('More learning content will open here.');
}
function install(){
  document.addEventListener('click',function(e){
    var target=e.target;
    var nav=target.closest('.nav button');
    if(nav)return;
    var span=target.closest('.ss-section span');
    if(span){
      var t=(span.textContent||'').trim().toLowerCase();
      if(t.indexOf('view all')>=0){goForViewAll();return;}
      if(t.indexOf('change class')>=0){if(typeof window.toast==='function')window.toast('Choose a class below.');return;}
      if(t.indexOf('choose')>=0||t.indexOf('select')>=0){if(typeof window.toast==='function')window.toast('Choose an option below to continue.');return;}
    }
    var tab=target.closest('.ss-tab');
    if(tab){
      var name=((tab.querySelector('b')||{}).textContent||'').trim();
      if(name==='Skills'&&typeof window.ssLearnSkills==='function'){window.ssLearnSkills();return;}
      if(name==='Academic'&&typeof window.go==='function'){window.go('learn');return;}
      if(name==='Other'&&typeof window.toast==='function'){window.toast('Other learning content will open here.');return;}
    }
    var subject=target.closest('.ss-subject,.ss-topic');
    if(subject&&typeof window.toast==='function'){window.toast('This topic is ready for the next Learn content integration.');return;}
    var comp=target.closest('.ss-comp');
    if(comp&&typeof window.go==='function'){window.go('compete');return;}
    var event=target.closest('.ss-event');
    if(event&&typeof window.toast==='function'){window.toast('Competition registration will be connected in the competition integration step.');return;}
    var board=target.closest('.ss-board-row');
    if(board&&typeof window.toast==='function'){window.toast('Leaderboard details will open here.');return;}
  },true);
  document.querySelectorAll('.ss-section span').forEach(function(span){
    span.style.cursor='pointer';
    span.style.pointerEvents='auto';
    span.style.userSelect='none';
    if(!span.getAttribute('role'))span.setAttribute('role','button');
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
