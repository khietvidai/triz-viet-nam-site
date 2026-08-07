
export interface TrizStepData {
  input: string;
  output: string;
}

export interface TrizState {
  currentStep: number;
  situation: string;
  goal: string;
  problemStatement: string;
  contradiction: string;
  principle: string;
  solution: string;
  evaluation: string;
}

export const STEPS = [
  { title: "Situation", description: "Describe the current situation." },
  { title: "Goal Analysis", description: "Analyze the goal to be achieved." },
  { title: "Problem Statement", description: "Formulate the problem clearly." },
  { title: "Contradiction", description: "Identify the technical or physical contradiction." },
  { title: "Principle", description: "Deduce the TRIZ principle to apply." },
  { title: "Solution", description: "Synthesize a solution based on the principle." },
  { title: "Evaluation", description: "Evaluate the proposed solution." },
];

// Mock Agent Functions
export async function analyzeGoal(situation: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
  return `Based on the situation: "${situation}", the goal is to improve the primary useful function while minimizing harmful effects. We aim to achieve the Ideal Final Result (IFR) where the system performs the function without existing.`;
}

export async function formulateProblem(goal: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `The problem is that while trying to achieve "${goal.substring(0, 50)}...", we encounter a conflict between parameters. We need to define what prevents us from reaching the goal immediately.`;
}

export async function identifyContradiction(problem: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `Contradiction Identified for "${problem.substring(0, 30)}...":
1. If we improve Parameter A, then Parameter B gets worse.
2. If we improve Parameter B, then Parameter A gets worse.
(e.g., Speed vs. Fuel Consumption, Strength vs. Weight)`;
}

export async function deducePrinciple(contradiction: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `Suggested TRIZ Principles for contradiction "${contradiction.substring(0, 20)}...":
1. Principle 1: Segmentation
2. Principle 10: Preliminary Action
3. Principle 19: Periodic Action
4. Principle 35: Parameter Changes`;
}

export async function synthesizeSolution(principle: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `Proposed Solution based on "${principle.substring(0, 20)}...":
Apply the suggested principles to the contradiction.
- Use Segmentation to divide the object into independent parts.
- Use Preliminary Action to prepare the object before the operation.
This leads to a conceptual design where...`;
}

export async function evaluateSolution(solution: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `Evaluation of "${solution.substring(0, 20)}...":
- Feasibility: High
- Cost: Medium
- Innovation Level: 3 (Inside Paradigm)
- Secondary Problems: None identified yet.`;
}
