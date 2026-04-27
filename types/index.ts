export interface User {
  uid: string;
  fullName: string;
  age: number;
  email: string;
  totalScore: number;
  role: "patient" | "admin";
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
  logId?: string;
  userId: string;
  scenarioId: string;
  action: 'correct' | 'wrong';
  timestamp: string;
}

export interface Progress {
  progressId: string;
  userId: string;
  completedScenarios: string[];
  totalScore: number;
}
