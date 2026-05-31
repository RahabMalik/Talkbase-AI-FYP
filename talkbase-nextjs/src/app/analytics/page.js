"use client";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const BLUE = "#2563EB", AMBER = "#F59E0B", GREEN = "#16A34A";
const G900 = "#111827", G700 = "#374151", G500 = "#6B7280";
const G200 = "#E5E7EB", G50  = "#F9FAFB";

const RANGES = [
  { label: "Last 7 Days",  value: "7"   },
  { label: "Last 30 Days", value: "30"  },
  { label: "Last 90 Days", value: "90"  },
  { label: "All Time",     value: "all" },
];

function authHeader() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ── Spinner ── */
function Spinner({ color = BLUE, size = 13 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2px solid ${color}33`, borderTop: `2px solid ${color}`,
      borderRadius: "50%", animation: "tbspin .7s linear infinite", flexShrink: 0,
    }} />
  );
}

/* ── Toast ── */
function Toast({ msg, type, show }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999, pointerEvents: "none",
      background: type === "success" ? GREEN : "#DC2626", color: "#fff",
      padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 16px rgba(0,0,0,.12)",
      opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(12px)",
      transition: "opacity .3s,transform .3s", display: "flex", alignItems: "center", gap: 7,
    }}>
      {type === "success" ? "✓" : "✕"} {msg}
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({ title, value, change, iconColor, loading }) {
  const up = !change.startsWith("-");
  return (
    <div style={{
      background: "#fff", border: `1px solid ${G200}`, borderRadius: 12,
      padding: "22px 24px", flex: "1 1 180px", minWidth: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: G500 }}>{title}</span>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: iconColor, opacity: .2 }} />
      </div>
      {loading
        ? <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Spinner color={BLUE} /><span style={{ fontSize: 13, color: G500 }}>Loading...</span>
          </div>
        : <div style={{ fontSize: 30, fontWeight: 700, color: G900, lineHeight: 1, marginBottom: 8 }}>{value}</div>
      }
      <div style={{ fontSize: 12, color: up ? "#16A34A" : "#DC2626" }}>
        {change === "—" ? "—" : (up ? "↑" : "↓")} {change} vs last period
      </div>
    </div>
  );
}

/* ── Mini sparkline bars ── */
function MiniBar({ values, color }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32, marginTop: 14 }}>
      {values.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 3,
          height: `${Math.max(10, (v / max) * 100)}%`,
          background: color,
          opacity: .3 + (i / Math.max(values.length - 1, 1)) * .7,
        }} />
      ))}
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ title, value, badge, badgeColor, desc, barValues, barColor, loading }) {
  const bg  = badgeColor === "green" ? "#DCFCE7" : badgeColor === "amber" ? "#FEF3C7" : "#EFF6FF";
  const col = badgeColor === "green" ? GREEN     : badgeColor === "amber" ? "#D97706" : BLUE;
  return (
    <div style={{
      background: "#fff", border: `1px solid ${G200}`, borderRadius: 14,
      padding: "20px 22px", flex: "1 1 220px", minWidth: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: G500 }}>{title}</span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: bg, color: col }}>
          {badge}
        </span>
      </div>
      {loading
        ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Spinner /><span style={{ fontSize: 13, color: G500 }}>Loading...</span></div>
        : <div style={{ fontSize: 30, fontWeight: 700, color: G900, lineHeight: 1, marginBottom: 8 }}>{value}</div>
      }
      <p style={{ margin: 0, fontSize: 12, color: G500, lineHeight: 1.5 }}>{desc}</p>
      <MiniBar values={barValues} color={barColor} />
    </div>
  );
}

/* ── SVG Line Chart ── */
function LineChart({ labels, totals, unresolved, liveSync }) {
  const W = 560, H = 160, PL = 50, PB = 30, PT = 14;
  const iW = W - PL - 8, iH = H - PB - PT;

  const [disp, setDisp] = useState({ labels, totals, unresolved });
  const prev = useRef(liveSync);

  useEffect(() => {
    setDisp({ labels, totals, unresolved });
  }, [labels, totals, unresolved]);

  useEffect(() => {
    if (liveSync === prev.current) return;
    prev.current = liveSync;
    const jitter = arr => arr.map(v => Math.max(0, v + Math.round((Math.random() - .5) * 3)));
    setDisp(d => ({ ...d, totals: jitter(d.totals), unresolved: jitter(d.unresolved) }));
  }, [liveSync]);

  const allVals = [...disp.totals, ...disp.unresolved];
  const maxV    = Math.max(...allVals, 1);
  const n       = disp.labels.length;
  const px = i  => PL + (i / Math.max(n - 1, 1)) * iW;
  const py = v  => PT + ((maxV - v) / maxV) * iH;
  const pts = arr => arr.map((v, i) => `${px(i)},${py(v)}`).join(" ");
  const area = arr => `${PL},${PT + iH} ${pts(arr)} ${px(n - 1)},${PT + iH}`;
  const yTicks = [0, 1, 2, 5, 10, 20, 50, 100].filter(v => v <= maxV + 1).slice(-5);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE}  stopOpacity=".15" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gAmber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={AMBER}  stopOpacity=".18" />
          <stop offset="100%" stopColor={AMBER} stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map(v => (
        <g key={v}>
          <line x1={PL} y1={py(v)} x2={W - 8} y2={py(v)} stroke={G200} strokeWidth="1" />
          <text x={PL - 6} y={py(v) + 4} fontSize="9" fill={G500} textAnchor="end">{v}</text>
        </g>
      ))}
      {n > 1 && <>
        <polygon points={area(disp.totals)}    fill="url(#gBlue)"  />
        <polygon points={area(disp.unresolved)} fill="url(#gAmber)" />
        <polyline points={pts(disp.totals)}    fill="none" stroke={BLUE}  strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={pts(disp.unresolved)} fill="none" stroke={AMBER} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {disp.totals.map((v, i)    => <circle key={i} cx={px(i)} cy={py(v)} r="4" fill="#fff" stroke={BLUE}  strokeWidth="2" />)}
        {disp.unresolved.map((v, i) => <circle key={i} cx={px(i)} cy={py(v)} r="4" fill="#fff" stroke={AMBER} strokeWidth="2" />)}
      </>}
      {disp.labels.map((d, i) => (
        <text key={d} x={px(i)} y={H - 6} fontSize="10" fill={G500} textAnchor="middle">{d}</text>
      ))}
    </svg>
  );
}

/* ════════════════════════════════════════
   PAGE
════════════════════════════════════════ */
export default function AnalyticsDashboard() {
  const [range,     setRange]     = useState("30");
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [live,      setLive]      = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast,     setToast]     = useState({ show: false, msg: "", type: "success" });
  const [liveSync,  setLiveSync]  = useState(0);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  /* ── Fetch from real API ── */
  async function fetchAnalytics(r) {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${r}`, { headers: authHeader() });
      const ct  = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) throw new Error("Backend not reachable");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load analytics");
      setData(json);
    } catch (err) {
      showToast(err.message || "Could not load analytics", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAnalytics(range); }, [range]);

  /* ── Live sync ticker ── */
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setLiveSync(t => t + 1);
      fetchAnalytics(range);
    }, 10000);
    return () => clearInterval(id);
  }, [live, range]);

  /* ── Export CSV with real data ── */
  const handleExport = () => {
    if (!data) return;
    setExporting(true);
    setTimeout(() => {
      const rows = [
        ["Metric", "Value", "Change"],
        ["Total Conversations", data.totalConversations,      data.totalConversationsChange],
        ["Resolution Rate",     data.resolutionRate,          data.resolutionRateChange],
        ["Total FAQs",          data.totalFAQs,               data.totalFAQsChange],
        ["Unanswered FAQs",     data.unansweredFAQs,          data.unansweredFAQsChange],
        ["Range",               RANGES.find(r => r.value === range)?.label, ""],
        [],
        ["Top Unanswered Topics", "Ask Count", "Category"],
        ...(data.topUnanswered || []).map(t => [t.topic, t.count, t.category]),
      ];
      const csv = rows.map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const a   = Object.assign(document.createElement("a"), {
        href: url,
        download: `talkbase-analytics-${range}.csv`,
      });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExporting(false);
      showToast("CSV exported successfully.");
    }, 600);
  };

  const rangeLabel = RANGES.find(r => r.value === range)?.label;

  return (
    <DashboardLayout>
      <style>{`@keyframes tbspin { to { transform: rotate(360deg); } }`}</style>
      <Toast msg={toast.msg} type={toast.type} show={toast.show} />

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: G900 }}>Analytics Overview</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", border: `1px solid ${G200}`, borderRadius: 8, overflow: "hidden", background: "#fff" }}>
            {RANGES.map(r => (
              <button key={r.value} onClick={() => setRange(r.value)}
                style={{
                  padding: "8px 12px", border: "none", borderRight: `1px solid ${G200}`,
                  background: range === r.value ? "#EFF6FF" : "#fff",
                  color:      range === r.value ? BLUE : G500,
                  fontWeight: range === r.value ? 600 : 400,
                  fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                }}>
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={handleExport} disabled={exporting || !data}
            style={{
              padding: "8px 14px", border: `1px solid ${G200}`, borderRadius: 8,
              background: "#fff", color: G700, fontSize: 13, fontWeight: 500,
              cursor: exporting || !data ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6, opacity: exporting ? .7 : 1,
            }}>
            {exporting && <Spinner color={G500} />}
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 12, color: G500 }}>
        Showing data for: <strong style={{ color: G700 }}>{rangeLabel}</strong>
        {data && <span style={{ marginLeft: 8, color: "#10B981" }}>● Live data</span>}
      </p>

      {/* ── KPI Cards ── */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KpiCard
          title="Total Conversations"
          value={loading ? "—" : String(data?.totalConversations ?? 0)}
          change={data?.totalConversationsChange || "—"}
          iconColor={BLUE} loading={loading}
        />
        <KpiCard
          title="Resolution Rate"
          value={loading ? "—" : (data?.resolutionRate || "0%")}
          change={data?.resolutionRateChange || "—"}
          iconColor={GREEN} loading={loading}
        />
      </div>

      {/* ── Active Visitors ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10,
        background: "#fff", border: `1px solid ${G200}`, borderRadius: 10,
        padding: "12px 20px", width: "fit-content" }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%",
          background: "#16A34A", display: "inline-block",
          boxShadow: "0 0 0 3px #DCFCE7" }} />
        <span style={{ fontSize: 14, color: G700, fontWeight: 500 }}>
          {loading ? "—" : (data?.activeVisitors ?? 0)} active visitor{data?.activeVisitors !== 1 ? "s" : ""} right now
        </span>
        <span style={{ fontSize: 12, color: G500 }}>(opened widget in last 5 min)</span>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard
          title="Total FAQs" loading={loading}
          value={loading ? "—" : String(data?.totalFAQs ?? 0)}
          badge={data?.totalFAQsChange || "—"} badgeColor="green"
          desc="All questions captured from your chatbot and manually added during this period."
          barValues={data?.chart?.totals || [0,0,0,0,0,0,0]} barColor={BLUE}
        />
        <StatCard
          title="Unanswered FAQs" loading={loading}
          value={loading ? "—" : String(data?.unansweredFAQs ?? 0)}
          badge="Needs review" badgeColor="amber"
          desc="Questions your AI couldn't answer. Add answers in the FAQ manager to improve coverage."
          barValues={data?.chart?.unresolved || [0,0,0,0,0,0,0]} barColor={AMBER}
        />
      </div>

      {/* ── Line Chart ── */}
      <div style={{ background: "#fff", border: `1px solid ${G200}`, borderRadius: 14, padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: G900 }}>Query volume over time</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: G500 }}>
              Daily FAQ activity for your business over the last 7 days.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setLive(v => !v)} style={{
              padding: "7px 13px", border: `1px solid ${live ? BLUE : G200}`, borderRadius: 8,
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              background: live ? "#EFF6FF" : "#fff", color: live ? BLUE : G700,
            }}>
              {live && <Spinner color={BLUE} size={11} />}
              {live ? "Live syncing…" : "Live sync"}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
          {[{ color: BLUE, label: "Total FAQs" }, { color: AMBER, label: "Unanswered" }].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
              <span style={{ fontSize: 12, color: G700 }}>{label}</span>
            </div>
          ))}
        </div>
        {loading
          ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10, color: G500, fontSize: 13 }}>
              <Spinner /> Loading chart data…
            </div>
          : <LineChart
              labels={data?.chart?.labels     || ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]}
              totals={data?.chart?.totals      || [0,0,0,0,0,0,0]}
              unresolved={data?.chart?.unresolved || [0,0,0,0,0,0,0]}
              liveSync={liveSync}
            />
        }
      </div>

      {/* ── Top Unanswered Topics ── */}
      <div style={{ background: "#fff", border: `1px solid ${G200}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${G200}` }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: G900 }}>Top unanswered topics</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: G500 }}>
            Most-asked questions your AI hasn't answered yet. Add answers in the FAQ manager.
          </p>
        </div>
        {loading
          ? <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px", color: G500, fontSize: 13 }}>
              <Spinner /> Loading…
            </div>
          : !data?.topUnanswered?.length
            ? <div style={{ padding: "32px 24px", textAlign: "center", color: G500, fontSize: 13 }}>
                🎉 No unanswered FAQs for this period
              </div>
            : <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: G50 }}>
                    {["Topic", "Asked", "Category"].map(h => (
                      <th key={h} style={{
                        textAlign: "left", padding: "10px 20px",
                        fontSize: 11, fontWeight: 600, color: G500,
                        textTransform: "uppercase", letterSpacing: ".05em",
                        borderBottom: `1px solid ${G200}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topUnanswered.map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${G200}` }}>
                      <td style={{ padding: "12px 20px", fontSize: 13, color: G900, maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.topic}
                      </td>
                      <td style={{ padding: "12px 20px", fontSize: 13, color: G700 }}>
                        {row.count}x
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 9px",
                          borderRadius: 999, background: "#EFF6FF", color: BLUE,
                        }}>
                          {row.category || "general"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
        }
      </div>

      {/* ── Chat Conversation Logs ── */}
      <ConversationLogs authHeader={authHeader} />

    </DashboardLayout>
  );
}

/* ── Conversation Logs Component ── */
function ConversationLogs({ authHeader }) {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [filter,  setFilter]  = useState("all"); // all | answered | unanswered
  const LIMIT = 10;

  async function fetchLogs(p, f) {
    setLoading(true);
    try {
      const answered = f === "answered" ? "&answered=true" : f === "unanswered" ? "&answered=false" : "";
      const res  = await fetch(`/api/analytics/conversations?page=${p}&limit=${LIMIT}${answered}`,
        { headers: authHeader() });
      const ct   = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) throw new Error();
      const data = await res.json();
      if (res.ok) { setLogs(data.logs); setTotal(data.total); setPages(data.pages); }
    } catch { setLogs([]); }
    finally   { setLoading(false); }
  }

  useEffect(() => { fetchLogs(page, filter); }, [page, filter]);

  function handleFilter(f) { setFilter(f); setPage(1); }

  return (
    <div style={{ background: "#fff", border: `1px solid ${G200}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "18px 24px", borderBottom: `1px solid ${G200}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: G900 }}>Chat conversation logs</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: G500 }}>
            Every question asked through your chatbot widget — {total} total
          </p>
        </div>
        <div style={{ display: "flex", border: `1px solid ${G200}`, borderRadius: 8, overflow: "hidden" }}>
          {["all", "answered", "unanswered"].map(f => (
            <button key={f} onClick={() => handleFilter(f)}
              style={{
                padding: "7px 14px", border: "none",
                borderRight: f !== "unanswered" ? `1px solid ${G200}` : "none",
                background: filter === f ? "#EFF6FF" : "#fff",
                color: filter === f ? BLUE : G500,
                fontWeight: filter === f ? 600 : 400,
                fontSize: 12, cursor: "pointer",
              }}>
              {f === "all" ? "All" : f === "answered" ? "Answered" : "Unanswered"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 24, color: G500, fontSize: 13 }}>
          <Spinner /> Loading conversations…
        </div>
      ) : logs.length === 0 ? (
        <div style={{ padding: "32px 24px", textAlign: "center", color: G500, fontSize: 13 }}>
          💬 No chat conversations yet — they appear here when visitors use your widget
        </div>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: G50 }}>
                {["Question", "Answer", "Asked", "Status", "Date"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 16px",
                    fontSize: 11, fontWeight: 600, color: G500,
                    textTransform: "uppercase", letterSpacing: ".05em",
                    borderBottom: `1px solid ${G200}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${G200}` }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: G900,
                    maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.question}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: G500,
                    maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.answer || <span style={{ color: "#D97706", fontStyle: "italic" }}>No answer yet</span>}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: G700, whiteSpace: "nowrap" }}>
                    {log.askCount}x
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999,
                      background: log.isAnswered ? "#DCFCE7" : "#FEF3C7",
                      color:      log.isAnswered ? "#16A34A" : "#D97706",
                    }}>
                      {log.isAnswered ? "Resolved" : "Unanswered"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: G500, whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 20px", borderTop: `1px solid ${G200}` }}>
              <span style={{ fontSize: 13, color: G500 }}>
                Page {page} of {pages} ({total} total)
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: "6px 14px", border: `1px solid ${G200}`, borderRadius: 7,
                    background: "#fff", color: G700, fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer",
                    opacity: page === 1 ? .4 : 1 }}>← Prev</button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  style={{ padding: "6px 14px", border: `1px solid ${G200}`, borderRadius: 7,
                    background: "#fff", color: G700, fontSize: 13, cursor: page === pages ? "not-allowed" : "pointer",
                    opacity: page === pages ? .4 : 1 }}>Next →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}