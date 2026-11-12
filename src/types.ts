export interface TeacherUser {
  id: string;
  email: string;
  name: string;
  role: string;
  school: string;
  created_at: string;
}

export interface TeachingMaterial {
  id: string;
  user_id: string;
  title: string;
  category: string;
  phase: string;
  grade?: string;
  subject: string;
  topic: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export type PhaseType = 'all' | 'sd' | 'smp' | 'sma';

export interface ComponentItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  phase: 'all' | 'sd' | 'smp' | 'sma';
  phaseLabel: string;
  badgeBg: string;
  badgeText: string;
  colorClass: string;
}

export interface GeneratorParams {
  category: string;
  subject: string;
  phase: string;
  grade: string;
  topic: string;
  duration: string;
  learningModel: string;
  studentCharacteristics: string;
  deepLearningDimensions: string[];
  customNotes: string;
  teacherName: string;
  schoolName: string;
  language?: 'id' | 'en';
}

export interface PromptPosterParams {
  subject: string;
  phase: string;
  grade: string;
  topic: string;
  style: string;
  aspectRatio: string;
  colorTheme: string;
  customNotes: string;
}
