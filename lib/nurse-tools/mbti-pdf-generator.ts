import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PersonalityResult, AIAdvice, MBTIScores } from './mbti-types';

interface PDFGeneratorOptions {
  mbtiType: string;
  result: PersonalityResult;
  scores: MBTIScores;
  aiAdvice?: AIAdvice | null;
  userName?: string;
  diagnosisDate?: string;
}

// スコアのバランスを計算
const calcBalance = (a: number, b: number): number => {
  const total = a + b;
  if (total === 0) return 50;
  return Math.round((a / total) * 100);
};

/**
 * HTMLエレメントをキャプチャしてPDFとして保存
 * 日本語対応のため、html2canvasで画像化してからPDFに埋め込む
 */
export async function generateMBTIPDFFromElement(
  element: HTMLElement,
  options: PDFGeneratorOptions
): Promise<void> {
  const { mbtiType, result, scores, diagnosisDate } = options;
  const dateStr = diagnosisDate || new Date().toLocaleDateString('ja-JP');

  // A4サイズのPDFを作成
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const headerHeight = 25;
  const contentTop = 30; // ヘッダーの下

  // ヘッダーを描画
  const primaryColor: [number, number, number] = [20, 184, 166];
  const textColor: [number, number, number] = [30, 41, 59];
  const lightGray: [number, number, number] = [148, 163, 184];

  const drawHeader = () => {
    // ヘッダー背景
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');

    // タイトル（英語で表示 - 日本語フォントがないため）
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text('Nurse Career Diagnosis AI', pageWidth / 2, 12, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text(`MBTI Type: ${mbtiType} | Date: ${dateStr}`, pageWidth / 2, 20, { align: 'center' });
  };

  drawHeader();
  let yPos = contentTop;

  // 結果ページ（全内容）をキャプチャして複数ページPDFに分割
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgWidthMm = contentWidth;
    const mmPerPx = imgWidthMm / canvas.width;

    const availableHeightMm = pageHeight - yPos - margin;
    const sliceHeightPx = Math.max(1, Math.floor(availableHeightMm / mmPerPx));

    let renderedPx = 0;
    while (renderedPx < canvas.height) {
      const remainingPx = canvas.height - renderedPx;
      const currentSlicePx = Math.min(sliceHeightPx, remainingPx);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = currentSlicePx;
      const ctx = pageCanvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // 元Canvasの一部分を切り出す
      ctx.drawImage(
        canvas,
        0,
        renderedPx,
        canvas.width,
        currentSlicePx,
        0,
        0,
        canvas.width,
        currentSlicePx
      );

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      const sliceHeightMm = currentSlicePx * mmPerPx;
      pdf.addImage(imgData, 'JPEG', margin, yPos, imgWidthMm, sliceHeightMm);

      renderedPx += currentSlicePx;

      if (renderedPx < canvas.height) {
        pdf.addPage();
        drawHeader();
        yPos = contentTop;
      }
    }

  } catch (error) {
    console.error('Failed to capture element:', error);
    // フォールバック: データベースのPDF生成に切り替え
    await generateMBTIPDF(options);
    return;
  }

  // フッター
  pdf.setFontSize(8);
  pdf.setTextColor(...lightGray);
  pdf.text('Nurse Career Diagnosis AI', pageWidth / 2, pageHeight - 8, { align: 'center' });

  // PDFをダウンロード
  const fileName = `NurseCareer_${mbtiType}_${dateStr.replace(/\//g, '')}.pdf`;
  pdf.save(fileName);
}

/**
 * データのみからPDFを生成（英語表記版）
 */
export async function generateMBTIPDF(options: PDFGeneratorOptions): Promise<void> {
  const { mbtiType, result, scores, aiAdvice, userName, diagnosisDate } = options;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const primaryColor: [number, number, number] = [20, 184, 166];
  const textColor: [number, number, number] = [30, 41, 59];
  const lightGray: [number, number, number] = [148, 163, 184];

  // ヘッダー背景
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 45, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text('Nurse Career Diagnosis AI', pageWidth / 2, 18, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text('MBTI Personality Report', pageWidth / 2, 28, { align: 'center' });

  const dateStr = diagnosisDate || new Date().toLocaleDateString('ja-JP');
  pdf.setFontSize(9);
  pdf.text(`Diagnosis Date: ${dateStr}`, pageWidth / 2, 38, { align: 'center' });

  yPos = 55;

  if (userName) {
    pdf.setTextColor(...textColor);
    pdf.setFontSize(12);
    pdf.text(`Name: ${userName}`, margin, yPos);
    yPos += 10;
  }

  // MBTIタイプ表示
  pdf.setFillColor(240, 253, 250);
  pdf.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');
  
  pdf.setTextColor(...primaryColor);
  pdf.setFontSize(28);
  pdf.text(mbtiType, pageWidth / 2, yPos + 15, { align: 'center' });
  
  pdf.setTextColor(...textColor);
  pdf.setFontSize(12);
  pdf.text(result.title, pageWidth / 2, yPos + 28, { align: 'center' });
  
  yPos += 45;

  // 説明文
  pdf.setTextColor(...textColor);
  pdf.setFontSize(10);
  const descLines = pdf.splitTextToSize(result.description, contentWidth);
  pdf.text(descLines, margin, yPos);
  yPos += descLines.length * 5 + 8;

  // 強み
  pdf.setFillColor(...primaryColor);
  pdf.rect(margin, yPos, 3, 8, 'F');
  pdf.setTextColor(...textColor);
  pdf.setFontSize(12);
  pdf.text('Strengths', margin + 6, yPos + 6);
  yPos += 12;

  pdf.setFontSize(10);
  result.strengths.forEach((strength, index) => {
    pdf.setFillColor(240, 253, 250);
    const badgeWidth = pdf.getTextWidth(strength) + 8;
    pdf.roundedRect(margin + index * 40, yPos, Math.min(badgeWidth, 38), 8, 2, 2, 'F');
    pdf.setTextColor(...primaryColor);
    pdf.text(strength.substring(0, 6), margin + index * 40 + 4, yPos + 5.5);
  });
  yPos += 15;

  // 向いている職場環境
  pdf.setFillColor(...primaryColor);
  pdf.rect(margin, yPos, 3, 8, 'F');
  pdf.setTextColor(...textColor);
  pdf.setFontSize(12);
  pdf.text('Ideal Work Environment', margin + 6, yPos + 6);
  yPos += 12;

  pdf.setFontSize(10);
  const workStyleLines = pdf.splitTextToSize(result.workStyle, contentWidth);
  pdf.text(workStyleLines, margin, yPos);
  yPos += workStyleLines.length * 5 + 10;

  // スコア分析
  pdf.setFillColor(...primaryColor);
  pdf.rect(margin, yPos, 3, 8, 'F');
  pdf.setTextColor(...textColor);
  pdf.setFontSize(12);
  pdf.text('Personality Balance Analysis', margin + 6, yPos + 6);
  yPos += 15;

  const drawBalanceBar = (label1: string, label2: string, balance: number, y: number) => {
    pdf.setFontSize(9);
    pdf.setTextColor(...lightGray);
    pdf.text(label1, margin, y + 3);
    pdf.text(label2, pageWidth - margin, y + 3, { align: 'right' });
    
    const barWidth = contentWidth - 30;
    const barX = margin + 15;
    
    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(barX, y, barWidth, 5, 2, 2, 'F');
    
    pdf.setFillColor(...primaryColor);
    pdf.roundedRect(barX, y, barWidth * (balance / 100), 5, 2, 2, 'F');
    
    pdf.setTextColor(...textColor);
    pdf.setFontSize(8);
    pdf.text(`${balance}%`, barX + barWidth / 2, y + 3.5, { align: 'center' });
  };

  const eiBalance = calcBalance(scores.E, scores.I);
  const snBalance = calcBalance(scores.S, scores.N);
  const tfBalance = calcBalance(scores.T, scores.F);
  const jpBalance = calcBalance(scores.J, scores.P);

  drawBalanceBar('E(Extrovert)', 'I(Introvert)', eiBalance, yPos);
  yPos += 10;
  drawBalanceBar('S(Sensing)', 'N(Intuition)', snBalance, yPos);
  yPos += 10;
  drawBalanceBar('T(Thinking)', 'F(Feeling)', tfBalance, yPos);
  yPos += 10;
  drawBalanceBar('J(Judging)', 'P(Perceiving)', jpBalance, yPos);
  yPos += 18;

  // AIアドバイス
  if (aiAdvice) {
    if (yPos > pageHeight - 80) {
      pdf.addPage();
      yPos = margin;
    }

    pdf.setFillColor(...primaryColor);
    pdf.rect(margin, yPos, 3, 8, 'F');
    pdf.setTextColor(...textColor);
    pdf.setFontSize(12);
    pdf.text('AI Career Advice', margin + 6, yPos + 6);
    yPos += 15;

    // キャリアアドバイス
    pdf.setFontSize(10);
    pdf.setTextColor(...primaryColor);
    pdf.text('Career Development', margin, yPos);
    yPos += 6;
    
    pdf.setTextColor(...textColor);
    pdf.setFontSize(9);
    const careerText = aiAdvice.careerAdvice.length > 400 
      ? aiAdvice.careerAdvice.substring(0, 400) + '...' 
      : aiAdvice.careerAdvice;
    const careerLines = pdf.splitTextToSize(careerText, contentWidth);
    pdf.text(careerLines, margin, yPos);
    yPos += careerLines.length * 4.5 + 8;

    if (yPos > pageHeight - 60) {
      pdf.addPage();
      yPos = margin;
    }

    // ストレス管理
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(10);
    pdf.text('Stress Management', margin, yPos);
    yPos += 6;
    
    pdf.setTextColor(...textColor);
    pdf.setFontSize(9);
    const stressText = aiAdvice.stressManagement.length > 400 
      ? aiAdvice.stressManagement.substring(0, 400) + '...' 
      : aiAdvice.stressManagement;
    const stressLines = pdf.splitTextToSize(stressText, contentWidth);
    pdf.text(stressLines, margin, yPos);
    yPos += stressLines.length * 4.5 + 8;

    if (yPos > pageHeight - 60) {
      pdf.addPage();
      yPos = margin;
    }

    // チーム連携
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(10);
    pdf.text('Team Collaboration', margin, yPos);
    yPos += 6;
    
    pdf.setTextColor(...textColor);
    pdf.setFontSize(9);
    const teamText = aiAdvice.teamCompatibility.length > 400 
      ? aiAdvice.teamCompatibility.substring(0, 400) + '...' 
      : aiAdvice.teamCompatibility;
    const teamLines = pdf.splitTextToSize(teamText, contentWidth);
    pdf.text(teamLines, margin, yPos);
  }

  // フッター
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(...lightGray);
    pdf.text(
      `${i} / ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    pdf.text('Nurse Career Diagnosis AI', pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const fileName = `NurseCareer_${mbtiType}_${dateStr.replace(/\//g, '')}.pdf`;
  pdf.save(fileName);
}

/**
 * PDFをBlobとして生成（プレビュー用）
 */
export async function generateMBTIPDFBlob(options: PDFGeneratorOptions): Promise<Blob> {
  const { mbtiType, result } = options;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const primaryColor: [number, number, number] = [20, 184, 166];

  // シンプルなプレビュー版
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 45, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text('Nurse Career Diagnosis AI', pageWidth / 2, 18, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.text(`${mbtiType} - ${result.title}`, pageWidth / 2, 32, { align: 'center' });

  return pdf.output('blob');
}
