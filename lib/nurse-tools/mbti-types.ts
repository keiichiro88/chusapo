export type MBTIDimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

// 5段階評価の選択肢
export type LikertScale = -2 | -1 | 0 | 1 | 2;
// -2: 強くAに同意, -1: ややAに同意, 0: どちらとも言えない, 1: ややBに同意, 2: 強くBに同意

export interface Question {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  optionA: {
    text: string;
    type: MBTIDimension;
  };
  optionB: {
    text: string;
    type: MBTIDimension;
  };
}

// 5段階評価のスコア配分
export const LIKERT_SCORES: Record<LikertScale, { primary: number; secondary: number }> = {
  [-2]: { primary: 2.0, secondary: 0.0 },   // 強くAに同意: A+2, B+0
  [-1]: { primary: 1.5, secondary: 0.5 },   // ややAに同意: A+1.5, B+0.5
  [0]:  { primary: 1.0, secondary: 1.0 },   // どちらとも言えない: A+1, B+1
  [1]:  { primary: 0.5, secondary: 1.5 },   // ややBに同意: A+0.5, B+1.5
  [2]:  { primary: 0.0, secondary: 2.0 },   // 強くBに同意: A+0, B+2
};

export interface RecruitmentSite {
  name: string;
  description: string;
  url: string;
  color: string;
  tags: string[];
  recommendedFor: string[];
}

export interface PersonalityResult {
  type: string;
  title: string;
  description: string;
  strengths: string[];
  workStyle: string;
  characterImage?: string;
}

export interface AIAdvice {
  careerAdvice: string;
  stressManagement: string;
  teamCompatibility: string;
  personalizedSiteRecommendations?: PersonalizedSiteRecommendation[];
}

export interface PersonalizedSiteRecommendation {
  siteName: string;
  reason: string;
  matchScore: number;
}

export interface MBTIScores {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

export interface DiagnosisHistoryItem {
  id: string;
  mbtiType: string;
  title: string;
  scores: MBTIScores;
  savedAt: string;
}

export interface TypeCompatibility {
  type: string;
  compatibility: 'excellent' | 'good' | 'neutral' | 'challenging';
  description: string;
  workTip: string;
}
