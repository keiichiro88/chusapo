import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { MBTIScores } from '../../lib/nurse-tools/mbti-types';

interface MBTIRadarChartProps {
  scores: MBTIScores;
}

export function MBTIRadarChart({ scores }: MBTIRadarChartProps) {
  // 30問版：各次元の最大スコア
  // EI: 8問×2点=16, SN: 7問×2点=14, TF: 8問×2点=16, JP: 7問×2点=14
  const maxScores = {
    E: 16, I: 16,
    S: 14, N: 14,
    T: 16, F: 16,
    J: 14, P: 14,
  };
  
  // パーセント計算（最低10%を保証して0が表示されないようにする）
  const calcPercent = (score: number, dimension: keyof typeof maxScores) => {
    const percent = (score / maxScores[dimension]) * 100;
    return Math.max(10, Math.round(percent)); // 最低10%を保証
  };
  
  const data = [
    {
      dimension: 'E - 外向',
      value: calcPercent(scores.E, 'E'),
      fullMark: 100,
    },
    {
      dimension: 'N - 直感',
      value: calcPercent(scores.N, 'N'),
      fullMark: 100,
    },
    {
      dimension: 'F - 感情',
      value: calcPercent(scores.F, 'F'),
      fullMark: 100,
    },
    {
      dimension: 'P - 柔軟',
      value: calcPercent(scores.P, 'P'),
      fullMark: 100,
    },
    {
      dimension: 'I - 内向',
      value: calcPercent(scores.I, 'I'),
      fullMark: 100,
    },
    {
      dimension: 'S - 感覚',
      value: calcPercent(scores.S, 'S'),
      fullMark: 100,
    },
    {
      dimension: 'T - 思考',
      value: calcPercent(scores.T, 'T'),
      fullMark: 100,
    },
    {
      dimension: 'J - 計画',
      value: calcPercent(scores.J, 'J'),
      fullMark: 100,
    },
  ];

  // 各軸のバランスを計算（両方0の場合は50%/50%にフォールバック）
  const calcBalance = (a: number, b: number) => {
    const total = a + b;
    if (total === 0) return 50;
    return Math.round((a / total) * 100);
  };
  
  const eiBalance = calcBalance(scores.E, scores.I);
  const snBalance = calcBalance(scores.S, scores.N);
  const tfBalance = calcBalance(scores.T, scores.F);
  const jpBalance = calcBalance(scores.J, scores.P);

  return (
    <div className="w-full space-y-4">
      {/* レーダーチャート */}
      <div className="w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height={280} minWidth={200}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickCount={5}
            />
            <Radar
              name="あなたのスコア"
              dataKey="value"
              stroke="#14b8a6"
              fill="#14b8a6"
              fillOpacity={0.4}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 4軸のバランスバー */}
      <div className="space-y-3 px-2">
        <h4 className="text-sm font-semibold text-slate-600 mb-2">各軸のバランス</h4>
        
        {/* E - I */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 w-6">E</span>
          <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden relative">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500"
              style={{ width: `${eiBalance}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-700">{eiBalance}% / {100 - eiBalance}%</span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 w-6">I</span>
        </div>

        {/* S - N */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 w-6">S</span>
          <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden relative">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
              style={{ width: `${snBalance}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-700">{snBalance}% / {100 - snBalance}%</span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 w-6">N</span>
        </div>

        {/* T - F */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 w-6">T</span>
          <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden relative">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-400 to-purple-500 transition-all duration-500"
              style={{ width: `${tfBalance}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-700">{tfBalance}% / {100 - tfBalance}%</span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 w-6">F</span>
        </div>

        {/* J - P */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 w-6">J</span>
          <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden relative">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
              style={{ width: `${jpBalance}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-700">{jpBalance}% / {100 - jpBalance}%</span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 w-6">P</span>
        </div>
      </div>

      {/* 凡例 */}
      <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-100">
        <p>E=外向 / I=内向 | S=感覚 / N=直感 | T=思考 / F=感情 | J=計画 / P=柔軟</p>
      </div>
    </div>
  );
}

