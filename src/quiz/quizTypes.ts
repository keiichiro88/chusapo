export type QuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id: string;
  /** 問題文 */
  questionText: string;
  /** 選択肢（通常4つ） */
  options: QuizOption[];
  /** 解説（必須） */
  explanation: string;
};

export type QuizLesson = {
  id: string;
  title: string;
  description?: string;
  /** このLessonの問題群 */
  questions: QuizQuestion[];
  /** 将来の拡張用 */
  requiresPremium?: boolean;
};

// Alias for backward compatibility
export type Lesson = QuizLesson;
