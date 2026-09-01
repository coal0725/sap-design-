/* 분리 배포 모드: 역할/로그인 상태를 세션에 유지 */
var ROLE=(function(){try{return sessionStorage.getItem('ssr.role')||'MN';}catch(e){return 'MN';}})();
var AUTHED=(function(){try{return sessionStorage.getItem('ssr.authed')!=='0';}catch(e){return true;}})();
function saveSession(){try{sessionStorage.setItem('ssr.role',ROLE);sessionStorage.setItem('ssr.authed',AUTHED?'1':'0');}catch(e){}}
function showLogin(){
  document.getElementById('loginview').classList.remove('hidden');
  document.getElementById('loginErr').classList.add('hidden');
}
function hideLogin(){ document.getElementById('loginview').classList.add('hidden'); }
function applyRole(){
  var pub = (ROLE==='G');
  var lb=document.getElementById('logoutBtn'); if(lb) lb.classList.toggle('hidden', pub);
  if(pub){ hideLogin(); }
  else if(!AUTHED){ showLogin(); }
  document.getElementById('side').classList.toggle('hidden', pub);
  document.getElementById('pubbar').classList.toggle('hidden', !pub);
  document.getElementById('roleLabel').textContent = document.querySelector('#role option[value="'+ROLE+'"]').textContent;
  var vis=0, scr=0;
  document.querySelectorAll('.nav-group').forEach(function(g){
    var on = g.dataset.roles.split(' ').indexOf(ROLE)>=0;
    var n=0;
    g.querySelectorAll('.nav-item').forEach(function(a){
      var io = !a.dataset.roles || a.dataset.roles.split(' ').indexOf(ROLE)>=0;
      a.classList.toggle('hidden', !io); if(io) n++;
    });
    on = on && n>0;
    g.classList.toggle('hidden', !on);
    if(on){ vis++; scr += n; }
  });
  document.querySelectorAll('.kidbtn').forEach(function(b){
    var io = !b.dataset.roles || b.dataset.roles.split(' ').indexOf(ROLE)>=0;
    b.classList.toggle('hidden', !io);
  });
  repPerm();
  var rc=document.getElementById('roleCnt');
  if(rc) rc.textContent = pub ? '로그인 없이 접근' : ('접근 가능 메뉴 '+vis+' · 화면 '+scr);
  var cur=document.querySelector('.scr:not(.hidden)');
  if(!cur || cur.dataset.roles.split(' ').indexOf(ROLE)<0){
    var first=document.querySelector('.nav-group:not(.hidden) .nav-item');
    show(pub ? 'AP-welcome' : (first?first.dataset.scr:'MY-mp'));
  }
}
function syncSurvey(){
  var picked=[];
  try{var sv=sessionStorage.getItem('ssr.std'); if(sv&&!document.querySelector('#s-AP-bAppl [data-pick]')) picked=JSON.parse(sv);}catch(e){}
  document.querySelectorAll('#s-AP-bAppl [data-pick]').forEach(function(c){
    if(c.checked) picked.push(c.dataset.pick);
  });
  if(!picked.length) picked=['QMS'];
  try{sessionStorage.setItem('ssr.std',JSON.stringify(picked));}catch(e){}
  var NAME={QMS:'ISO 9001',EMS:'ISO 14001',OHSMS:'ISO 45001',ISMS:'ISO 27001',ABMS:'ISO 37001'};
  document.getElementById('qpicked').textContent = picked.map(function(p){return NAME[p];}).join(' · ');
  document.querySelectorAll('#s-AP-bQ .qsec').forEach(function(s){
    var need=s.dataset.std;
    var on = !need || picked.indexOf(need)>=0;
    s.classList.toggle('hidden', !on);
    s.querySelectorAll('[data-req]').forEach(function(f){ f.dataset.skip = on?'':'1'; });
  });
  return picked;
}
function show(k){
  var t=document.getElementById('s-'+k);
  if(!t){ saveSession(); if(ROUTES[k]) location.href=ROUTES[k]; return; }
  if(k==='AP-bQ'){ syncSurvey(); }
  var qn=document.getElementById('qnotice');
  if(qn) qn.classList.toggle('hidden', k!=='AP-bQ');
  document.querySelectorAll('.scr').forEach(function(e){e.classList.add('hidden');});
  t.classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(function(a){
    var on=a.dataset.scr===k;
    a.classList.toggle('bg-white/10',on); a.classList.toggle('text-white',on);
    a.classList.toggle('font-bold',on); a.classList.toggle('text-on-primary/60',!on);
    if(on){ var g=a.closest('.nav-group'); g.querySelector('.sub').classList.remove('hidden');
             g.querySelector('.arw').textContent='expand_less'; }
  });
  document.querySelectorAll('.pstep').forEach(function(b){
    var on=b.dataset.scr===k;
    b.classList.toggle('bg-primary',on); b.classList.toggle('text-white',on);
    b.classList.toggle('border-primary',on); b.classList.toggle('text-outline',!on);
    b.classList.toggle('bg-white',!on);
  });
  window.scrollTo(0,0);
}
document.getElementById('role').addEventListener('change',function(e){
  ROLE=e.target.value; saveSession();
  if(ROLE!=='G'){ AUTHED=true; var lr=document.getElementById('loginRole'); if(lr) lr.value=ROLE; }
  saveSession();
  applyRole();
});
document.getElementById('loginBtn').addEventListener('click',function(){
  var id=document.getElementById('loginId').value.trim();
  var pw=document.getElementById('loginPw').value.trim();
  if(!id||!pw){ document.getElementById('loginErr').classList.remove('hidden'); return; }
  document.getElementById('loginErr').classList.add('hidden');
  ROLE=document.getElementById('loginRole').value;
  document.getElementById('role').value=ROLE;
  busy('로그인 중입니다…',800,function(){
    AUTHED=true; saveSession(); hideLogin(); applyRole();
    toast(document.querySelector('#role option[value="'+ROLE+'"]').textContent+'(으)로 로그인되었습니다');
  });
});
document.getElementById('loginPw').addEventListener('keydown',function(e){ if(e.key==='Enter') document.getElementById('loginBtn').click(); });
document.getElementById('toGuest').addEventListener('click',function(){
  ROLE='G'; AUTHED=false; saveSession(); document.getElementById('role').value='G'; applyRole(); show('AP-welcome');
});
document.getElementById('logoutBtn').addEventListener('click',function(){
  busy('로그아웃 중입니다…',600,function(){
    AUTHED=false;
    document.getElementById('loginId').value=''; document.getElementById('loginPw').value='';
    showLogin(); toast('로그아웃되었습니다');
  });
});
document.querySelectorAll('.grp').forEach(function(b){b.addEventListener('click',function(){
  var s=b.nextElementSibling,a=b.querySelector('.arw');
  s.classList.toggle('hidden'); a.textContent=s.classList.contains('hidden')?'expand_more':'expand_less';
});});
document.querySelectorAll('.nav-item,.pstep').forEach(function(a){
  a.addEventListener('click',function(e){e.preventDefault();show(a.dataset.scr);});
});
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.remove('hidden');
  clearTimeout(window.__t);window.__t=setTimeout(function(){t.classList.add('hidden');},1800);}
function busy(msg,ms,cb){
  var l=document.getElementById('loading');
  document.getElementById('loadingMsg').textContent=msg||'처리 중입니다…';
  l.classList.remove('hidden'); l.classList.add('flex');
  setTimeout(function(){ l.classList.add('hidden'); l.classList.remove('flex'); if(cb) cb(); }, ms||700);
}
function validate(scope){
  var bad=[];
  scope.querySelectorAll('[data-req]').forEach(function(f){
    if(f.dataset.skip==='1' || f.closest('.hidden')) return;
    f.classList.remove('!border-error','ring-2','ring-error/20');
    var empty = (f.type==='checkbox') ? !f.checked : !String(f.value||'').trim();
    if(empty){ bad.push(f); f.classList.add('!border-error','ring-2','ring-error/20'); }
  });
  if(bad.length){ bad[0].scrollIntoView({behavior:'smooth',block:'center'}); bad[0].focus({preventScroll:true}); }
  return bad;
}
document.querySelectorAll('[data-go]').forEach(function(b){
  b.addEventListener('click',function(ev){ ev.stopPropagation();
    var a=b.dataset.act||'';
    var needsCheck = a && (a.indexOf('저장')>-1||a.indexOf('제출')>-1||a.indexOf('다음')>-1||a.indexOf('승인')>-1||a.indexOf('발송')>-1||a.indexOf('확정')>-1);
    if(needsCheck && a.indexOf('임시')<0){
      var scope=b.closest('.scr');
      var bad=validate(scope);
      if(bad.length){ toast('필수 항목 '+bad.length+'개를 입력해주세요'); return; }
    }
    var msg = a.indexOf('발송')>-1 ? '발송 중입니다…' : (a.indexOf('저장')>-1||a.indexOf('제출')>-1 ? '저장 중입니다…' : '불러오는 중입니다…');
    busy(msg, a?800:350, function(){
      if(a){
        if(a.indexOf('임시')>-1) toast('임시저장되었습니다');
        else if(a.indexOf('저장')>-1||a.indexOf('제출')>-1||a.indexOf('확정')>-1) toast('저장되었습니다');
        else if(a.indexOf('발송')>-1) toast('발송되었습니다');
        else if(a.indexOf('승인')>-1||a.indexOf('반려')>-1) toast(a+' 처리되었습니다');
      }
      show(b.dataset.go);
    });
  });
});
document.querySelectorAll('[data-act]:not([data-go])').forEach(function(b){
  if(b.closest('.reppane')) return;
  b.addEventListener('click',function(){
    var a=b.dataset.act;
    if(a.indexOf('임시')>-1){ busy('임시저장 중입니다…',600,function(){toast('임시저장되었습니다');}); return; }
    if(a.indexOf('저장')>-1||a.indexOf('확정')>-1||a.indexOf('승인')>-1||a.indexOf('발송')>-1){
      var bad=validate(b.closest('.scr'));
      if(bad.length){ toast('필수 항목 '+bad.length+'개를 입력해주세요'); return; }
      busy('저장 중입니다…',800,function(){toast('저장되었습니다');}); return;
    }
    if(a.indexOf('다음')>-1) toast('다음 단계로 이동합니다');
    else if(a.indexOf('이전')>-1) toast('이전 단계로 이동합니다');
    else if(a.indexOf('다운로드')>-1) busy('파일을 생성하는 중입니다…',900,function(){toast('다운로드가 시작됩니다');});
    else toast(a+' 처리되었습니다');
  });
});
document.querySelectorAll('tbody tr').forEach(function(r){
  r.addEventListener('click',function(){ var b=r.querySelector('[data-go]'); if(b) b.click(); });
});
document.querySelectorAll('.scr button').forEach(function(b){
  if(b.textContent.trim()==='검색'){ b.addEventListener('click',function(){busy('조회 중입니다…',600,function(){toast('조회되었습니다');});}); }
  if(b.textContent.indexOf('엑셀')>-1){ b.addEventListener('click',function(){busy('엑셀 파일을 생성하는 중입니다…',900,function(){toast('다운로드가 시작됩니다');});}); }
});
document.getElementById('role').addEventListener('change',function(){ busy('화면을 불러오는 중입니다…',450); });
document.querySelectorAll('#s-AP-bAppl [data-pick]').forEach(function(c){
  if(['QMS','EMS','OHSMS'].indexOf(c.dataset.pick)>=0) c.checked=true;
  c.addEventListener('change',function(){ var p=syncSurvey(); toast('설문 항목이 '+p.length+'개 표준 기준으로 조정되었습니다'); });
});

var DOCS={"terms": {"t": "이용약관", "b": [["제1조 (목적)", "본 약관은 삼성표준인증원(이하 ‘인증원’)이 운영하는 SAP 심사원 플랫폼(이하 ‘플랫폼’)의 이용 조건 및 절차, 인증원과 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다."], ["제2조 (용어의 정의)", "① 플랫폼이란 인증원이 인증심사 신청·심사일정·심사보고서·인증서 발급 등 인증 업무를 처리하기 위하여 제공하는 온라인 시스템을 말합니다.\n② 이용자란 플랫폼에 접속하여 본 약관에 따라 서비스를 이용하는 신청기업, 심사원, 관리자를 말합니다.\n③ 비회원이란 별도의 계정 없이 인증심사 신청 기능만을 이용하는 신청기업을 말합니다."], ["제3조 (약관의 효력 및 변경)", "① 본 약관은 플랫폼에 게시함으로써 효력이 발생합니다.\n② 인증원은 필요한 경우 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자 및 사유를 명시하여 적용일 7일 전부터 공지합니다."], ["제4조 (서비스의 제공)", "① 인증심사 신청 접수 및 진행 상황 조회\n② 심사일정 확인 및 심사보고서 작성·제출\n③ 자격·코드 신청 및 처리내역 조회\n④ 인증서 발급·재발급 및 인증현황 조회\n⑤ 공지사항 및 절차·서식 열람"], ["제5조 (서비스의 중단)", "인증원은 시스템 점검·교체·고장, 통신 두절 등 부득이한 사유가 발생한 경우 서비스 제공을 일시적으로 중단할 수 있으며, 사전 공지를 원칙으로 합니다."], ["제6조 (이용자의 의무)", "① 이용자는 계정 정보를 제3자에게 양도·대여할 수 없습니다.\n② 이용자는 플랫폼에 등록하는 정보가 사실과 다르지 않도록 관리하여야 하며, 변경 사항이 있는 경우 15일 이내에 인증원에 통보하여야 합니다.\n③ 이용자는 타인의 정보를 도용하거나 플랫폼의 운영을 방해하는 행위를 하여서는 안 됩니다."], ["제7조 (인증마크의 사용)", "인증받은 조직은 인증원의 「인증표시 사용절차」에 따라 인증마크 및 인증 사실을 홍보할 수 있으며, 오용 시 인증원은 시정조치 요구·인증 정지·취소 및 법적 조치를 취할 수 있습니다."], ["제8조 (이의제기 및 불만)", "이용자는 인증원의 인증 절차에 대해 이의제기 및 불만을 제기할 수 있으며, 인증원은 「이의제기 및 불만처리 절차」에 따라 처리하고 접수 사실·경과·결과를 제기자에게 통지합니다. 인증원은 제기자에게 어떠한 차별적 조치도 취하지 않습니다."], ["제9조 (책임의 제한)", "인증원은 천재지변, 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다."], ["제10조 (준거법 및 관할)", "본 약관은 대한민국 법에 의하며, 서비스 이용과 관련한 분쟁의 관할 법원은 인증원 소재지의 관할 법원으로 합니다."], ["부칙", "본 약관은 2026년 7월 1일부터 시행합니다."]]}, "privacy": {"t": "개인정보처리방침", "b": [["1. 개인정보의 처리 목적", "삼성표준인증원은 다음의 목적을 위하여 개인정보를 처리합니다.\n① 인증심사 신청 접수 및 심사 진행\n② 심사원 자격·코드 관리 및 심사 배정\n③ 계약검토·비용청구·세금계산서 발행\n④ 인증서 발급 및 인증현황 관리\n⑤ 민원 처리 및 고객 만족도 조사"], ["2. 수집하는 개인정보 항목", "① 신청기업: 기업명, 사업자등록번호, 대표자명, 주소, 담당자 성명·직위·연락처·이메일\n② 심사원: 성명, 생년월일, 연락처, 이메일, 주소, 소속기관, 자격정보, 심사실적\n③ 자동수집: 접속 IP, 접속 일시, 서비스 이용 기록"], ["3. 개인정보의 보유 및 이용기간", "① 인증 관련 기록: 인증 종료 후 3년 (ISO/IEC 17021-1 요구사항)\n② 심사원 자격 기록: 자격 만료 후 5년\n③ 계약·정산 기록: 5년 (전자상거래법)\n④ 접속 기록: 3개월 (통신비밀보호법)"], ["4. 개인정보의 제3자 제공", "인증원은 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만 다음의 경우는 예외로 합니다.\n① 인정기관(KAB)의 인정심사 및 인정 등록을 위하여 요구되는 경우\n② 법령에 근거하거나 수사기관이 적법한 절차에 따라 요구하는 경우"], ["5. 개인정보 처리의 위탁", "인증원은 서비스 운영을 위하여 필요한 경우 개인정보 처리업무를 위탁할 수 있으며, 위탁 시 수탁자·위탁업무 내용을 본 방침에 공개합니다."], ["6. 정보주체의 권리", "정보주체는 개인정보 열람·정정·삭제·처리정지를 언제든지 요구할 수 있으며, 인증원은 지체 없이 조치합니다. 요구는 마이페이지 또는 개인정보보호책임자에게 서면·전화·이메일로 하실 수 있습니다."], ["7. 개인정보의 파기", "보유기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 파기합니다. 전자적 파일은 복구 불가능한 방법으로 삭제하고, 출력물은 분쇄하거나 소각합니다."], ["8. 개인정보의 안전성 확보 조치", "① 접근권한 관리 및 접근통제 시스템 운영\n② 개인정보의 암호화 저장·전송\n③ 접속기록의 보관 및 위·변조 방지\n④ 개인정보 취급 담당자 최소화 및 정기 교육"], ["9. 개인정보보호책임자", "성명: 구현숙 (책임)\n소속: 인증사업팀\n연락처: 02-000-0000 / privacy@ssr.or.kr\n\n정보주체는 개인정보 침해에 대한 신고·상담을 개인정보분쟁조정위원회(1833-6972), 개인정보침해신고센터(118), 대검찰청(1301), 경찰청(182)에 문의하실 수 있습니다."], ["10. 개인정보처리방침의 변경", "본 방침은 2026년 7월 1일부터 적용됩니다. 변경 시 시행 7일 전부터 공지사항을 통해 고지합니다."]]}, "email": {"t": "이메일무단수집거부", "b": [["이메일 무단수집 거부", "본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며, 이를 위반 시 정보통신망 이용촉진 및 정보보호 등에 관한 법률에 의해 형사처벌됨을 유념하시기 바랍니다."], ["관련 법령", "정보통신망 이용촉진 및 정보보호 등에 관한 법률 제50조의2 (전자우편주소의 무단 수집행위 등 금지)\n\n① 누구든지 전자우편주소의 수집을 거부하는 의사가 명시된 인터넷 홈페이지에서 자동으로 전자우편주소를 수집하는 프로그램이나 그 밖의 기술적 장치를 이용하여 전자우편주소를 수집하여서는 아니 된다."]]}, "mark": {"t": "인증마크 사용지침", "b": [["1. 인증마크의 소유권", "인증마크에 대한 소유권은 삼성표준인증원(SSR)에 있습니다."], ["2. 사용 개시", "인증받은 조직은 인증서가 발급된 날로부터 인증마크 및 인증 사실을 홍보할 수 있습니다."], ["3. 사용 시 준수사항", "① 인증마크는 인증받은 범위 내에서만 사용합니다.\n② 제품 자체 또는 제품 포장에 제품인증으로 오인될 수 있는 방식으로 사용할 수 없습니다.\n③ 시험성적서·검사보고서에 사용할 수 없습니다.\n④ 인증마크의 비율·색상을 임의로 변경할 수 없습니다."], ["4. 오용 시 조치", "SSR은 인증마크가 본 지침과 부합되지 않는 방식으로 오용되는 경우 시정 및 시정조치 요구, 인증 정지·취소, 위반사실 공표, 필요한 경우 법적 조치를 취할 수 있습니다."], ["5. 사용권 종료", "인증이 취소된 경우 인증마크 사용 및 인증서 유지에 관한 효력이 종료되며, 조직은 인증서를 SSR에 반납하여야 합니다."]]}, "appeal": {"t": "이의제기·불만 접수", "b": [["접수 방법", "① 온라인: 플랫폼 로그인 후 [불만·이의제기] 메뉴\n② 이메일: appeal@ssr.or.kr\n③ 전화: 02-000-0000 (인증사업팀)\n④ 우편: (08513) 서울특별시 금천구 벚꽃로 244, 10층"], ["처리 절차", "접수 → 접수 사실 통지(3일 이내) → 조사 및 검토 → 처리 결과 통지(30일 이내) → 종결\n\n처리 기간이 연장되는 경우 사유와 예상 기한을 통지합니다."], ["공정성 보장", "① 인증원은 이의제기자 및 불만제기자에 대하여 어떠한 차별적 조치도 취하지 않습니다.\n② 이의제기 대상 업무를 수행한 자는 해당 건의 조사·결정에 참여하지 않습니다.\n③ 이의제기 프로세스는 부적합 처리 또는 인증 취소 프로세스의 진행 시점에 영향을 미치지 않습니다."]]}};
function openDoc(k){
  var d=DOCS[k]; if(!d) return;
  document.getElementById('docTitle').textContent=d.t;
  document.getElementById('docBody').innerHTML = d.b.map(function(s){
    return '<h3 class="text-[14px] font-bold text-primary mt-5 mb-2 first:mt-0">'+s[0]+'</h3>'
         + '<p class="whitespace-pre-line">'+s[1]+'</p>';
  }).join('');
  var m=document.getElementById('docdim'); m.classList.remove('hidden'); m.classList.add('flex');
}
function closeDoc(){ var m=document.getElementById('docdim'); m.classList.add('hidden'); m.classList.remove('flex'); }
document.getElementById('docdim').addEventListener('click',function(ev){ if(ev.target===this) closeDoc(); });
document.addEventListener('keydown',function(ev){ if(ev.key==='Escape') closeDoc(); });

var KSIC={"03A": ["1011", "1012", "1021", "1022", "1030", "1041", "1042", "1051", "1052", "1060", "1070", "1081", "1082", "1083", "1089", "1090", "1111", "1112", "1120", "1200"], "03B": ["1200"], "04A": ["1310", "1321", "1322", "1330"], "04B": ["1340", "1391", "1392", "1399"], "04C": ["1411", "1412", "1413", "1419", "1420", "1430", "1441", "1449"], "05A": ["1511"], "05B": ["1512", "1519"], "05C": ["1521", "1522"], "06A": ["1610", "1621"], "06B": ["1622", "1623", "1629", "1630"], "07A": ["1710", "1721", "1722", "1790"], "07B": [], "09A": ["1811", "1812", "1820"], "10A": ["1910", "1921", "1922"], "12A": [], "12B": ["2020", "2031", "2032", "2041", "2042", "2049", "2050"], "13A": ["2110", "2121", "2122", "2123"], "13B": ["2130"], "14A": ["2211", "2219"], "14B": ["2221", "2222", "2223", "2224", "2225", "2229"], "15A": ["2311", "2312", "2319", "2321", "2322", "2323", "2391", "2399"], "16A": ["2331", "2332"], "17A": ["2411", "2412", "2413", "2419", "2429", "2431", "2432"], "17B": ["2511", "2512", "2513", "2591", "2592", "2593", "2594", "2599"], "18A": ["2520", "2911", "2912", "2913", "2914", "2915", "2916", "2917", "2918", "2919", "2921", "2922", "2923", "2924", "2925", "2926"], "18B": ["3031", "3032", "3033", "3039", "3040", "3191"], "19A": ["2631", "2632", "2811", "2812", "2820", "2830", "2841", "2842", "2851", "2852", "2890"], "19B": ["2611", "2612", "2621", "2622", "2629", "2641", "2642", "2651", "2652", "2660"], "19C": ["2711"], "19D": ["2719", "2721", "2722", "2730"], "19E": ["3402", "9511", "9512"], "20A": [], "21A": [], "22A": ["3011", "3012", "3020"], "22B": ["3120"], "22C": ["3192", "3199"], "23A": ["3201", "3202", "3209"], "23B": ["3320"], "23C": ["3330"], "23D": ["3311", "3312", "3340", "3391", "3392", "3393", "3399"], "24A": ["3831", "3832"], "25A": ["3511", "3512", "3513"], "26A": ["3520"], "27A": ["3530"], "27B": ["3601", "3602"], "28A": ["4111", "4112"], "28B": ["4121", "4122", "4211", "4212"], "28C": ["4213", "4219", "4231", "4232", "4241", "4242", "4249"], "28D": ["4220"], "28E": ["4250", "4260"], "29A": ["4511", "4512", "4521", "4522", "4530", "4610", "4620", "4631", "4632", "4633", "4641", "4642", "4643", "4644", "4645", "4646", "4649", "4651", "4652", "4653", "4659", "4661", "4662", "4669", "4671", "4672", "4673", "4674", "4675", "4679", "4680", "4711", "4712", "4713", "4719", "4721", "4722", "4723", "4731", "4732", "4741", "4742", "4743", "4744", "4751", "4752", "4759", "4761", "4762", "4763", "4764", "4771", "4772", "4781", "4782", "4783", "4784", "4785", "4786", "4791", "4792", "4799"], "29B": ["9521", "9522", "9531", "9539"], "30A": ["5510", "5590"], "30B": ["5611", "5612", "5613", "5614", "5619", "5621", "5622"], "31A": ["4910", "4921", "4922", "4923", "4930", "4940", "4950", "5011", "5012", "5013", "5020", "5110", "5120"], "31B": ["5210", "5291", "5292", "5293", "5294", "5299"], "31C": ["6110", "6121", "6122", "6129"], "32A": ["6411", "6412", "6413", "6420", "6491", "6499", "6511", "6512", "6520", "6530", "6611", "6612"], "32B": ["6811", "6812", "6821", "6822"], "32C": ["7611", "7619", "7621", "7622", "7629", "7631", "7632", "7639", "7640"], "33A": ["6202", "6209"], "33B": ["5821", "5822", "6031", "6032", "6201", "6311", "6312", "6399"], "34A": ["7011", "7012", "7013", "7160", "7211", "7212", "7291", "7292"], "34B": ["7020"], "35A": ["7110", "7120", "7140", "7151", "7153"], "35C": ["7410", "7421", "7422", "7430", "7511", "7512", "7531", "7532", "7533", "7591", "7599"], "36A": ["8411", "8412", "8421", "8422", "8431", "8432", "8440", "8450", "8461", "8462"], "37A": ["8511", "8512", "8521", "8522", "8530", "8541", "8542", "8543", "8550", "8561", "8562", "8563", "8564", "8565", "8566", "8569", "8570"], "38A": ["8610", "8620", "8630", "8690"], "38B": ["7310"], "38C": ["8711", "8712", "8713", "8721", "8729"], "39A": ["3900", "5911", "5912", "5913", "5914", "6010", "6021", "6022", "6391", "7521", "7529", "9011", "9012", "9013", "9019", "9021", "9022", "9023", "9029", "9111", "9112", "9113", "9119", "9121", "9122", "9123", "9124", "9129", "9611", "9612"], "39B": ["3701", "3702", "3811", "3812", "3813", "3821", "3822", "3823", "3824"], "39C": ["9411", "9412", "9420", "9491", "9492", "9493", "9499", "9699"]};
var KSSC="https://kssc.mods.go.kr:8443/ksscNew_web/kssc/common/ClassificationContent.do?gubun=1&strCategoryNameCode=001";
document.getElementById('role').value=ROLE;

/* ── 보고서 문서 트리 : 권한별 작성/열람 ───────────────────── */
function repCan(el){ return (el.dataset.edit||'').split(' ').indexOf(ROLE)>=0; }
function repPerm(){
  document.querySelectorAll('.reppane').forEach(function(p){
    var can = repCan(p);
    p.querySelectorAll('input,select,textarea').forEach(function(f){
      f.disabled = !can;
      f.dataset.skip = can ? '' : '1';
      f.style.backgroundColor = can ? '' : '#EEF1F6';
      f.style.color = can ? '' : '#5C6470';
      f.style.cursor = can ? '' : 'not-allowed';
    });
    p.querySelectorAll('.repfoot button').forEach(function(b){ b.disabled=!can; });
    p.querySelectorAll('.mcell').forEach(function(b){ b.disabled=!can; b.style.cursor = can?'':'not-allowed'; });
    p.querySelectorAll('.rtadd,.rtdel,.mxadd,.mxdel').forEach(function(b){ b.disabled=!can; b.classList.toggle('hidden', !can); });
    var fo=p.querySelector('.repfoot'); if(fo) fo.classList.toggle('hidden', !can);
    var ro=p.querySelector('.repro'); if(ro) ro.classList.toggle('hidden', can);
    var st=p.querySelector('.repstate');
    if(st){
      st.textContent = can ? '작성 가능' : '열람 전용';
      st.className = 'repstate text-[11px] font-bold px-2 py-0.5 rounded-full border '
        + (can ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-surface-container-high text-outline border-outline-variant');
    }
  });
  document.querySelectorAll('.repnav').forEach(function(b){
    var can = repCan(b);
    var bd=b.querySelector('.repbdg');
    bd.textContent = can ? '작성' : '열람';
    bd.className = 'repbdg shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] border '
      + (can ? 'bg-primary/10 text-primary border-primary/30' : 'bg-transparent text-outline border-outline-variant');
    b.querySelector('.repname').classList.toggle('font-bold', can);
  });
}
function repShow(key){
  document.querySelectorAll('.reppane').forEach(function(p){ p.classList.toggle('hidden', p.id!=='rp-'+key); });
  document.querySelectorAll('.repnav').forEach(function(b){
    var on = b.dataset.doc===key;
    b.classList.toggle('bg-primary/5', on);
    b.classList.toggle('border-l-primary', on);
    b.classList.toggle('border-transparent', !on);
  });
  repPerm();
}
document.querySelectorAll('.repnav').forEach(function(b){
  b.addEventListener('click',function(){ repShow(b.dataset.doc); });
});
/* 요구사항 매트릭스 : 셀 순환 판정 + 집계 */
var MARKS=[['','－','text-outline'],['O','○','text-emerald-600 font-bold'],['V','✔','text-blue-600 font-bold'],
           ['T','△','text-amber-600 font-bold'],['X','✘','text-error font-bold'],['N','N/A','text-outline/70 text-[10px]']];
function mxCount(){
  var c={O:0,V:0,T:0,X:0};
  document.querySelectorAll('.mcell').forEach(function(b){ if(c[b.dataset.v]!==undefined) c[b.dataset.v]++; });
  document.querySelectorAll('.mxc').forEach(function(e){ e.textContent = c[e.dataset.k]||0; });
}
document.querySelectorAll('.mcell').forEach(mxBindCell);
mxCount();


/* ── 동적 행 추가 테이블 ─────────────────────────────────────── */
function rtSync(box){
  var rows=box.querySelectorAll('tbody tr.rtrow');
  rows.forEach(function(r,i){ var n=r.querySelector('.rtno'); if(n) n.textContent=i+1; });
  var c=box.querySelector('.rtcnt'); if(c) c.textContent=rows.length;
}
function rtBind(row){
  var d=row.querySelector('.rtdel');
  if(d) d.addEventListener('click',function(){
    var box=row.closest('.rt');
    if(box.querySelectorAll('tbody tr.rtrow').length<=1){ toast('최소 1개 행은 유지해야 합니다'); return; }
    row.remove(); rtSync(box); toast('행이 삭제되었습니다');
  });
  row.querySelectorAll('select').forEach(function(sl){
    sl.addEventListener('change',function(){ rtKsic(row); });
  });
  rtKsic(row);
}
function rtKsic(row){
  var box=row.querySelector('.rtksic'); if(!box) return;
  var code='';
  row.querySelectorAll('select').forEach(function(sl){
    var v=(sl.value||'').split(' ')[0];
    if(KSIC[v]) code=v;
  });
  var list=KSIC[code]||[];
  box.innerHTML = list.length
    ? list.slice(0,14).map(function(k){
        return '<a href="'+KSSC+'" target="_blank" rel="noopener" title="KSIC '+k+' 조회" '
          + 'class="font-label-md text-[11px] px-1.5 py-0.5 border border-outline-variant rounded-[2px] '
          + 'text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors">'+k+'</a>';
      }).join('') + (list.length>14 ? '<span class="text-[11px] text-outline">외 '+(list.length-14)+'개</span>' : '')
    : '<span class="text-[11px] text-outline">코드를 선택하세요</span>';
}
document.querySelectorAll('.rt').forEach(function(box){
  box.querySelectorAll('tbody tr.rtrow').forEach(rtBind);
  var add=box.querySelector('.rtadd');
  if(add) add.addEventListener('click',function(){
    if(add.disabled) return;
    var tpl=box.querySelector('tr.rttpl');
    var r=tpl.cloneNode(true);
    r.className='rtrow border-t border-surface-container';
    tpl.parentNode.insertBefore(r,tpl);
    rtBind(r); rtSync(box);
    var f=r.querySelector('input:not([type=checkbox]),select,textarea'); if(f) f.focus();
    r.classList.add('bg-secondary/5');
    setTimeout(function(){ r.classList.remove('bg-secondary/5'); },700);
    toast('행이 추가되었습니다');
  });
  rtSync(box);
});

/* ── 매트릭스 : 심사부서/프로세스 열 추가·삭제 ─────────────── */
function mxBindCell(b){
  b.addEventListener('click',function(){
    if(b.disabled) return;
    var i=0; MARKS.forEach(function(m,ix){ if(m[0]===b.dataset.v) i=ix; });
    var n=MARKS[(i+1)%MARKS.length];
    b.dataset.v=n[0]; b.textContent=n[1];
    b.className='mcell w-full h-9 text-[13px] hover:bg-primary/5 transition-colors '+n[2];
    mxCount();
  });
}
function mxCols(tb){ return tb.querySelectorAll('thead tr')[1].querySelectorAll('th.mxth'); }
function mxDelCol(tb, th){
  var cols=mxCols(tb);
  if(cols.length<=1){ toast('최소 1개 부서/프로세스는 유지해야 합니다'); return; }
  var idx=[].indexOf.call(cols, th);
  th.parentNode.removeChild(th);
  tb.querySelectorAll('tbody tr').forEach(function(tr){
    if(tr.children.length>2) tr.removeChild(tr.children[2+idx]);
    else tr.firstElementChild.colSpan = 2 + mxCols(tb).length;
  });
  mxColCnt(tb); mxCount(); toast('심사부서/프로세스가 삭제되었습니다');
}
function mxColCnt(tb){ var e=document.querySelector('.mxcol'); if(e) e.textContent=mxCols(tb).length; }
(function(){
  var tb=document.querySelector('#rp-check table'); if(!tb) return;
  var heads=tb.querySelectorAll('thead tr')[1];
  [].forEach.call(heads.children,function(th,i){
    if(i===0) return;                      /* 좌측 요구사항 라벨 칸 */
    th.classList.add('mxth');
    th.innerHTML = '<div class="flex items-start justify-center gap-1"><div class="flex-1">'+th.innerHTML+'</div>'
      + '<button type="button" class="mxdel text-outline hover:text-error text-[13px] leading-none mt-0.5" title="열 삭제">&#10005;</button></div>';
    th.querySelector('.mxdel').addEventListener('click',function(){
      if(!this.disabled) mxDelCol(tb, th);
    });
  });
  var bar=document.createElement('div');
  bar.className='flex items-center gap-3 mt-3 flex-wrap';
  bar.innerHTML='<button type="button" class="mxadd inline-flex items-center gap-1.5 px-4 h-9 bg-white border '
    + 'border-primary text-primary text-[12.5px] font-bold rounded-[2px] hover:bg-primary hover:text-white transition-colors">'
    + '<span class="material-symbols-outlined text-[17px] leading-none">add</span>심사부서 / 프로세스 추가</button>'
    + '<span class="text-[11.5px] text-on-surface-variant">현재 <b class="mxcol text-primary">0</b>개 부서 / 프로세스</span>'
    + '<span class="text-[11px] text-outline">열 머리글의 ✕ 로 삭제할 수 있습니다</span>';
  tb.closest('div.border').insertAdjacentElement('afterend', bar);
  bar.querySelector('.mxadd').addEventListener('click',function(){
    if(this.disabled) return;
    var n=mxCols(tb).length+1;
    var th=document.createElement('th');
    th.className='mxth px-2 py-2 text-center text-[11px] font-bold text-on-surface-variant border-l border-outline-variant min-w-[92px] leading-tight';
    th.innerHTML='<div class="flex items-start justify-center gap-1"><div class="flex-1">'
      + '<input value="부서'+n+'" class="w-full h-6 px-1 text-[11px] text-center border border-outline-variant rounded-[2px]">'
      + '<input value="프로세스 P" class="w-full h-6 px-1 mt-0.5 text-[10px] text-center font-normal border border-outline-variant rounded-[2px]"></div>'
      + '<button type="button" class="mxdel text-outline hover:text-error text-[13px] leading-none mt-0.5" title="열 삭제">&#10005;</button></div>';
    heads.appendChild(th);
    th.querySelector('.mxdel').addEventListener('click',function(){ if(!this.disabled) mxDelCol(tb, th); });
    tb.querySelectorAll('tbody tr').forEach(function(tr){
      if(tr.children.length<3){ tr.firstElementChild.colSpan = 2 + mxCols(tb).length; return; }
      var td=document.createElement('td');
      td.className='border-l border-surface-container p-0';
      td.innerHTML='<button type="button" class="mcell w-full h-9 text-[13px] hover:bg-primary/5 transition-colors text-outline" data-v="">－</button>';
      tr.appendChild(td);
      mxBindCell(td.querySelector('.mcell'));
    });
    mxColCnt(tb); mxCount(); toast('심사부서/프로세스가 추가되었습니다');
  });
  mxColCnt(tb);
})();

/* 문서 저장 / 임시저장 / 취소 / 기업 전송 */
document.querySelectorAll('.reppane [data-act]').forEach(function(b){
  b.addEventListener('click',function(){
    var a=b.dataset.act, pane=b.closest('.reppane');
    if(!repCan(pane)){ toast('열람 전용 문서입니다'); return; }
    if(a.indexOf('취소')>-1){ show('RP-repList'); return; }
    if(a.indexOf('임시')>-1){ busy('임시저장 중입니다…',600,function(){toast('임시저장되었습니다');}); return; }
    var bad=validate(pane);
    if(bad.length){ toast('필수 항목 '+bad.length+'개를 입력해주세요'); return; }
    if(a.indexOf('전송')>-1){
      var mail='';
      pane.querySelectorAll('label').forEach(function(l){
        if(l.textContent.indexOf('수신 이메일')===0){
          var i=l.parentElement.querySelector('input'); if(i) mail=i.value;
        }
      });
      busy('기업 담당자에게 전송 중입니다…',900,function(){
        toast((mail?mail+' 으로 ':'')+pane.dataset.name+'를 전송했습니다');
      });
      return;
    }
    busy('저장 중입니다…',800,function(){ toast(pane.dataset.name+'가 저장되었습니다'); });
  });
});

/* ── 공지사항 등급별 발송 ─────────────────────────────────── */
(function(){
  var scr=document.getElementById('s-AD-noticeSend'); if(!scr) return;
  var secs=scr.querySelectorAll('section');
  var target=null;
  secs.forEach(function(x){ if(x.textContent.indexOf('수신 대상 등급')>-1) target=x; });
  if(!target) return;
  var NUM=[['심사원보',10],['심사원',39],['선임심사원',12],['검증심사원',3],['관리자',5]];
  var boxes=target.querySelectorAll('input[type=checkbox]');
  function paint(){
    var n=0, who=[];
    boxes.forEach(function(c,i){ if(c.checked && NUM[i]){ n+=NUM[i][1]; who.push(NUM[i][0]); } });
    document.getElementById('ntCnt').textContent=n;
    document.getElementById('ntWho').textContent = who.length ? ('· '+who.join(' / ')) : '등급을 선택하세요';
  }
  boxes.forEach(function(c){ c.addEventListener('change',paint); });
  if(boxes[1]) boxes[1].checked=true;
  if(boxes[2]) boxes[2].checked=true;
  paint();
  scr.querySelectorAll('[data-act]').forEach(function(b){
    if(b.dataset.act.indexOf('발송')<0) return;
    b.addEventListener('click',function(){
      var n=0; boxes.forEach(function(c,i){ if(c.checked&&NUM[i]) n+=NUM[i][1]; });
      if(!n){ toast('수신 등급을 1개 이상 선택해주세요'); return; }
    }, true);
  });
})();

repShow('plan');
/* 직접 진입한 화면을 먼저 노출한다. 현재 역할로 볼 수 없는 화면이면
   그 화면에 접근 가능한 역할로 자동 전환한다 (시안 검토 편의). */
(function(){
  var cur=document.querySelector('.scr'); if(!cur) return;
  var rs=(cur.dataset.roles||'').split(' ').filter(function(x){return x;});
  if(rs.length && rs.indexOf(ROLE)<0){
    ROLE=rs[0]; if(ROLE!=='G') AUTHED=true; saveSession();
    var sel=document.getElementById('role'); if(sel) sel.value=ROLE;
  }
  show(cur.id.slice(2));
})();
applyRole();
setTimeout(function(){document.getElementById('splashbar').style.width='100%';},60);
setTimeout(function(){
  var s=document.getElementById('splash');
  s.style.transition='opacity .45s'; s.style.opacity='0';
  setTimeout(function(){s.style.display='none';},450);
},1100);
