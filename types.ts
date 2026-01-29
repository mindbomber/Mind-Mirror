
export interface Option {
  id: string;
  text: string;
  weight: string; // Describes the narrative direction
}

export interface Question {
  id: string;
  text: string;
  narrativeContext?: string; // Short text to set the scene for this specific question
  options: Option[];
}

export interface UserAnswer {
  questionId: string;
  questionText: string;
  selectedOptionText: string;
  round: number;
}

export interface ArchetypeResult {
  title: string;
  description: string;
  traits: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING_QUESTIONS = 'LOADING_QUESTIONS',
  ANSWERING = 'ANSWERING',
  TRANSITIONING = 'TRANSITIONING',
  ANALYZING = 'ANALYZING',
  REVEALED = 'REVEALED'
}

export const ROUND_THEMES = [
  { 
    id: 1, 
    name: "Chapter I: The Awakening", 
    description: "You find yourself in a place between worlds. How did you arrive, and what do you first seek?"
  },
  { 
    id: 2, 
    name: "Chapter II: The Threshold", 
    description: "The path ahead splits. Guardians watch from the shadows. Will you negotiate, hide, or push through?"
  },
  { 
    id: 3, 
    name: "Chapter III: The Encounter", 
    description: "You meet an entity of pure light and silence. It offers you a gift that comes with a price."
  },
  { 
    id: 4, 
    name: "Chapter IV: The Trial", 
    description: "The environment turns hostile, mirroring your internal conflicts. The way out is through the heart of the storm."
  },
  { 
    id: 5, 
    name: "Chapter V: The Mirror's Edge", 
    description: "You reach the source. The reflection you see is not your face, but your nature. The final choice remains."
  }
];
