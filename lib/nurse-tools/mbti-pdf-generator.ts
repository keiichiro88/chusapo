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
 * HTMLエレメントをキャプチャしてPDFとして保存（日本語対応版）
 * html2canvasで画像化することで日本語を正しく表示
 */
export async function generateMBTIPDFFromElement(
  element: HTMLElement,
  options: PDFGeneratorOptions
): Promise<void> {
  const { mbtiType, diagnosisDate } = options;
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
  const headerHeight = 20;
  const footerHeight = 10;
  const contentTop = headerHeight + 5;
  const maxContentHeight = pageHeight - contentTop - footerHeight;

  // カラー定義
  const primaryColor: [number, number, number] = [20, 184, 166];
  const lightGray: [number, number, number] = [148, 163, 184];

  // ヘッダーを描画
  const drawHeader = () => {
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text('Nurse Career Diagnosis AI', pageWidth / 2, 9, { align: 'center' });
    pdf.setFontSize(9);
    pdf.text(`${mbtiType} | ${dateStr}`, pageWidth / 2, 16, { align: 'center' });
  };

  // フッターを描画
  const drawFooter = (pageNum: number, totalPages: number) => {
    pdf.setFontSize(8);
    pdf.setTextColor(...lightGray);
    pdf.text(`${pageNum} / ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
  };

  const captureOptions: Parameters<typeof html2canvas>[1] = {
    backgroundColor: '#ffffff',
    scale: 2, // 高解像度
    useCORS: true,
    logging: false,
    ignoreElements: (el) => el.hasAttribute('data-html2canvas-ignore'),
    // アニメーション/トランジションの影響を抑えて安定したキャプチャにする
    onclone: (doc) => {
      const style = doc.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
        }
      `;
      doc.head.appendChild(style);
    },
  };

  // ブロック単位でキャプチャして、グラフなどがページの途中で切れないように配置
  try {
    const rawBlocks = Array.from(element.querySelectorAll('[data-pdf-block]')) as HTMLElement[];
    // ネストした data-pdf-block は除外して「トップレベルのブロック」だけにする
    const blocks = rawBlocks.filter((el) => {
      const parentBlock = el.parentElement?.closest('[data-pdf-block]');
      return !parentBlock;
    });
    const targets = blocks.length > 0 ? blocks : [element];

    const blockGapMm = 6;
    let yCursorMm = 0;

    const startNewPage = () => {
      pdf.addPage();
      drawHeader();
      yCursorMm = 0;
    };

    // 1ページ目
    drawHeader();

    for (const targetEl of targets) {
      const canvas = await html2canvas(targetEl, captureOptions);
      const mmPerPx = contentWidth / canvas.width;
      const heightMm = canvas.height * mmPerPx;

      // 1ページに収まるブロックは丸ごと配置（収まらない場合は次ページへ）
      if (heightMm <= maxContentHeight) {
        if (yCursorMm > 0 && yCursorMm + heightMm > maxContentHeight) {
          startNewPage();
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', margin, contentTop + yCursorMm, contentWidth, heightMm);
        yCursorMm += heightMm + blockGapMm;
        continue;
      }

      // 大きすぎるブロックはページ内でスライス（やむを得ないケース）
      if (yCursorMm > 0) startNewPage();

      const sliceHeightPx = Math.max(1, Math.floor(maxContentHeight / mmPerPx));
      let renderedPx = 0;
      let lastSliceHeightMm = 0;

      while (renderedPx < canvas.height) {
        const remainingPx = canvas.height - renderedPx;
        const currentSlicePx = Math.min(sliceHeightPx, remainingPx);

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = currentSlicePx;
        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
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

        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.92);
        lastSliceHeightMm = currentSlicePx * mmPerPx;
        pdf.addImage(imgData, 'JPEG', margin, contentTop, contentWidth, lastSliceHeightMm);

        renderedPx += currentSlicePx;
        if (renderedPx < canvas.height) {
          startNewPage();
        }
      }

      // 最後のページに余白があれば続けて配置できるよう、カーソルを更新
      yCursorMm = lastSliceHeightMm + blockGapMm;
    }

    // フッター（ページ数が確定してから付与）
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      drawFooter(i, totalPages);
    }

  } catch (error) {
    console.error('Failed to capture element:', error);
    // フォールバック
    await generateMBTIPDF(options);
    return;
  }

  // PDFをダウンロード
  const fileName = `NurseCareer_${mbtiType}_${dateStr.replace(/\//g, '')}.pdf`;
  pdf.save(fileName);
}

/**
 * データのみからPDFを生成（英語表記版 - フォールバック用）
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
  const footerHeight = 15;
  const maxY = pageHeight - footerHeight;
  let yPos = margin;

  const primaryColor: [number, number, number] = [20, 184, 166];
  const textColor: [number, number, number] = [30, 41, 59];
  const lightGray: [number, number, number] = [148, 163, 184];
  const bgLight: [number, number, number] = [240, 253, 250];

  const addNewPage = () => {
    pdf.addPage();
    yPos = margin;
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(`Nurse Career Diagnosis AI | ${mbtiType}`, pageWidth / 2, 13, { align: 'center' });
    yPos = 30;
  };

  const checkPageBreak = (requiredHeight: number) => {
    if (yPos + requiredHeight > maxY) {
      addNewPage();
    }
  };

  // ヘッダー
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

  // MBTIタイプ
  pdf.setFillColor(...bgLight);
  pdf.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');
  
  pdf.setTextColor(...primaryColor);
  pdf.setFontSize(28);
  pdf.text(mbtiType, pageWidth / 2, yPos + 15, { align: 'center' });
  
  pdf.setTextColor(...textColor);
  pdf.setFontSize(12);
  pdf.text(result.title, pageWidth / 2, yPos + 28, { align: 'center' });
  
  yPos += 45;

  // 説明
  pdf.setTextColor(...textColor);
  pdf.setFontSize(10);
  const descLines = pdf.splitTextToSize(result.description, contentWidth);
  pdf.text(descLines, margin, yPos);
  yPos += descLines.length * 5 + 10;

  // 強み
  checkPageBreak(35);
  pdf.setFillColor(...primaryColor);
  pdf.rect(margin, yPos, 3, 8, 'F');
  pdf.setTextColor(...textColor);
  pdf.setFontSize(12);
  pdf.text('Strengths', margin + 6, yPos + 6);
  yPos += 14;

  pdf.setFontSize(10);
  let xOffset = margin;
  const badgeHeight = 10;
  const badgePadding = 6;
  const badgeMargin = 8;

  result.strengths.forEach((strength) => {
    const textWidth = pdf.getTextWidth(strength);
    const badgeWidth = textWidth + badgePadding * 2;
    
    if (xOffset + badgeWidth > pageWidth - margin) {
      xOffset = margin;
      yPos += badgeHeight + 4;
    }
    
    pdf.setFillColor(...bgLight);
    pdf.roundedRect(xOffset, yPos, badgeWidth, badgeHeight, 2, 2, 'F');
    pdf.setTextColor(...primaryColor);
    pdf.text(strength, xOffset + badgePadding, yPos + 7);
    
    xOffset += badgeWidth + badgeMargin;
  });
  yPos += badgeHeight + 12;

  // 職場環境
  checkPageBreak(40);
  pdf.setFillColor(...primaryColor);
  pdf.rect(margin, yPos, 3, 8, 'F');
  pdf.setTextColor(...textColor);
  pdf.setFontSize(12);
  pdf.text('Ideal Work Environment', margin + 6, yPos + 6);
  yPos += 14;

  pdf.setFontSize(10);
  const workStyleLines = pdf.splitTextToSize(result.workStyle, contentWidth);
  pdf.text(workStyleLines, margin, yPos);
  yPos += workStyleLines.length * 5 + 12;

  // 性格バランス
  checkPageBreak(70);
  pdf.setFillColor(...primaryColor);
  pdf.rect(margin, yPos, 3, 8, 'F');
  pdf.setTextColor(...textColor);
  pdf.setFontSize(12);
  pdf.text('Personality Balance', margin + 6, yPos + 6);
  yPos += 18;

  const drawBalanceBar = (label1: string, label2: string, balance: number, y: number) => {
    const labelWidth = 35;
    const barX = margin + labelWidth + 5;
    const barWidth = contentWidth - labelWidth * 2 - 10;
    const barHeight = 8;
    
    pdf.setFontSize(9);
    pdf.setTextColor(...textColor);
    pdf.text(label1, margin, y + 6);
    pdf.text(label2, pageWidth - margin, y + 6, { align: 'right' });
    
    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(barX, y, barWidth, barHeight, 2, 2, 'F');
    
    const filledWidth = barWidth * (balance / 100);
    if (filledWidth > 0) {
      pdf.setFillColor(...primaryColor);
      pdf.roundedRect(barX, y, filledWidth, barHeight, 2, 2, 'F');
    }
    
    pdf.setFontSize(8);
    const percentText = `${balance}%`;
    if (filledWidth < 25) {
      pdf.setTextColor(...textColor);
      pdf.text(percentText, barX + filledWidth + 3, y + 5.5);
    } else {
      pdf.setTextColor(255, 255, 255);
      pdf.text(percentText, barX + filledWidth / 2, y + 5.5, { align: 'center' });
    }
  };

  const eiBalance = calcBalance(scores.E, scores.I);
  const snBalance = calcBalance(scores.S, scores.N);
  const tfBalance = calcBalance(scores.T, scores.F);
  const jpBalance = calcBalance(scores.J, scores.P);

  drawBalanceBar('E (Extrovert)', 'I (Introvert)', eiBalance, yPos);
  yPos += 14;
  drawBalanceBar('S (Sensing)', 'N (Intuition)', snBalance, yPos);
  yPos += 14;
  drawBalanceBar('T (Thinking)', 'F (Feeling)', tfBalance, yPos);
  yPos += 14;
  drawBalanceBar('J (Judging)', 'P (Perceiving)', jpBalance, yPos);
  yPos += 20;

  // AIアドバイス
  if (aiAdvice) {
    addNewPage();
    
    pdf.setFillColor(...primaryColor);
    pdf.rect(margin, yPos, 3, 8, 'F');
    pdf.setTextColor(...textColor);
    pdf.setFontSize(14);
    pdf.text('AI Career Advice', margin + 6, yPos + 6);
    yPos += 18;

    pdf.setFontSize(11);
    pdf.setTextColor(...primaryColor);
    pdf.text('Career Development', margin, yPos);
    yPos += 8;
    
    pdf.setTextColor(...textColor);
    pdf.setFontSize(9);
    const careerLines = pdf.splitTextToSize(aiAdvice.careerAdvice, contentWidth);
    
    for (const line of careerLines) {
      checkPageBreak(6);
      pdf.text(line, margin, yPos);
      yPos += 5;
    }
    yPos += 10;

    checkPageBreak(30);
    pdf.setFontSize(11);
    pdf.setTextColor(...primaryColor);
    pdf.text('Stress Management', margin, yPos);
    yPos += 8;
    
    pdf.setTextColor(...textColor);
    pdf.setFontSize(9);
    const stressLines = pdf.splitTextToSize(aiAdvice.stressManagement, contentWidth);
    
    for (const line of stressLines) {
      checkPageBreak(6);
      pdf.text(line, margin, yPos);
      yPos += 5;
    }
    yPos += 10;

    checkPageBreak(30);
    pdf.setFontSize(11);
    pdf.setTextColor(...primaryColor);
    pdf.text('Team Collaboration', margin, yPos);
    yPos += 8;
    
    pdf.setTextColor(...textColor);
    pdf.setFontSize(9);
    const teamLines = pdf.splitTextToSize(aiAdvice.teamCompatibility, contentWidth);
    
    for (const line of teamLines) {
      checkPageBreak(6);
      pdf.text(line, margin, yPos);
      yPos += 5;
    }
  }

  // フッター
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(...lightGray);
    pdf.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
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

  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 45, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text('Nurse Career Diagnosis AI', pageWidth / 2, 18, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.text(`${mbtiType} - ${result.title}`, pageWidth / 2, 32, { align: 'center' });

  return pdf.output('blob');
}
