/** Khashana Attack Surface Intelligence — local, synthetic demonstration only. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
const now = '2026-09-08T09:30:00.000Z';

const assets = [
  { id:'ast-001', host:'app.northstar.local', ip:'172.28.0.11', environment:'Production', type:'Application', status:'Live', tech:['Next.js','nginx'], ports:['443/https'], http:200, tls:'TLS 1.3 · valid', owner:'Product Engineering', criticality:5, auth:true, firstSeen:'2026-09-01', lastSeen:'2026-09-08', tags:['customer-facing','authenticated'] },
  { id:'ast-002', host:'api.northstar.local', ip:'172.28.0.12', environment:'Production', type:'API', status:'Live', tech:['Node.js','Express'], ports:['443/https'], http:200, tls:'TLS 1.3 · valid', owner:'Platform', criticality:5, auth:true, firstSeen:'2026-09-01', lastSeen:'2026-09-08', tags:['api','sensitive-data'] },
  { id:'ast-003', host:'admin.northstar.local', ip:'172.28.0.13', environment:'Administrative', type:'Admin', status:'Live', tech:['React','nginx'], ports:['443/https'], http:302, tls:'TLS 1.3 · valid', owner:'IT Operations', criticality:5, auth:true, firstSeen:'2026-09-01', lastSeen:'2026-09-08', tags:['privileged','authentication'] },
  { id:'ast-004', host:'staging.northstar.local', ip:'172.28.0.14', environment:'Staging', type:'Application', status:'Live', tech:['Next.js','nginx'], ports:['80/http','443/https'], http:200, tls:'TLS 1.2 · valid', owner:'Product Engineering', criticality:3, auth:false, firstSeen:'2026-09-07', lastSeen:'2026-09-08', tags:['new','pre-production'] },
  { id:'ast-005', host:'dev.northstar.local', ip:'172.28.0.15', environment:'Development', type:'Application', status:'Live', tech:['Vite','Node.js'], ports:['3000/http'], http:200, tls:'Not configured', owner:'Platform', criticality:2, auth:false, firstSeen:'2026-09-07', lastSeen:'2026-09-08', tags:['new','debug'] },
  { id:'ast-006', host:'docs.northstar.local', ip:'172.28.0.16', environment:'Production', type:'Static', status:'Live', tech:['nginx'], ports:['443/https'], http:200, tls:'TLS 1.3 · valid', owner:'Developer Experience', criticality:2, auth:false, firstSeen:'2026-09-01', lastSeen:'2026-09-08', tags:['public'] }
];
const findings = [
  { id:'SK-ASM-001', title:'Missing content security policy on staging application', severity:'Medium', confidence:'High', assetId:'ast-004', endpoint:'https://staging.northstar.local/', category:'Security Headers', status:'Validated', detected:'2026-09-08', lastDetected:'2026-09-08', evidence:'Response headers: content-security-policy was absent in the synthetic local-lab response.', impact:'Increases the impact of a successful client-side injection.', business:'Pre-production exposure could allow unsafe configuration to progress to production.', recommendation:'Define a restrictive CSP and verify it in the release pipeline.', notes:'', validation:'' },
  { id:'SK-ASM-002', title:'Development server exposed with debug metadata', severity:'High', confidence:'Medium', assetId:'ast-005', endpoint:'http://dev.northstar.local:3000/__debug', category:'Information Exposure', status:'Needs Validation', detected:'2026-09-08', lastDetected:'2026-09-08', evidence:'Synthetic discovery fixture returned a development banner and debug route reference.', impact:'May reveal implementation details and aid targeted testing.', business:'An internet-reachable development host raises the likelihood of data or credential exposure.', recommendation:'Restrict access at the network layer; disable debug features outside local development.', notes:'', validation:'' },
  { id:'SK-ASM-003', title:'TLS configuration allows legacy protocol on staging', severity:'Medium', confidence:'High', assetId:'ast-004', endpoint:'https://staging.northstar.local/', category:'TLS Configuration', status:'Remediated', detected:'2026-09-01', lastDetected:'2026-09-07', evidence:'Historical local-lab TLS fixture indicated TLS 1.1 support; current fixture no longer does.', impact:'Legacy protocol support can weaken transport security.', business:'Low direct business impact after remediation; retain retest evidence.', recommendation:'Keep TLS 1.2+ enforced and monitor configuration drift.', notes:'', validation:'Reassessment fixture confirms TLS 1.1 is no longer offered.' },
  { id:'SK-ASM-004', title:'Administrative login surface identified', severity:'Low', confidence:'High', assetId:'ast-003', endpoint:'https://admin.northstar.local/login', category:'Authentication Surface', status:'Accepted Risk', detected:'2026-09-08', lastDetected:'2026-09-08', evidence:'Expected local-lab redirect to a protected administrator login.', impact:'A privileged authentication surface is an attractive target.', business:'Expected capability; ownership and protective controls should be maintained.', recommendation:'Continue MFA, rate limiting, audit logging, and periodic access review.', notes:'', validation:'Expected and protected administrative function in this simulated environment.' }
];
const reviews = {};
function risk(asset) {
  const related = findings.filter(f => f.assetId === asset.id && !['False Positive','Closed','Remediated'].includes(f.status));
  const sev = {Critical:30,High:20,Medium:12,Low:5};
  const score = Math.min(100, asset.criticality * 9 + (asset.environment === 'Production' ? 15 : asset.environment === 'Administrative' ? 13 : 7) + (asset.auth ? 8 : 13) + related.reduce((n,f)=>n+(sev[f.severity]||0)*(f.confidence==='High'?1:.7),0));
  // >=65 identifies material exposure on critical production/admin surfaces before a finding exists.
  return { score, level: score >= 65 ? 'High' : score >= 40 ? 'Medium' : 'Low' };
}
function publicAsset(asset) { return { ...asset, risk:risk(asset) }; }
function dashboard() {
  const decorated = assets.map(publicAsset), open = findings.filter(f => !['Closed','False Positive','Remediated'].includes(f.status));
  return { organization:{id:'org-001',name:'Northstar Labs',classification:'SIMULATED SECURITY ASSESSMENT · TRAINING ENVIRONMENT'}, metrics:{assets:assets.length,live:assets.filter(x=>x.status==='Live').length,highRisk:decorated.filter(x=>x.risk.level==='High').length,openFindings:open.length,critical:findings.filter(x=>x.severity==='Critical').length}, assets:decorated, findings, changes:[{type:'New asset',value:'staging.northstar.local',date:'2026-09-07'},{type:'New asset',value:'dev.northstar.local',date:'2026-09-07'},{type:'Resolved finding',value:'SK-ASM-003 — legacy TLS protocol',date:'2026-09-08'}], generatedAt:now };
}
function body(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try { return Promise.resolve(JSON.parse(req.body)); } catch(e) { return Promise.reject(e); }
    }
    return Promise.resolve(req.body);
  }
  return new Promise((resolve,reject)=>{ let data=''; req.on('data',c=>{data+=c;if(data.length>100000) req.destroy();}); req.on('end',()=>{try{resolve(data?JSON.parse(data):{});}catch(e){reject(e);}}); });
}
function safeFile(urlPath) { const p = path.normalize(path.join(ROOT,'public',urlPath === '/' ? 'index.html' : urlPath)); return p.startsWith(path.join(ROOT,'public')) ? p : null; }
function pdf(text) { const clean=text.replace(/[()\\]/g,'').slice(0,1200); const content=`BT /F1 18 Tf 50 760 Td (Khashana Attack Surface Intelligence) Tj 0 -28 Td /F1 11 Tf (SIMULATED SECURITY ASSESSMENT - Northstar Labs) Tj 0 -34 Td (${clean}) Tj 0 -38 Td (Prepared by Sayed Khashana | Web & API Security Researcher) Tj ET`;
  const objs=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`];
  let out='%PDF-1.4\n', offsets=[0]; objs.forEach((o,i)=>{offsets.push(Buffer.byteLength(out));out+=`${i+1} 0 obj\n${o}\nendobj\n`;}); const xref=Buffer.byteLength(out);out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(x=>String(x).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`; return Buffer.from(out); }
const requestHandler = async (req,res) => {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url,`http://${host}`); const headers={'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Permissions-Policy':'geolocation=(), microphone=(), camera=()','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:"}; Object.entries(headers).forEach(([k,v])=>res.setHeader(k,v));
  try {
    let effectivePath = url.pathname;
    if (req.headers['x-matched-path']) {
      effectivePath = req.headers['x-matched-path'].split('?')[0];
    } else if (req.headers['x-forwarded-uri']) {
      effectivePath = req.headers['x-forwarded-uri'].split('?')[0];
    } else if (url.searchParams.has('__path')) {
      const p = url.searchParams.get('__path');
      effectivePath = p.startsWith('/') ? p : '/api/' + p;
    }
    const route = effectivePath.startsWith('/api') ? effectivePath : '/api' + (effectivePath === '/' ? '' : effectivePath);
    if (req.method==='GET' && (route==='/api' || route==='/api/health')) return json(res,200,{status:'ok',mode:'synthetic-local-demo',time:now});
    if (req.method==='GET' && route==='/api/dashboard') return json(res,200,dashboard());
    if (req.method==='GET' && route==='/api/assets') return json(res,200,assets.map(publicAsset));
    if (req.method==='GET' && route==='/api/findings') return json(res,200,findings);
    if (req.method==='POST' && route==='/api/scans') { const data=await body(req); if (!String(data.target||'').endsWith('.local')) return json(res,403,{error:'Local-lab-only policy: targets must end in .local. No scan was performed.'}); return json(res,202,{id:crypto.randomUUID(),status:'completed',target:data.target,message:'Synthetic local-lab fixture normalized. No network scan was executed.'}); }
    if (req.method==='POST' && /^\/api\/findings\/[^/]+\/review$/.test(route)) { const id=route.split('/')[3], data=await body(req), finding=findings.find(f=>f.id===id); if(!finding) return json(res,404,{error:'Finding not found'}); const allowed=['Validated','False Positive','Needs Validation','Accepted Risk','Remediated','Retest Required','Closed']; if(data.status && !allowed.includes(data.status)) return json(res,400,{error:'Invalid finding state'}); finding.status=data.status||finding.status; finding.notes=String(data.notes||'').slice(0,4000); finding.validation=String(data.validation||'').slice(0,4000); reviews[id]={...data,updatedAt:new Date().toISOString()}; return json(res,200,{finding,review:reviews[id]}); }
    if (req.method==='GET' && route==='/api/reports/executive.pdf') { const d=dashboard(); const report=pdf(`Executive summary: ${d.metrics.assets} assets observed; ${d.metrics.openFindings} open findings; highest priority: ${findings[1].id} on dev.northstar.local needs researcher validation.`); res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="northstar-executive-report.pdf"','Content-Length':report.length}); return res.end(report); }
    if(req.method!=='GET') return json(res,405,{error:'Method not allowed'});
    const file=safeFile(url.pathname); if(!file || !fs.existsSync(file)) return json(res,404,{error:'Not found'}); const ext=path.extname(file); const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'}; res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'}); fs.createReadStream(file).pipe(res);
  } catch(err) { json(res,400,{error: err.message || 'Invalid request'}); }
};
const server = http.createServer(requestHandler);
if(require.main===module) server.listen(PORT,()=>console.log(`KASI local demo running at http://localhost:${PORT}`));
requestHandler.server = server;
requestHandler.risk = risk;
requestHandler.assets = assets;
requestHandler.findings = findings;
module.exports = requestHandler;

