export interface User {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface ScenarioStep {
  text: string;
  isDecisionPoint: boolean;
}

export interface ScenarioDecision {
  id: string;
  label: string;
  scoreImpact: number;
  colorChange?: string; // used for ViroReact liver coloring
}

export interface Scenario {
  id: string; // Document ID in Firestore
  title: string;
  type?: string;
  steps: ScenarioStep[];
  decisions: ScenarioDecision[];
}

export interface SessionLog {
  logId: string;
  userId: string;
  scenarioId: string;
  decisions: string[]; // Array of chosen decision IDs
  score: number;
  duration: number;
  ts: string; // Timestamp
}

export interface Progress {
  progressId: string;
  userId: string;
  completedScenarios: string[];
  totalScore: number;
}
