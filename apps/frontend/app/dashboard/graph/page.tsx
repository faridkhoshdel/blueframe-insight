"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

// بارگذاری داینامیک با ssr: false
const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-50 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blueframe mx-auto mb-4"></div>
          <p className="text-gray-500">در حال بارگذاری گراف...</p>
        </div>
      </div>
    )
  }
);

const COMMUNITY_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", 
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"
];

export default function GraphPage() {
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodeNetwork, setNodeNetwork] = useState<any>(null);
  const [loadingNetwork, setLoadingNetwork] = useState(false);
  const [graphKey, setGraphKey] = useState(0);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:50001/graph/full");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // اعتبارسنجی داده‌ها
      if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        throw new Error("ساختار داده نامعتبر است");
      }
      
      setRawData(data);
      setGraphKey(prev => prev + 1);
    } catch (e: any) {
      console.error("خطا در بارگذاری گراف:", e);
      setError(e.message || "خطا در بارگذاری گراف");
    } finally {
      setLoading(false);
    }
  };

  // تبدیل داده‌ها با useMemo برای جلوگیری از recompute
  const graphData = useMemo(() => {
    if (!rawData || !rawData.nodes || !rawData.edges) {
      return { nodes: [], links: [] };
    }

    const nodeIds = new Set(rawData.nodes.map((n: any) => n.id));
    
    const nodes = rawData.nodes.map((n: any) => ({
      id: String(n.id),
      name: n.name || "بدون نام",
      company: n.company || n.name || "نامشخص",
      leadScore: n.leadScore || 0,
      churnRisk: n.churnRisk || 0,
      degree: n.degree || 0,
      centrality: n.centrality || 0,
      community: n.community || 0,
      val: 8 + (n.centrality || 0) * 25,
      color: COMMUNITY_COLORS[(n.community || 0) % COMMUNITY_COLORS.length],
    }));

    const links = rawData.edges
      .filter((e: any) => {
        const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
        const targetId = typeof e.target === 'object' ? e.target.id : e.target;
        return nodeIds.has(String(sourceId)) && nodeIds.has(String(targetId));
      })
      .map((e: any) => ({
        source: String(typeof e.source === 'object' ? e.source.id : e.source),
        target: String(typeof e.target === 'object' ? e.target.id : e.target),
        type: e.type || "UNKNOWN",
        strength: e.strength || 0.5,
        color: `rgba(100, 100, 100, ${0.2 + (e.strength || 0.5) * 0.5})`,
      }));

    return { nodes, links };
  }, [rawData]);

  const handleNodeClick = useCallback(async (node: any) => {
    if (!node || !node.id) return;
    setSelectedNode(node);
    setLoadingNetwork(true);
    try {
      const res = await fetch(`http://localhost:50001/graph/customer/${node.id}/network`);
      const data = await res.json();
      setNodeNetwork(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNetwork(false);
    }
  }, []);

  // محاسبه آمار
  const stats = useMemo(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) {
      return { totalNodes: 0, totalEdges: 0, avgDegree: "0", communities: 0, topInfluencer: null };
    }
    const communities = new Set(graphData.nodes.map(n => n.community));
    const topInfluencer = [...graphData.nodes].sort((a, b) => b.centrality - a.centrality)[0];
    return {
      totalNodes: graphData.nodes.length,
      totalEdges: graphData.links.length,
      avgDegree: (graphData.nodes.reduce((s, n) => s + n.degree, 0) / graphData.nodes.length).toFixed(1),
      communities: communities.size,
      topInfluencer,
    };
  }, [graphData]);

  const getRelationTypeName = (type: string): string => {
    const names: Record<string, string> = {
      'INDUSTRY': '🏭 صنعت یکسان',
      'REFERRAL': '🤝 معرفی',
      'PARTNER': '💼 شریک',
      'COMPETITOR': '⚔️ رقیب',
      'SUPPLIER': '📦 تأمین‌کننده',
    };
    return names[type] || type;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-blueframe">🕸️ Knowledge Graph</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-bold mb-2">خطا در بارگذاری گراف</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button onClick={loadGraph} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-blueframe">🕸️ Knowledge Graph</h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">شبکه روابط بین مشتریان و تحلیل Influence</p>
      </div>

      {/* آمار گراف */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-soft border">
          <p className="text-xs text-gray-500">Nodes</p>
          <p className="text-2xl font-bold text-blueframe">{stats.totalNodes}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-soft border">
          <p className="text-xs text-gray-500">Edges</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalEdges}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-soft border">
          <p className="text-xs text-gray-500">Communities</p>
          <p className="text-2xl font-bold text-green-600">{stats.communities}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-soft border">
          <p className="text-xs text-gray-500">Avg Degree</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.avgDegree}</p>
        </div>
        <div className="bg-gradient-to-l from-blueframe/10 to-blue-50 p-4 rounded-xl border-2 border-blueframe/20 col-span-2 md:col-span-1">
          <p className="text-xs text-blueframe">🏆 Top Influencer</p>
          <p className="text-sm font-bold text-blueframe truncate">
            {stats.topInfluencer?.name || "-"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* گراف اصلی */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft border overflow-hidden">
          <div className="p-4 border-b bg-gradient-to-l from-blueframe/5 to-transparent">
            <h3 className="font-bold flex items-center gap-2">
              <span>🕸️</span>
              <span>Network Visualization</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              روی گره‌ها کلیک کنید • اندازه = Influence • رنگ = Community
            </p>
          </div>
          <div className="relative h-[500px] md:h-[600px] bg-gradient-to-br from-gray-50 to-white">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blueframe mx-auto mb-4"></div>
                  <p className="text-gray-500">در حال بارگذاری گراف...</p>
                </div>
              </div>
            ) : graphData.nodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-3">🕸️</div>
                  <p className="text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
                  <button onClick={loadGraph} className="mt-4 px-4 py-2 bg-blueframe text-white rounded-lg">
                    بارگذاری مجدد
                  </button>
                </div>
              </div>
            ) : (
              <ForceGraph2D
                key={graphKey}
                graphData={graphData}
                nodeLabel={(node: any) => `<b>${node.name}</b><br/>${node.company}<br/>Influence: ${(node.centrality * 100).toFixed(0)}%`}
                nodeColor="color"
                nodeVal="val"
                nodeRelSize={6}
                nodeCanvasObjectMode={() => "replace"}
                nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
                  const label = node.name;
                  const fontSize = 12 / globalScale;
                  const nodeSize = Math.sqrt(node.val) * 1.5;
                  
                  // رسم گره
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
                  ctx.fillStyle = node.color;
                  ctx.fill();
                  ctx.strokeStyle = "#ffffff";
                  ctx.lineWidth = 2 / globalScale;
                  ctx.stroke();
                  
                  // رسم متن
                  ctx.font = `${fontSize}px Vazirmatn, sans-serif`;
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillStyle = "#1f2937";
                  ctx.fillText(label, node.x, node.y + nodeSize + fontSize);
                }}
                linkColor="color"
                linkWidth={(link: any) => 1 + (link.strength || 0.5) * 3}
                linkDirectionalArrowLength={4}
                linkDirectionalArrowRelPos={0.9}
                onNodeClick={handleNodeClick}
                cooldownTicks={100}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
                warmupTicks={50}
              />
            )}
          </div>
          <div className="p-3 border-t bg-gray-50 flex flex-wrap gap-2 text-xs">
            {COMMUNITY_COLORS.slice(0, stats.communities).map((color, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                <span>Community {i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* پنل جزئیات */}
        <div className="bg-white rounded-xl shadow-soft border">
          <div className="p-4 border-b bg-gradient-to-l from-blueframe/5 to-transparent">
            <h3 className="font-bold flex items-center gap-2">
              <span>🔍</span>
              <span>Network Insights</span>
            </h3>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            {selectedNode ? (
              loadingNetwork ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blueframe mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">در حال تحلیل شبکه...</p>
                </div>
              ) : nodeNetwork ? (
                <div className="space-y-4">
                  <div className="pb-4 border-b">
                    <h4 className="text-lg font-bold">{selectedNode.name}</h4>
                    <p className="text-sm text-gray-500">{selectedNode.company}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Score: {selectedNode.leadScore}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        Influence: {(selectedNode.centrality * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        Degree: {selectedNode.degree}
                      </span>
                    </div>
                  </div>

                  {nodeNetwork.networkInsights && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs font-bold text-blue-900 mb-1">🧠 Network Insight:</p>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        {nodeNetwork.networkInsights}
                      </p>
                    </div>
                  )}

                  <div>
                    <h5 className="font-bold text-sm mb-2">
                      ارتباطات ({nodeNetwork.connections?.length || 0})
                    </h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {nodeNetwork.connections?.map((conn: any, i: number) => (
                        <div 
                          key={i} 
                          className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                          onClick={() => {
                            const node = graphData.nodes.find(n => n.id === conn.id);
                            if (node) handleNodeClick(node);
                          }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{conn.name}</p>
                              <p className="text-xs text-gray-500">{conn.company}</p>
                            </div>
                            <span className="text-xs">
                              {conn.direction === 'outgoing' ? '→' : '←'}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-blueframe/10 text-blueframe rounded">
                              {getRelationTypeName(conn.relationType)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Score: {conn.leadScore}
                            </span>
                          </div>
                        </div>
                      ))}
                      {(!nodeNetwork.connections || nodeNetwork.connections.length === 0) && (
                        <p className="text-xs text-gray-500 text-center py-4">
                          ارتباطی ثبت نشده
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🎯</div>
                <h4 className="font-bold mb-2">یک گره انتخاب کنید</h4>
                <p className="text-sm text-gray-500">
                  روی هر مشتری در گراف کلیک کنید تا تحلیل شبکه آن را ببینید
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* راهنما */}
      <div className="bg-gradient-to-l from-blueframe/5 to-transparent p-5 rounded-xl border border-blueframe/20">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <span>💡</span>
          <span>راهنمای تحلیل Knowledge Graph</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blueframe">●</span>
            <div>
              <p className="font-medium">اندازه گره</p>
              <p className="text-xs text-gray-600">نشان‌دهنده Influence (Centrality) در شبکه</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blueframe">●</span>
            <div>
              <p className="font-medium">رنگ گره</p>
              <p className="text-xs text-gray-600">نشان‌دهنده Community (گروه مشتریان مرتبط)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blueframe">●</span>
            <div>
              <p className="font-medium">ضخامت خط</p>
              <p className="text-xs text-gray-600">نشان‌دهنده قدرت رابطه (Strength)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blueframe">●</span>
            <div>
              <p className="font-medium">Drag & Zoom</p>
              <p className="text-xs text-gray-600">گره‌ها را بکشید و با چرخ موس zoom کنید</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
