/**
 * Khashana Attack Surface Intelligence — Executive Security Assessment Report Generator
 * Generates an executive-grade, multi-page, text-selectable PDF 1.4 deliverable.
 * Author: Sayed Khashana — Web & API Security Researcher
 */

// Safe text escaping for PDF literal strings: ( -> \(, ) -> \), \ -> \\
function pdfEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

class PdfDoc {
  constructor() {
    this.pages = [];
    this.width = 612; // Standard Letter
    this.height = 792;
    this.margin = 44;
    this.printableWidth = this.width - (this.margin * 2); // 524 pt
  }

  addPage() {
    const page = {
      commands: [],
      rect(x, y, w, h, fill, stroke, lineWidth = 0.75) {
        let s = 'q\n';
        if (lineWidth) s += `${lineWidth} w\n`;
        if (fill) s += `${fill[0]} ${fill[1]} ${fill[2]} rg\n`;
        if (stroke) s += `${stroke[0]} ${stroke[1]} ${stroke[2]} RG\n`;
        s += `${x} ${y} ${w} ${h} re\n`;
        if (fill && stroke) s += 'B\n';
        else if (fill) s += 'f\n';
        else if (stroke) s += 'S\n';
        s += 'Q\n';
        this.commands.push(s);
      },
      line(x1, y1, x2, y2, stroke = [0.8, 0.84, 0.9], lineWidth = 0.75) {
        this.commands.push(`q\n${lineWidth} w\n${stroke[0]} ${stroke[1]} ${stroke[2]} RG\n${x1} ${y1} m\n${x2} ${y2} l\nS\nQ\n`);
      },
      text(str, x, y, { font = 'F1', size = 9.5, color = [0.12, 0.16, 0.22] } = {}) {
        const escaped = pdfEscape(str);
        this.commands.push(`BT\n/${font} ${size} Tf\n${color[0]} ${color[1]} ${color[2]} rg\n${x} ${y} Td\n(${escaped}) Tj\nET\n`);
      },
      badge(label, severity, x, y) {
        let fill = [0.92, 0.95, 0.99], stroke = [0.4, 0.65, 0.9], textCol = [0.15, 0.4, 0.75];
        if (severity === 'Critical') { fill = [0.99, 0.9, 0.9]; stroke = [0.9, 0.2, 0.2]; textCol = [0.75, 0.1, 0.1]; }
        else if (severity === 'High') { fill = [0.99, 0.92, 0.92]; stroke = [0.92, 0.35, 0.35]; textCol = [0.8, 0.15, 0.15]; }
        else if (severity === 'Medium') { fill = [0.99, 0.96, 0.9]; stroke = [0.92, 0.65, 0.2]; textCol = [0.75, 0.45, 0.05]; }
        else if (severity === 'Low' || severity === 'Validated') { fill = [0.9, 0.97, 0.93]; stroke = [0.2, 0.7, 0.5]; textCol = [0.06, 0.5, 0.35]; }
        else if (severity === 'Remediated') { fill = [0.93, 0.95, 0.99]; stroke = [0.35, 0.6, 0.9]; textCol = [0.1, 0.4, 0.8]; }

        const w = (label.length * 5.2) + 12;
        this.rect(x, y - 2, w, 13, fill, stroke, 0.5);
        this.text(label, x + 6, y + 1.5, { font: 'F2', size: 7.5, color: textCol });
        return w;
      },
      codeBox(lines, x, y, w, maxLines = 10) {
        const slice = lines.slice(0, maxLines);
        const h = (slice.length * 11) + 12;
        this.rect(x, y - h, w, h, [0.05, 0.08, 0.14], [0.15, 0.22, 0.35], 0.75);
        slice.forEach((l, idx) => {
          this.text(l, x + 10, y - 14 - (idx * 11), { font: 'F4', size: 7.5, color: [0.85, 0.9, 0.96] });
        });
        return h;
      }
    };
    this.pages.push(page);
    return page;
  }

  compile() {
    const totalPages = this.pages.length;

    // Decorate headers/footers on pages 2 through N
    for (let i = 1; i < totalPages; i++) {
      const p = this.pages[i];
      // Header
      p.text('Khashana Attack Surface Intelligence | Security Assessment Report', this.margin, 754, { font: 'F2', size: 7.5, color: [0.35, 0.42, 0.52] });
      p.text('Target: Northstar Labs (*.northstar.local)', this.width - this.margin - 170, 754, { font: 'F1', size: 7.5, color: [0.35, 0.42, 0.52] });
      p.line(this.margin, 746, this.width - this.margin, 746, [0.85, 0.88, 0.92], 0.75);

      // Footer
      p.line(this.margin, 46, this.width - this.margin, 46, [0.85, 0.88, 0.92], 0.75);
      p.text('CONFIDENTIAL // Prepared by Sayed Khashana — Web & API Security Researcher', this.margin, 34, { font: 'F3', size: 7.5, color: [0.45, 0.5, 0.6] });
      p.text(`Page ${i + 1} of ${totalPages}`, this.width - this.margin - 55, 34, { font: 'F2', size: 7.5, color: [0.25, 0.3, 0.4] });
    }

    const streams = this.pages.map(p => p.commands.join(''));
    const fontRes = '<< /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R /F5 7 0 R >> >>';

    const f1 = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
    const f2 = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
    const f3 = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>';
    const f4 = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';
    const f5 = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>';

    const allObjs = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      null, // slot 2: Pages tree
      f1, f2, f3, f4, f5
    ];

    let nextId = 8;
    const pageKids = [];

    for (let i = 0; i < this.pages.length; i++) {
      const pageId = nextId++;
      const contentId = nextId++;
      pageKids.push(`${pageId} 0 R`);
      const stream = streams[i];
      const pageObj = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Resources ${fontRes} /Contents ${contentId} 0 R >>`;
      const contentObj = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`;
      allObjs.push(pageObj);
      allObjs.push(contentObj);
    }

    allObjs[1] = `<< /Type /Pages /Kids [${pageKids.join(' ')}] /Count ${this.pages.length} >>`;

    let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    const offsets = [0];

    for (let i = 0; i < allObjs.length; i++) {
      offsets.push(Buffer.byteLength(out));
      out += `${i + 1} 0 obj\n${allObjs[i]}\nendobj\n`;
    }

    const xrefOffset = Buffer.byteLength(out);
    out += `xref\n0 ${allObjs.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= allObjs.length; i++) {
      out += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    out += `trailer\n<< /Size ${allObjs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    return Buffer.from(out);
  }
}

/**
 * Builds the complete 9-page professional penetration testing report
 */
function generateExecutiveReport(dataset = {}) {
  const doc = new PdfDoc();
  const m = doc.margin;
  const pw = doc.printableWidth;

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  {
    const p = doc.addPage();
    p.rect(0, 680, doc.width, 112, [0.04, 0.08, 0.16], null);
    p.rect(0, 676, doc.width, 4, [0.14, 0.45, 0.91], null);

    p.text('CONFIDENTIAL // CLIENT DELIVERABLE // STRICTLY CONTROLLED', m, 742, { font: 'F2', size: 8, color: [0.38, 0.65, 0.98] });
    p.text('SECURITY ASSESSMENT REPORT', m, 712, { font: 'F2', size: 24, color: [1, 1, 1] });
    p.text('External Attack Surface Discovery & Vulnerability Prioritization', m, 692, { font: 'F1', size: 12, color: [0.82, 0.88, 0.96] });

    p.rect(m, 580, pw, 70, [0.96, 0.97, 0.99], [0.82, 0.87, 0.94], 1);
    p.text('TARGET ORGANIZATION & SCOPE', m + 18, 628, { font: 'F2', size: 9, color: [0.14, 0.45, 0.91] });
    p.text('Northstar Labs — *.northstar.local', m + 18, 608, { font: 'F2', size: 16, color: [0.08, 0.12, 0.2] });
    p.text('Controlled Training Environment · Simulated Assessment · Non-Destructive Testing', m + 18, 592, { font: 'F1', size: 9, color: [0.4, 0.46, 0.55] });

    p.rect(m, 290, pw, 260, [1, 1, 1], [0.85, 0.88, 0.92], 1);
    p.rect(m, 515, pw, 35, [0.08, 0.13, 0.22], null);
    p.text('ENGAGEMENT METADATA & RESEARCHER ATTESTATION', m + 16, 528, { font: 'F2', size: 10, color: [1, 1, 1] });

    const metaRows = [
      ['Assessment Type:', 'External Attack Surface & Vulnerability Assessment'],
      ['Target Organization:', 'Northstar Labs (Fictional Enterprise / Lab Environment)'],
      ['Authorized Scope:', '*.northstar.local (Production, Staging, Dev, Admin)'],
      ['Lead Researcher:', 'Sayed Khashana'],
      ['Professional Role:', 'Web & API Security Researcher'],
      ['Assessment Date:', '08 September 2026'],
      ['Classification:', 'CONFIDENTIAL / CLIENT DELIVERABLE'],
      ['Methodology Framework:', 'OWASP Top 10:2021 · NIST SP 800-115 · Khashana ASI'],
      ['Report Version:', '1.0 — Final Assessment Deliverable'],
      ['Dynamic Dataset Mode:', 'Live Synthetic Telemetry · Zero Third-Party Scanning']
    ];

    metaRows.forEach((r, idx) => {
      const y = 494 - (idx * 20);
      p.line(m + 12, y - 5, m + pw - 12, y - 5, [0.92, 0.94, 0.97], 0.5);
      p.text(r[0], m + 16, y, { font: 'F2', size: 8.5, color: [0.25, 0.3, 0.4] });
      p.text(r[1], m + 160, y, { font: 'F1', size: 8.5, color: [0.1, 0.15, 0.25] });
    });

    p.rect(m, 80, pw, 180, [0.98, 0.98, 0.99], [0.88, 0.9, 0.94], 1);
    p.text('DISCLAIMER & LEGAL BOUNDARIES', m + 16, 238, { font: 'F2', size: 9, color: [0.18, 0.25, 0.38] });
    const disclaimerLines = [
      'This security assessment report is a controlled deliverable prepared for Northstar Labs as part of an external exposure review.',
      'All observations, vulnerabilities, hostnames, IP allocations, and findings contained herein were established from authorized',
      'synthetic local-lab telemetry. No unauthorized network probes or third-party infrastructure scans were conducted.',
      '',
      'The assessment applies the principle of Human Security Validation: automated scanner detections are treated as hypotheses',
      'until verified by a security researcher. Remediation recommendations prioritize business context and defensive depth.',
      '',
      'Attestation: This report was compiled and verified by Sayed Khashana (Web & API Security Researcher).'
    ];
    disclaimerLines.forEach((l, idx) => {
      p.text(l, m + 16, 218 - (idx * 13), { font: 'F1', size: 8, color: [0.35, 0.4, 0.48] });
    });
  }

  // ==========================================
  // PAGE 2: TABLE OF CONTENTS & 1. EXECUTIVE SUMMARY
  // ==========================================
  {
    const p = doc.addPage();
    let y = 720;

    p.text('1. Executive Summary', m, y, { font: 'F2', size: 16, color: [0.08, 0.15, 0.3] });
    y -= 24;

    p.rect(m, y - 54, pw, 54, [0.99, 0.96, 0.9], [0.9, 0.65, 0.2], 1);
    p.text('1.1 OVERALL RISK RATING', m + 14, y - 16, { font: 'F2', size: 8.5, color: [0.75, 0.45, 0.05] });
    p.text('MEDIUM-HIGH EXPOSURE (Score: 68 / 100 on High-Criticality Assets)', m + 14, y - 36, { font: 'F2', size: 12, color: [0.55, 0.25, 0.02] });
    p.badge('Needs Attention', 'Medium', m + pw - 110, y - 36);
    y -= 74;

    p.text('1.1.1 Overall Security Posture', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 16;
    const postureText = [
      'Northstar Labs demonstrates a hardened posture on its core production tier, with enforced TLS 1.3 encryption and reverse proxy',
      'segmentation on public application endpoints. However, continuous attack surface monitoring revealed notable perimeter drift: two',
      'unannounced assets (staging.northstar.local and dev.northstar.local) expanded the external footprint by 50% between 01 Sep and 08 Sep.',
      'The exposure of an unauthenticated Vite/Node.js development server running on port 3000 represents the primary tactical concern, while',
      'missing Content Security Policies on staging reflect configuration drift across release branches.'
    ];
    postureText.forEach(line => { p.text(line, m, y, { font: 'F1', size: 8.5, color: [0.2, 0.25, 0.32] }); y -= 13; });
    y -= 10;

    p.text('1.1.2 Attack Chain Analysis', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 16;
    p.rect(m, y - 48, pw, 48, [0.97, 0.98, 0.99], [0.85, 0.88, 0.93], 0.75);
    p.text('No end-to-end attack chain was substantiated from the available evidence.', m + 12, y - 18, { font: 'F2', size: 9, color: [0.15, 0.25, 0.4] });
    p.text('While development debug routes and missing staging CSP headers were evidenced, pivoting into internal database clusters or', m + 12, y - 32, { font: 'F1', size: 8, color: [0.35, 0.4, 0.48] });
    p.text('bypassing production authentication was not observed in the provided telemetry.', m + 12, y - 43, { font: 'F1', size: 8, color: [0.35, 0.4, 0.48] });
    y -= 64;

    p.text('1.1.3 Defensive Controls Verified (What Worked)', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 16;
    const workedItems = [
      '• TLS 1.3 Transport Hardening: Production hosts app.northstar.local and api.northstar.local reject legacy ciphers and SSLv3/TLS 1.0/1.1.',
      '• Privileged Portal Authentication: admin.northstar.local enforces immediate HTTP 302 redirection to secure authentication.',
      '• Verified Legacy TLS Remediation: Staging TLS was successfully upgraded from legacy TLS 1.1 to enforced TLS 1.2+ (verified via retest).'
    ];
    workedItems.forEach(item => { p.text(item, m, y, { font: 'F1', size: 8.5, color: [0.15, 0.45, 0.25] }); y -= 14; });
    y -= 10;

    p.text('1.2 Risk Analytics & Finding Distribution', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 18;

    const metricBoxes = [
      { label: 'Critical', count: '0', sub: '0 Active', col: [0.75, 0.15, 0.15], bg: [0.99, 0.92, 0.92] },
      { label: 'High', count: '1', sub: '1 Need Val', col: [0.85, 0.25, 0.25], bg: [0.99, 0.93, 0.93] },
      { label: 'Medium', count: '2', sub: '1 Valid / 1 Rem', col: [0.8, 0.5, 0.1], bg: [0.99, 0.96, 0.9] },
      { label: 'Low / Info', count: '1', sub: '1 Accepted', col: [0.15, 0.55, 0.35], bg: [0.91, 0.97, 0.93] },
      { label: 'Total Assets', count: '6', sub: '6 Live Observed', col: [0.14, 0.45, 0.91], bg: [0.92, 0.95, 0.99] }
    ];

    const bw = (pw - (4 * 10)) / 5;
    metricBoxes.forEach((b, idx) => {
      const bx = m + (idx * (bw + 10));
      p.rect(bx, y - 62, bw, 62, b.bg, [0.85, 0.88, 0.92], 0.75);
      p.text(b.label, bx + 10, y - 16, { font: 'F2', size: 8.5, color: b.col });
      p.text(b.count, bx + 10, y - 42, { font: 'F2', size: 22, color: b.col });
      p.text(b.sub, bx + 10, y - 54, { font: 'F1', size: 7.5, color: [0.4, 0.45, 0.52] });
    });
    y -= 84;

    p.text('Summary of Validated Attack Surface Metrics', m, y, { font: 'F2', size: 9.5, color: [0.15, 0.2, 0.3] });
    y -= 14;
    p.rect(m, y - 48, pw, 48, [1, 1, 1], [0.85, 0.88, 0.92], 0.75);
    p.text('Total Observed Hosts: 6 | Monitored IP Space: 172.28.0.11 - 172.28.0.16 | Open Services: 443/https, 80/http, 3000/http', m + 10, y - 16, { font: 'F1', size: 8, color: [0.2, 0.25, 0.3] });
    p.text('Open Findings: 3 | Verified Closed: 1 | Accepted Operational Risk: 1 | Highest Asset Risk Score: 71/100 (admin.northstar.local)', m + 10, y - 30, { font: 'F1', size: 8, color: [0.2, 0.25, 0.3] });
    p.text('Assessment Conclusion: Prioritize isolation of dev.northstar.local:3000 before proceeding to SOC 2 external audit.', m + 10, y - 42, { font: 'F2', size: 8, color: [0.14, 0.45, 0.91] });
  }

  // ==========================================
  // PAGE 3: 2. SCOPE & TECHNICAL ARCHITECTURE
  // ==========================================
  {
    const p = doc.addPage();
    let y = 720;

    p.text('2. Scope & Technical Architecture', m, y, { font: 'F2', size: 16, color: [0.08, 0.15, 0.3] });
    y -= 20;

    p.text('2.1 Engagement Scope & Asset Ledger', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 16;
    p.text('The assessment was strictly confined to assets within the *.northstar.local domain namespace.', m, y, { font: 'F1', size: 8.5, color: [0.35, 0.4, 0.48] });
    y -= 14;

    const assetHeaders = ['Hostname', 'IP Address', 'Environment', 'Ports / Tech', 'Criticality', 'Risk'];
    const assetRows = [
      ['app.northstar.local', '172.28.0.11', 'Production', '443 (Next.js, nginx)', '5 / 5', '68 High'],
      ['api.northstar.local', '172.28.0.12', 'Production', '443 (Node.js, Express)', '5 / 5', '68 High'],
      ['admin.northstar.local', '172.28.0.13', 'Administrative', '443 (React, nginx)', '5 / 5', '71 High'],
      ['staging.northstar.local', '172.28.0.14', 'Staging', '80, 443 (Next.js, nginx)', '3 / 5', '59 Medium'],
      ['dev.northstar.local', '172.28.0.15', 'Development', '3000 (Vite, Node.js)', '2 / 5', '52 Medium'],
      ['docs.northstar.local', '172.28.0.16', 'Production', '443 (nginx)', '2 / 5', '46 Medium']
    ];
    const colW = [135, 75, 75, 135, 55, 49];

    p.rect(m, y - 18, pw, 18, [0.09, 0.15, 0.26], null);
    let curX = m;
    assetHeaders.forEach((h, idx) => {
      p.text(h, curX + 6, y - 13, { font: 'F2', size: 8, color: [1, 1, 1] });
      curX += colW[idx];
    });
    y -= 18;

    assetRows.forEach((row, rIdx) => {
      const bg = rIdx % 2 === 0 ? [0.97, 0.98, 0.99] : [1, 1, 1];
      p.rect(m, y - 18, pw, 18, bg, [0.88, 0.9, 0.94], 0.5);
      curX = m;
      row.forEach((cell, cIdx) => {
        const isBold = cIdx === 0;
        const font = isBold ? 'F2' : 'F1';
        let color = [0.15, 0.2, 0.28];
        if (cIdx === 5 && cell.includes('High')) color = [0.75, 0.15, 0.15];
        p.text(cell, curX + 6, y - 13, { font, size: 7.5, color });
        curX += colW[cIdx];
      });
      y -= 18;
    });
    y -= 16;

    p.text('2.2 Application Architecture & Endpoint Flow', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 14;

    const archBox = [
      '+-----------------------------------------------------------------------------------------+',
      '| [OBSERVED] Public Internet / Client Entrypoint (Northstar Labs External Surface)         |',
      '+-----------------------------------------------------------------------------------------+',
      '      | (443 / TLS 1.3)          | (443 / TLS 1.3)        | (80, 443 / TLS 1.2)   | (3000 / HTTP)',
      '      v                          v                        v                       v',
      '+--------------------+    +--------------------+    +-------------------+   +--------------------+',
      '| app.northstar.local|    | admin.northstar... |    | staging.northstar |   | dev.northstar.local|',
      '| [Production App]   |    | [Admin Dashboard]  |    | [Pre-Prod Testing]|   | [Vite Dev Server]  |',
      '| Next.js + nginx    |    | React + nginx (302)|    | Missing CSP Header|   | Exposing /__debug  |',
      '+--------------------+    +--------------------+    +-------------------+   +--------------------+',
      '      | (API calls)              | (Auth redirect)        | (Branch drift)        | (UNAUTHENTICATED)',
      '      v                          v                        v                       v',
      '+--------------------+    +--------------------+    +-------------------+   +--------------------+',
      '| api.northstar.local|    | [INFERRED] Internal|    | [INFERRED] Staging|   | DIRECT ACCESS TO   |',
      '| Express API Tier   |    | IdP / SSO Provider |    | Database Instance |   | RUNTIME METADATA   |',
      '+--------------------+    +--------------------+    +-------------------+   +--------------------+'
    ];
    const archH = p.codeBox(archBox, m, y, pw, 17);
    y -= (archH + 16);

    p.text('2.3 Methodology & Operational Limitations', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 14;
    const limits = [
      '• Reconnaissance & Service Probing: Non-invasive port scans and HTTP response header enumeration.',
      '• Human Validation Principle: Detections are verified via curl telemetry before inclusion in reporting.',
      '• Scope Constraint: Third-party dependencies and denial-of-service tests were strictly excluded from testing.'
    ];
    limits.forEach(l => { p.text(l, m, y, { font: 'F1', size: 8, color: [0.3, 0.35, 0.42] }); y -= 12; });
  }

  // ==========================================
  // PAGE 4: 3. TESTING COVERAGE & 4. FINDINGS MANIFEST
  // ==========================================
  {
    const p = doc.addPage();
    let y = 720;

    p.text('3. Testing Coverage & Findings Manifest', m, y, { font: 'F2', size: 16, color: [0.08, 0.15, 0.3] });
    y -= 20;

    p.text('3.1 Coverage Matrix Across Assessment Domains', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 14;

    const covHeaders = ['Domain / Capability', 'Observed Scope', 'Coverage Status', 'Evidence Standard'];
    const covRows = [
      ['Network & Service Enumeration', 'Ports 80, 443, 3000 across 6 hosts', 'TESTED & EVIDENCED', 'Raw TCP connect & HTTP response banners'],
      ['Transport Layer Security (TLS)', 'TLS 1.0, 1.1, 1.2, 1.3 negotiation', 'TESTED & EVIDENCED', 'OpenSSL cipher handshake verification'],
      ['HTTP Security Headers', 'CSP, HSTS, X-Frame-Options, CORS', 'TESTED & EVIDENCED', 'Captured HTTP response header dumps'],
      ['Development Route Exposure', 'dev.northstar.local:3000/__debug', 'TESTED & EVIDENCED', 'HTTP 200 response with debug payload'],
      ['Admin Authentication Robustness', 'admin.northstar.local/login', 'PARTIALLY TESTED', 'Redirect behavior & TLS verified; no brute force'],
      ['Internal Database & Host OS', 'Underlying container filesystem', 'NOT EVIDENCED / OOS', 'Excluded to protect lab stability']
    ];
    const covW = [140, 140, 110, 134];

    p.rect(m, y - 16, pw, 16, [0.09, 0.15, 0.26], null);
    let curX = m;
    covHeaders.forEach((h, idx) => {
      p.text(h, curX + 6, y - 12, { font: 'F2', size: 7.5, color: [1, 1, 1] });
      curX += covW[idx];
    });
    y -= 16;

    covRows.forEach((r, idx) => {
      const bg = idx % 2 === 0 ? [0.97, 0.98, 0.99] : [1, 1, 1];
      p.rect(m, y - 16, pw, 16, bg, [0.88, 0.9, 0.94], 0.5);
      curX = m;
      r.forEach((c, cIdx) => {
        let col = [0.2, 0.25, 0.32];
        let font = 'F1';
        if (cIdx === 2) {
          font = 'F2';
          if (c.includes('TESTED &')) col = [0.06, 0.5, 0.35];
          else if (c.includes('PARTIAL')) col = [0.75, 0.45, 0.05];
          else col = [0.5, 0.55, 0.6];
        }
        p.text(c, curX + 6, y - 11.5, { font, size: 7, color: col });
        curX += covW[cIdx];
      });
      y -= 16;
    });
    y -= 24;

    p.text('4.1 Findings Manifest', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 14;

    const manifestHeaders = ['Finding ID', 'Severity', 'Title', 'OWASP / CWE', 'CVSS v3.1', 'Status'];
    const manifestRows = [
      ['SK-ASM-002', 'High', 'Dev server exposed with debug metadata', 'A05:2021 · CWE-200', '7.5 (High)', 'Needs Validation'],
      ['SK-ASM-001', 'Medium', 'Missing CSP header on staging app', 'A05:2021 · CWE-693', '5.4 (Medium)', 'Validated'],
      ['SK-ASM-003', 'Medium', 'Legacy TLS 1.1 protocol enabled on staging', 'A02:2021 · CWE-326', '5.9 (Medium)', 'Remediated'],
      ['SK-ASM-004', 'Low', 'Administrative login surface identified', 'A07:2021 · CWE-287', '0.0 (Info)', 'Accepted Risk']
    ];
    const manW = [75, 55, 175, 105, 55, 59];

    p.rect(m, y - 18, pw, 18, [0.09, 0.15, 0.26], null);
    curX = m;
    manifestHeaders.forEach((h, idx) => {
      p.text(h, curX + 6, y - 13, { font: 'F2', size: 8, color: [1, 1, 1] });
      curX += manW[idx];
    });
    y -= 18;

    manifestRows.forEach((r, idx) => {
      const bg = idx % 2 === 0 ? [0.97, 0.98, 0.99] : [1, 1, 1];
      p.rect(m, y - 20, pw, 20, bg, [0.88, 0.9, 0.94], 0.5);
      curX = m;
      r.forEach((c, cIdx) => {
        let col = [0.15, 0.2, 0.3];
        let font = cIdx === 0 ? 'F2' : 'F1';
        if (cIdx === 1) {
          font = 'F2';
          if (c === 'High') col = [0.8, 0.15, 0.15];
          else if (c === 'Medium') col = [0.75, 0.45, 0.05];
          else col = [0.15, 0.55, 0.35];
        }
        p.text(c, curX + 6, y - 14, { font, size: 7.5, color: col });
        curX += manW[cIdx];
      });
      y -= 20;
    });
    y -= 24;

    p.text('Critical Severity Findings', m, y, { font: 'F2', size: 10, color: [0.75, 0.15, 0.15] });
    y -= 14;
    p.rect(m, y - 28, pw, 28, [0.99, 0.97, 0.97], [0.92, 0.8, 0.8], 0.75);
    p.text('No Critical severity findings were substantiated from the available evidence.', m + 14, y - 18, { font: 'F3', size: 8.5, color: [0.55, 0.2, 0.2] });
  }

  // ==========================================
  // PAGE 5: DETAILED FINDING — SK-ASM-002
  // ==========================================
  {
    const p = doc.addPage();
    let y = 720;

    p.text('4.2 Detailed Finding: SK-ASM-002', m, y, { font: 'F2', size: 16, color: [0.08, 0.15, 0.3] });
    y -= 22;

    p.rect(m, y - 68, pw, 68, [0.99, 0.95, 0.95], [0.9, 0.35, 0.35], 1);
    p.text('HIGH SEVERITY · CVSS 7.5 · NEEDS RESEARCHER VALIDATION', m + 14, y - 16, { font: 'F2', size: 8.5, color: [0.8, 0.15, 0.15] });
    p.text('Development Server Exposed with Debug Metadata', m + 14, y - 36, { font: 'F2', size: 13, color: [0.1, 0.15, 0.25] });
    p.text('Target: http://dev.northstar.local:3000/__debug | Asset: ast-005 | OWASP A05:2021 | CWE-200 / CWE-215', m + 14, y - 54, { font: 'F1', size: 8, color: [0.35, 0.4, 0.48] });
    y -= 84;

    p.rect(m, y - 24, pw, 24, [0.96, 0.97, 0.99], [0.85, 0.88, 0.92], 0.75);
    p.text('CVSS:3.1 Vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N | Likelihood: High | Impact: High | Confidence: Medium', m + 10, y - 16, { font: 'F4', size: 7.5, color: [0.2, 0.25, 0.35] });
    y -= 38;

    const sections = [
      ['Technical Analysis & Attack Surface', [
        'During automated perimeter discovery, port 3000 was identified responding to external HTTP requests on dev.northstar.local.',
        'The service banner revealed an active Vite / Node.js development server. Requesting the root path returned application scaffolding,',
        'while inspection of common development route patterns confirmed an unauthenticated /__debug endpoint.'
      ]],
      ['Security Researcher Hypothesis & Validation', [
        'Hypothesis: The development server was initiated with a wild-card interface binding (0.0.0.0:3000) and lacks upstream firewall filtering.',
        'Validation: Direct HTTP GET query to http://dev.northstar.local:3000/__debug returned an HTTP 200 OK with internal routing tables,',
        'environment metadata tags, and component source map paths. No credential extraction was attempted to preserve lab integrity.'
      ]],
      ['Exploitation & Business Impact', [
        'Technical Impact: Exposing debug endpoints allows unauthenticated adversaries to map internal service structures and dependencies.',
        'Business Impact: While hosted on a development tier, leaked metadata frequently includes staging API tokens and database URIs,',
        'enabling targeted lateral movement into pre-production customer environments.'
      ]]
    ];

    sections.forEach(([title, paras]) => {
      p.text(title, m, y, { font: 'F2', size: 9.5, color: [0.14, 0.45, 0.91] });
      y -= 14;
      paras.forEach(para => {
        p.text(para, m, y, { font: 'F1', size: 8, color: [0.2, 0.25, 0.32] });
        y -= 12;
      });
      y -= 6;
    });

    p.text('Evidence: Captured Telemetry (Figure 1 — Debug Route Response)', m, y, { font: 'F2', size: 8.5, color: [0.25, 0.3, 0.4] });
    y -= 12;
    const evidenceCode = [
      'GET /__debug HTTP/1.1',
      'Host: dev.northstar.local:3000',
      'User-Agent: Khashana-ASI-Collector/1.0 (Authorized Security Probe)',
      '',
      'HTTP/1.1 200 OK',
      'Content-Type: application/json; charset=utf-8',
      'X-Powered-By: Vite/Node.js Development Engine',
      '',
      '{"status":"debug-mode","environment":"development","buildTarget":"v2.1.0-rc3",',
      ' "routes":["/api/v1/auth","/api/v1/telemetry","/__debug"],"sourceMaps":true}'
    ];
    const evH = p.codeBox(evidenceCode, m, y, pw, 10);
    y -= (evH + 16);

    p.rect(m, y - 48, pw, 48, [0.95, 0.98, 0.95], [0.2, 0.65, 0.35], 0.75);
    p.text('Remediation Directives for SK-ASM-002', m + 10, y - 14, { font: 'F2', size: 8.5, color: [0.1, 0.45, 0.2] });
    p.text('• Immediate Fix: Restrict port 3000 in the border security group to 127.0.0.1 or internal VPN CIDR ranges only.', m + 10, y - 26, { font: 'F1', size: 7.5, color: [0.15, 0.2, 0.25] });
    p.text('• Long-Term Fix: Mandate dev server configurations bind to localhost by default; enforce egress/ingress CI firewall rules.', m + 10, y - 36, { font: 'F1', size: 7.5, color: [0.15, 0.2, 0.25] });
    p.text('• Verification: Re-run curl http://dev.northstar.local:3000/__debug from external vantage point and verify connection timeout.', m + 10, y - 45, { font: 'F1', size: 7.5, color: [0.15, 0.2, 0.25] });
  }

  // ==========================================
  // PAGE 6: DETAILED FINDING — SK-ASM-001
  // ==========================================
  {
    const p = doc.addPage();
    let y = 720;

    p.text('4.3 Detailed Finding: SK-ASM-001', m, y, { font: 'F2', size: 16, color: [0.08, 0.15, 0.3] });
    y -= 22;

    p.rect(m, y - 68, pw, 68, [0.99, 0.96, 0.9], [0.92, 0.65, 0.2], 1);
    p.text('MEDIUM SEVERITY · CVSS 5.4 · RESEARCHER VALIDATED', m + 14, y - 16, { font: 'F2', size: 8.5, color: [0.75, 0.45, 0.05] });
    p.text('Missing Content Security Policy on Staging Application', m + 14, y - 36, { font: 'F2', size: 13, color: [0.1, 0.15, 0.25] });
    p.text('Target: https://staging.northstar.local/ | Asset: ast-004 | OWASP A05:2021 | CWE-693 / CWE-1021', m + 14, y - 54, { font: 'F1', size: 8, color: [0.35, 0.4, 0.48] });
    y -= 84;

    p.rect(m, y - 24, pw, 24, [0.96, 0.97, 0.99], [0.85, 0.88, 0.92], 0.75);
    p.text('CVSS:3.1 Vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N | Likelihood: Medium | Impact: Low-Medium | Confidence: High', m + 10, y - 16, { font: 'F4', size: 7.5, color: [0.2, 0.25, 0.35] });
    y -= 38;

    const sections = [
      ['Technical Analysis & Attack Surface', [
        'The staging environment hosting the customer portal (staging.northstar.local) was evaluated for defense-in-depth browser protections.',
        'HTTP responses served over HTTPS lacked a Content-Security-Policy (CSP) response header. While production enforces modern',
        'transport policies, this protection was omitted in the pre-production reverse proxy template.'
      ]],
      ['Security Researcher Hypothesis & Validation', [
        'Hypothesis: The absence of CSP allows unconstrained execution of injected script resources and cross-site framing.',
        'Validation: Direct inspection of response headers confirms the complete absence of content-security-policy and x-frame-options.',
        'Because staging shares session tokens with pre-production APIs, this represents a validated security gap.'
      ]],
      ['Exploitation & Business Impact', [
        'Technical Impact: If an XSS vulnerability exists on the staging portal, browser-level controls cannot prevent exfiltration of session data.',
        'Business Impact: Pre-production environments are frequently targeted to stage phishing attacks or test exploits against real configurations',
        'without triggering production Security Operations Center (SOC) alerts.'
      ]]
    ];

    sections.forEach(([title, paras]) => {
      p.text(title, m, y, { font: 'F2', size: 9.5, color: [0.14, 0.45, 0.91] });
      y -= 14;
      paras.forEach(para => {
        p.text(para, m, y, { font: 'F1', size: 8, color: [0.2, 0.25, 0.32] });
        y -= 12;
      });
      y -= 6;
    });

    p.text('Evidence: HTTP Response Headers (Figure 2 — Absent Header Telemetry)', m, y, { font: 'F2', size: 8.5, color: [0.25, 0.3, 0.4] });
    y -= 12;
    const evidenceCode = [
      'GET / HTTP/1.1',
      'Host: staging.northstar.local',
      '',
      'HTTP/1.1 200 OK',
      'Server: nginx',
      'Content-Type: text/html; charset=utf-8',
      'Strict-Transport-Security: max-age=31536000',
      'X-Content-Type-Options: nosniff',
      '[MISSING] Content-Security-Policy header is absent from HTTP response',
      '[MISSING] X-Frame-Options header is absent from HTTP response'
    ];
    const evH = p.codeBox(evidenceCode, m, y, pw, 10);
    y -= (evH + 16);

    p.rect(m, y - 48, pw, 48, [0.95, 0.98, 0.95], [0.2, 0.65, 0.35], 0.75);
    p.text('Remediation Directives for SK-ASM-001', m + 10, y - 14, { font: 'F2', size: 8.5, color: [0.1, 0.45, 0.2] });
    p.text('• Immediate Fix: Add "add_header Content-Security-Policy default-src \'self\';" to nginx server block on staging.', m + 10, y - 26, { font: 'F1', size: 7.5, color: [0.15, 0.2, 0.25] });
    p.text('• Long-Term Fix: Incorporate security header auditing into pre-merge automated CI/CD deployment checks.', m + 10, y - 36, { font: 'F1', size: 7.5, color: [0.15, 0.2, 0.25] });
    p.text('• Verification: Execute curl -I https://staging.northstar.local and verify presence of Content-Security-Policy.', m + 10, y - 45, { font: 'F1', size: 7.5, color: [0.15, 0.2, 0.25] });
  }

  // ==========================================
  // PAGE 7: RETEST VERIFICATION — SK-ASM-003
  // ==========================================
  {
    const p = doc.addPage();
    let y = 720;

    p.text('4.4 Retest & Remediation Verification: SK-ASM-003', m, y, { font: 'F2', size: 16, color: [0.08, 0.15, 0.3] });
    y -= 22;

    p.rect(m, y - 68, pw, 68, [0.93, 0.96, 0.99], [0.35, 0.6, 0.9], 1);
    p.text('MEDIUM SEVERITY · VERIFIED REMEDIATED & RETESTED', m + 14, y - 16, { font: 'F2', size: 8.5, color: [0.1, 0.4, 0.8] });
    p.text('TLS Configuration Allows Legacy Protocol on Staging', m + 14, y - 36, { font: 'F2', size: 13, color: [0.1, 0.15, 0.25] });
    p.text('Target: https://staging.northstar.local/ | Asset: ast-004 | OWASP A02:2021 | CWE-326 | Initial Finding: 01 Sep 2026', m + 14, y - 54, { font: 'F1', size: 8, color: [0.35, 0.4, 0.48] });
    y -= 84;

    p.text('Retest Summary & Cryptographic Validation', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 14;
    const retestSummary = [
      'During the 01 Sep baseline discovery, staging.northstar.local accepted TLS 1.1 handshakes with deprecated cipher suites.',
      'Legacy transport protocols are susceptible to cryptographic downgrade attacks (e.g., POODLE, BEAST variants) and violate SOC 2',
      'and PCI-DSS compliance standards. Following notification, Northstar Labs engineering updated the cipher suite configuration.',
      'A formal retest probe was executed on 08 Sep 2026 to verify closure of the finding.'
    ];
    retestSummary.forEach(s => { p.text(s, m, y, { font: 'F1', size: 8, color: [0.2, 0.25, 0.32] }); y -= 12; });
    y -= 10;

    p.text('Retest Comparison: Baseline vs. Post-Remediation Verification', m, y, { font: 'F2', size: 9.5, color: [0.14, 0.45, 0.91] });
    y -= 14;

    const bW = (pw - 16) / 2;
    p.rect(m, y - 100, bW, 100, [0.99, 0.95, 0.95], [0.9, 0.5, 0.5], 0.75);
    p.text('BASELINE (01 SEP 2026) — VULNERABLE', m + 10, y - 14, { font: 'F2', size: 8, color: [0.75, 0.15, 0.15] });
    const beforeLines = [
      'Client Probe: openssl s_client -tls1_1',
      'Target: staging.northstar.local:443',
      'Handshake: CONNECTED(00000003)',
      'Protocol: TLSv1.1 (Negotiated)',
      'Cipher: ECDHE-RSA-AES256-SHA',
      'Status: FAIL — Deprecated Protocol Supported'
    ];
    beforeLines.forEach((l, idx) => {
      p.text(l, m + 10, y - 28 - (idx * 11), { font: 'F4', size: 7, color: [0.35, 0.15, 0.15] });
    });

    p.rect(m + bW + 16, y - 100, bW, 100, [0.93, 0.98, 0.94], [0.25, 0.7, 0.4], 0.75);
    p.text('RETEST (08 SEP 2026) — VERIFIED REMEDIATED', m + bW + 26, y - 14, { font: 'F2', size: 8, color: [0.08, 0.5, 0.3] });
    const afterLines = [
      'Client Probe: openssl s_client -tls1_1',
      'Target: staging.northstar.local:443',
      'Handshake: FAILURE (Reset by peer)',
      'Alert: alert protocol version (0x0246)',
      'Modern Probe: TLSv1.2 & TLSv1.3 PASS',
      'Status: VERIFIED CLOSED — Strict Protocol Enforced'
    ];
    afterLines.forEach((l, idx) => {
      p.text(l, m + bW + 26, y - 28 - (idx * 11), { font: 'F4', size: 7, color: [0.08, 0.4, 0.2] });
    });
    y -= 118;

    p.text('Retest Telemetry Logs (Figure 3 — Cryptographic Rejection Proof)', m, y, { font: 'F2', size: 8.5, color: [0.25, 0.3, 0.4] });
    y -= 12;
    const retestCode = [
      '$ openssl s_client -connect staging.northstar.local:443 -tls1_1',
      'CONNECTED(00000003)',
      '140294827181888:error:1409442E:SSL routines:ssl3_read_bytes:tlsv1 alert protocol version:../ssl/record/rec_layer_s3.c:1544:SSL alert number 70',
      '---',
      'no peer certificate available',
      '---',
      'SSL handshake has read 7 bytes and written 119 bytes',
      'Verification: [OK] Protocol TLSv1.1 rejected by host.'
    ];
    const rtH = p.codeBox(retestCode, m, y, pw, 8);
    y -= (rtH + 16);

    p.rect(m, y - 40, pw, 40, [0.95, 0.98, 0.95], [0.2, 0.65, 0.35], 0.75);
    p.text('Researcher Attestation of Remediation', m + 10, y - 14, { font: 'F2', size: 8.5, color: [0.1, 0.45, 0.2] });
    p.text('Finding SK-ASM-003 is formally closed. Transport security across staging infrastructure conforms to modern cryptographic standards.', m + 10, y - 28, { font: 'F1', size: 7.5, color: [0.15, 0.2, 0.25] });
  }

  // ==========================================
  // PAGE 8: FINDING SK-ASM-004 & 5. REMEDIATION STRATEGY
  // ==========================================
  {
    const p = doc.addPage();
    let y = 720;

    p.text('4.5 Finding: SK-ASM-004 & 5. Remediation Strategy', m, y, { font: 'F2', size: 16, color: [0.08, 0.15, 0.3] });
    y -= 20;

    p.rect(m, y - 56, pw, 56, [0.96, 0.98, 0.99], [0.4, 0.65, 0.9], 0.75);
    p.text('LOW SEVERITY / EXPOSURE · ACCEPTED OPERATIONAL RISK', m + 12, y - 14, { font: 'F2', size: 8, color: [0.15, 0.4, 0.75] });
    p.text('SK-ASM-004: Administrative Login Surface Identified (admin.northstar.local/login)', m + 12, y - 30, { font: 'F2', size: 10, color: [0.1, 0.15, 0.25] });
    p.text('Risk Accepted: Privileged administrative login is an intentional business capability. Observed safeguards (TLS 1.3, IT Ops ownership,', m + 12, y - 42, { font: 'F1', size: 7.5, color: [0.35, 0.4, 0.48] });
    p.text('302 redirect) are functioning as intended. Recommended: continue enforcing MFA, rate-limiting, and VPN access restrictions.', m + 12, y - 52, { font: 'F1', size: 7.5, color: [0.35, 0.4, 0.48] });
    y -= 74;

    p.text('5.1 Per-Finding Remediation Matrix', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 14;

    const remHeaders = ['Finding', 'Immediate Triage Fix', 'Strategic Architectural Fix', 'Verification Standard'];
    const remRows = [
      ['SK-ASM-002', 'Ingress firewall blocks port 3000', 'Container bind restricted to 127.0.0.1', 'External curl connection timeout'],
      ['SK-ASM-001', 'Inject CSP in staging nginx block', 'CI/CD security header compliance test', 'HTTP response header verification'],
      ['SK-ASM-003', 'Enforce ssl_protocols TLS 1.2+', 'Infrastructure-as-Code TLS template', 'OpenSSL rejection of legacy ciphers'],
      ['SK-ASM-004', 'Verify MFA enforcement', 'Network-level zero-trust VPN gateway', 'Audit log of privileged auth attempts']
    ];
    const remW = [70, 150, 154, 150];

    p.rect(m, y - 16, pw, 16, [0.09, 0.15, 0.26], null);
    let curX = m;
    remHeaders.forEach((h, idx) => {
      p.text(h, curX + 6, y - 12, { font: 'F2', size: 7.5, color: [1, 1, 1] });
      curX += remW[idx];
    });
    y -= 16;

    remRows.forEach((r, idx) => {
      const bg = idx % 2 === 0 ? [0.97, 0.98, 0.99] : [1, 1, 1];
      p.rect(m, y - 22, pw, 22, bg, [0.88, 0.9, 0.94], 0.5);
      curX = m;
      r.forEach((c, cIdx) => {
        const font = cIdx === 0 ? 'F2' : 'F1';
        p.text(c, curX + 6, y - 14, { font, size: 7, color: [0.15, 0.2, 0.28] });
        curX += remW[cIdx];
      });
      y -= 22;
    });
    y -= 24;

    p.text('5.2 Strategic Remediation Roadmap', m, y, { font: 'F2', size: 11, color: [0.1, 0.18, 0.32] });
    y -= 14;

    const phases = [
      {
        phase: 'PHASE 1: IMMEDIATE TRIAGE (0–30 DAYS)',
        col: [0.8, 0.15, 0.15],
        bg: [0.99, 0.93, 0.93],
        items: [
          '• Isolate dev.northstar.local port 3000 to eliminate unauthenticated diagnostic telemetry leakage.',
          '• Audit all external-facing cloud security groups for unapproved non-standard ports (e.g., 3000, 8080, 8888).'
        ]
      },
      {
        phase: 'PHASE 2: HARDENING & STANDARDIZATION (30–90 DAYS)',
        col: [0.75, 0.45, 0.05],
        bg: [0.99, 0.96, 0.9],
        items: [
          '• Implement unified Content Security Policies across staging and production reverse proxies.',
          '• Integrate security linter checks into continuous integration pipelines to prevent configuration drift.'
        ]
      },
      {
        phase: 'PHASE 3: CONTINUOUS ASSURANCE (90+ DAYS)',
        col: [0.14, 0.45, 0.91],
        bg: [0.92, 0.95, 0.99],
        items: [
          '• Establish automated quarterly attack surface diffing to catch shadow infrastructure prior to audit windows.',
          '• Commission comprehensive authenticated web application penetration testing on core customer-facing APIs.'
        ]
      }
    ];

    phases.forEach(ph => {
      p.rect(m, y - 46, pw, 46, ph.bg, [0.85, 0.88, 0.92], 0.75);
      p.text(ph.phase, m + 12, y - 14, { font: 'F2', size: 8, color: ph.col });
      ph.items.forEach((item, iIdx) => {
        p.text(item, m + 12, y - 26 - (iIdx * 11), { font: 'F1', size: 7.5, color: [0.2, 0.25, 0.32] });
      });
      y -= 54;
    });
  }

  // ==========================================
  // PAGE 9: 6. APPENDIX & RESEARCHER SIGN-OFF
  // ==========================================
  {
    const p = doc.addPage();
    let y = 720;

    p.text('6. Appendix & Assessment Attestation', m, y, { font: 'F2', size: 16, color: [0.08, 0.15, 0.3] });
    y -= 22;

    const appendices = [
      ['6.1 Methodology References & Framework Standards', [
        '• OWASP Top 10 Web Application Security Risks (2021 Edition) — Categories A02, A05, A07.',
        '• NIST Special Publication 800-115 — Technical Guide to Information Security Testing and Assessment.',
        '• CVSS v3.1 Specification — First.org Common Vulnerability Scoring System v3.1 User Guide.'
      ]],
      ['6.2 Tool Inventory & Telemetry Harnesses', [
        '• Khashana ASI Core Engine: Deterministic asset normalization, change detection, and contextual risk scoring.',
        '• OpenSSL Cryptographic Suite (v3.0.x): Handshake negotiation probes for SSLv3 through TLS 1.3 protocol validation.',
        '• HTTP Telemetry Harness: Automated non-destructive header inspection and HTTP status code correlation.'
      ]],
      ['6.3 Glossary of Technical Security Terminology', [
        '• Attack Surface Intelligence (ASI): Continuous discovery, attribution, and risk weighting of public-facing IT assets.',
        '• Content Security Policy (CSP): HTTP header allowing site operators to restrict resources the browser may execute.',
        '• BOLA / IDOR: Broken Object Level Authorization, wherein an API fails to validate user permission to access resources.',
        '• Perimeter Drift: The accumulation of unmonitored changes and shadow IT assets between formal security baselines.'
      ]],
      ['6.4 Evidence Index', [
        '• Evidence Ref 1: GET dev.northstar.local:3000/__debug JSON metadata response (Captured 08 Sep 2026).',
        '• Evidence Ref 2: GET staging.northstar.local HTTP response headers missing CSP directive (Captured 08 Sep 2026).',
        '• Evidence Ref 3: OpenSSL s_client handshake rejection log verifying TLS 1.1 remediation (Captured 08 Sep 2026).'
      ]]
    ];

    appendices.forEach(([title, items]) => {
      p.text(title, m, y, { font: 'F2', size: 9.5, color: [0.14, 0.45, 0.91] });
      y -= 14;
      items.forEach(item => {
        p.text(item, m, y, { font: 'F1', size: 8, color: [0.2, 0.25, 0.32] });
        y -= 12;
      });
      y -= 8;
    });

    y -= 10;
    p.rect(m, y - 110, pw, 110, [0.97, 0.98, 1], [0.35, 0.55, 0.9], 1);
    p.text('FORMAL DELIVERABLE ATTESTATION & RESEARCHER SIGN-OFF', m + 16, y - 18, { font: 'F2', size: 9, color: [0.1, 0.35, 0.8] });
    p.text('This executive assessment report represents a defensible, human-validated assessment of the external security posture', m + 16, y - 34, { font: 'F1', size: 8, color: [0.2, 0.25, 0.35] });
    p.text('of Northstar Labs. All documented findings carry verified technical evidence and realistic business impact context.', m + 16, y - 46, { font: 'F1', size: 8, color: [0.2, 0.25, 0.35] });

    p.text('Lead Security Researcher:', m + 16, y - 72, { font: 'F2', size: 8.5, color: [0.15, 0.2, 0.3] });
    p.text('Sayed Khashana', m + 16, y - 88, { font: 'F2', size: 12, color: [0.08, 0.15, 0.3] });
    p.text('Web & API Security Researcher // Khashana ASI', m + 16, y - 100, { font: 'F3', size: 8, color: [0.4, 0.45, 0.55] });

    p.text('Assessment Date: 08 September 2026', m + pw - 200, y - 72, { font: 'F2', size: 8.5, color: [0.15, 0.2, 0.3] });
    p.text('Classification: CONFIDENTIAL', m + pw - 200, y - 88, { font: 'F2', size: 8.5, color: [0.75, 0.15, 0.15] });
    p.text('Delivery Channel: Direct Client Deliverable', m + pw - 200, y - 100, { font: 'F1', size: 8, color: [0.4, 0.45, 0.55] });
  }

  return doc.compile();
}

module.exports = { generateExecutiveReport };
