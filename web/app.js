(function () {
  'use strict';
  var rows = [
    [['Esc','Escape','special'],['1','1'],['2','2'],['3','3'],['4','4'],['5','5'],['6','6'],['7','7'],['8','8'],['9','9'],['0','0'],['−','-'],['=','='],['⌫','Backspace','special wide']],
    [['Tab','Tab','special wide'],['Q','q'],['W','w'],['E','e'],['R','r'],['T','t'],['Y','y'],['U','u'],['I','i'],['O','o'],['P','p'],['[','['],[']',']'],['\\','\\']],
    [['Caps','CapsLock','special xwide'],['A','a'],['S','s'],['D','d'],['F','f'],['G','g'],['H','h'],['J','j'],['K','k'],['L','l'],[';', ';'],["'", "'"],['Enter','Enter','special xwide']],
    [['Shift','Shift','special xwide'],['Z','z'],['X','x'],['C','c'],['V','v'],['B','b'],['N','n'],['M','m'],[',',','],['.','.'],['/','/'],['Shift','Shift','special xwide']],
    [['Ctrl','Control','special'],['Win','Meta','special'],['Alt','Alt','special'],['',' ','space'],['Alt','Alt','special'],['←','ArrowLeft','special'],['↑','ArrowUp','special'],['↓','ArrowDown','special'],['→','ArrowRight','special']]
  ];
  var shifted = {'1':'!','2':'@','3':'#','4':'$','5':'%','6':'^','7':'&','8':'*','9':'(','0':')','-':'_','=':'+','[':'{',']':'}','\\':'|',';':':',"'":'"',',':'<','.':'>','/':'?'};
  var state = { shift:false, caps:false, ctrl:false, alt:false, meta:false };
  var params = new URLSearchParams(location.search);
  var credentials = params.get('device') && params.get('secret') ? {device:params.get('device'),secret:params.get('secret')} : null;
  var keyboard = document.getElementById('keyboard');
  var status = document.getElementById('status');
  var signal = document.getElementById('signal');
  if(credentials) {
    localStorage.setItem('remoteKeyboardPairing',JSON.stringify(credentials));
    history.replaceState(null,'',location.pathname);
  } else {
    try { credentials=JSON.parse(localStorage.getItem('remoteKeyboardPairing')); } catch (_) { credentials=null; }
  }
  if(!credentials||!credentials.device||!credentials.secret) document.getElementById('pairing').hidden=false;
  else { signal.className='signal online'; status.textContent='Paired with Windows'; }
  function send(type,value) {
    if(!credentials) return;
    fetch('/api/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({device:credentials.device,secret:credentials.secret,command:{type:type,value:value}})})
      .then(function(response){if(!response.ok)throw new Error();signal.className='signal online';status.textContent='Sent to Windows';})
      .catch(function(){signal.className='signal';status.textContent='Connection unavailable';});
  }
  function modifierName(value) { return value==='Control'?'ctrl':value==='Meta'?'meta':value.toLowerCase(); }
  function refresh() {
    var keys=keyboard.querySelectorAll('.key');
    for(var i=0;i<keys.length;i++) {
      var v=keys[i].getAttribute('data-value');
      var m=(v==='Shift'||v==='Control'||v==='Alt'||v==='Meta') ? modifierName(v) : '';
      keys[i].classList.toggle('active', (m && state[m]) || (v==='CapsLock'&&state.caps));
      if(v && v.length===1 && /[a-z]/.test(v)) keys[i].textContent=(state.shift!==state.caps)?v.toUpperCase():v;
    }
  }
  function hit(value) {
    if(value==='CapsLock') { state.caps=!state.caps; refresh(); return; }
    if(value==='Shift'||value==='Control'||value==='Alt'||value==='Meta') { var m=modifierName(value); state[m]=!state[m]; refresh(); return; }
    var modifiers=[];
    if(state.ctrl) modifiers.push('Control'); if(state.alt) modifiers.push('Alt'); if(state.meta) modifiers.push('Meta');
    if(modifiers.length) { modifiers.push(value.length===1?value.toUpperCase():value); send('shortcut',modifiers); state.ctrl=state.alt=state.meta=false; state.shift=false; refresh(); return; }
    if(value.length===1) {
      var out=value;
      if(/[a-z]/.test(value)) out=(state.shift!==state.caps)?value.toUpperCase():value;
      else if(state.shift && shifted[value]) out=shifted[value];
      send('text',out);
    } else send('key',value);
    if(state.shift) { state.shift=false; refresh(); }
  }
  rows.forEach(function(row) {
    var el=document.createElement('div'); el.className='row';
    row.forEach(function(k) {
      var b=document.createElement('button'); b.type='button'; b.className='key '+(k[2]||''); b.textContent=k[0]; b.setAttribute('data-value',k[1]); b.setAttribute('aria-label',k[0]||'Space');
      b.addEventListener('touchstart',function(e){e.preventDefault();b.classList.add('pressed');hit(k[1]);},{passive:false});
      b.addEventListener('touchend',function(){b.classList.remove('pressed');});
      b.addEventListener('mousedown',function(e){e.preventDefault();hit(k[1]);});
      el.appendChild(b);
    }); keyboard.appendChild(el);
  });
  document.getElementById('fullscreen').addEventListener('click',function(){
    var root=document.documentElement; var fn=root.requestFullscreen||root.webkitRequestFullscreen; if(fn) fn.call(root);
  });
  document.addEventListener('contextmenu',function(e){e.preventDefault();});
  refresh();
}());
