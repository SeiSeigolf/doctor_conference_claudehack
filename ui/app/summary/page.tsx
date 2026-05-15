import Link from "next/link";
import { loadAllCases } from "../lib/data";
import { RiskTier, ReadinessStatus } from "../lib/types";

function laceColor(tier: RiskTier) {
  const map: Record<RiskTier, string> = {
    LOW: "text-green-600",
    MODERATE: "text-blue-600",
    HIGH: "text-amber-600",
    VERY_HIGH: "text-red-600 font-bold",
  };
  return map[tier];
}

function readinessPill(r: ReadinessStatus) {
  if (r === "ready") return <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs font-semibold">退院可</span>;
  if (r === "conditional") return <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-xs font-semibold">条件付き</span>;
  return <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded text-xs font-semibold">未準備</span>;
}

export default function SummaryPage() {
  const cases = loadAllCases();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">3症例比較サマリー</h1>
        <p className="text-gray-500 text-sm mt-1">
          バックエンド検証完了・3症例すべてをエンドツーエンドで実行済み
        </p>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                症例
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                患者
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                LACE
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                退院準備
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                ⚡ 重要
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                対立点
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                ギャップ
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {cases.map(({ id, meta, data }, i) => {
              const criticalCount = data.prioritized_actions.filter(
                (a) => a.priority === "CRITICAL"
              ).length;
              return (
                <tr
                  key={id}
                  className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                >
                  <td className="px-4 py-4 font-mono text-xs text-gray-400">{data.patient_id}</td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900">{data.patient_name}</div>
                    <div className="text-xs text-gray-500">{meta.diagnosis}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-lg font-bold ${laceColor(data.lace_score.tier)}`}>
                      {data.lace_score.total}
                    </span>
                    <div className={`text-xs ${laceColor(data.lace_score.tier)}`}>
                      {data.lace_score.tier.replace("_", " ")}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">{readinessPill(data.discharge_readiness)}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-red-600 font-semibold text-base">{criticalCount}</span>
                  </td>
                  <td className="px-4 py-4 text-center text-gray-700">{data.conflicts.length}</td>
                  <td className="px-4 py-4 text-center text-gray-700">{data.gaps.length}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/case/${id}`}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      詳細 →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Per-case key findings */}
      <div className="grid gap-4 md:grid-cols-3">
        {cases.map(({ id, meta, data }) => {
          const critical = data.prioritized_actions.filter((a) => a.priority === "CRITICAL");
          return (
            <div key={id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="mb-3">
                <span className="text-xs text-blue-600 font-medium">{meta.teaches}</span>
                <h3 className="font-semibold text-gray-900 mt-0.5">{data.patient_name}</h3>
                <p className="text-xs text-gray-500">{meta.diagnosis}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  主な対立点
                </p>
                {data.conflicts.slice(0, 2).map((c) => (
                  <p key={c.conflict_id} className="text-xs text-gray-700 leading-snug">
                    · {c.summary}
                  </p>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  重要アクション
                </p>
                {critical.slice(0, 3).map((a) => (
                  <p key={a.rank} className="text-xs text-red-700 leading-snug">
                    · {a.action.length > 80 ? a.action.substring(0, 77) + "…" : a.action}
                  </p>
                ))}
              </div>
              <Link
                href={`/case/${id}`}
                className="mt-4 block text-center text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 py-1.5 rounded hover:bg-blue-100 transition-colors"
              >
                症例全体を見る →
              </Link>
            </div>
          );
        })}
      </div>

      {/* Demo recommendation */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <h2 className="font-bold text-gray-900 text-base mb-1">
              デモ推奨: 症例3から始める
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>Sarah Williams（DKA + 妊娠）</strong>は最も強いデモ症例です。
              催奇形性薬の検出は医療背景がない聞き手にもリスクが伝わりやすく、LACE 13（非常に高い）で危険度も具体化されます。
              無保険、不安定な住居、食料不安、妊婦健診なしといったSDOH要因も、ROUNDS.aiの価値を説明しやすくしています。
            </p>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
              「臨床的には安定」と「退院準備は未完了」の差分が、マルチエージェント統合の価値を最も明確に示します。
            </p>
            <p className="text-xs text-gray-500 mt-3">
              提示順: 症例1（基本例）→ 症例2（価値観の対立）→ 症例3（重大リスク検出）。
              催奇形性薬の発見後に少し間を置くと効果的です。
            </p>
          </div>
        </div>
      </div>

      {/* Backend status */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 text-sm mb-3">バックエンド状態</h2>
        <div className="grid gap-2 sm:grid-cols-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> LACEスコア検証済み（Chen=12, Jackson=10, Williams=13）
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> 5つの臨床エージェント（Sonnet 4.6）を並列実行
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> 統合役による分析（Opus 4.5）
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> 3症例すべてで対立点とギャップを検出
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> 各症例で4種類の引き継ぎパッケージを生成
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> 患者向け説明をわかりやすい表現で生成
          </div>
        </div>
      </div>
    </div>
  );
}
