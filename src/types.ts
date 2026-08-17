
/**
 * Represents a TRIZ parameter from the contradiction matrix.
 */
export interface Parameter {
    /** Unique identifier for the parameter (1-39/48/50 depending on matrix version) */
    ID: number;
    /** Human-readable name of the parameter */
    Name: string;
    /** Detailed description of what this parameter represents */
    Description?: string;
    /** Main keyword associated with the parameter for search/matching */
    Keyword?: string;
    /** Vector embedding for semantic search (optional) */
    Embedding?: number[];
}

/**
 * Result of the contradiction analysis, identifying the conflict pair and suggested principles.
 */
export interface ContradictionResult {
    /** The parameter that describes the quality being improved */
    improvingParameter: Parameter;
    /** The parameter that describes the quality worsening as a result */
    worseningParameter: Parameter;
    /** List of inventive principles suggested by the matrix */
    principles: {
        /** Principle number */
        id: number;
        /** Principle name */
        name: string;
    }[];
}

/**
 * A specific solution concept generated based on TRIZ principles.
 */
export interface Solution {
    /** A short, catchy title for the solution */
    title: string;
    /** Concise description of the solution concept */
    description: string;
    /** The principles used to derive this solution */
    principles: string;
}

/**
 * Evaluation of the generated solutions, highlighting the best one.
 */
export interface Evaluation {
    /** Assessment of technical and practical feasibility */
    feasibility: string;
    /** Impact on the main goal/ideal final result */
    valueContribution: string;
    /** Estimated costs associated with the solution */
    costs: {
        human: string;
        time: string;
        money: string;
    };
    /** Title of the best solution selected */
    bestSolution: string;
    /** Reason why this solution was selected as the best */
    bestSolutionReason: string;
    /** Step-by-step plan to implement the solution */
    implementationPlan: string[];
}

/**
 * Structure for specific goal metrics.
 */
export interface GoalMetrics {
    logistics_cost: string;
    durability: string;
    deployment: string;
    [key: string]: string; // Allow extensibility
}

/**
 * Structured Goal Definition (IFR)
 */
export interface GoalStructure {
    summary: string;
    metrics: GoalMetrics;
    operational_delta: {
        current_state: number[];
        ideal_state: number[];
    };
}

/**
 * Complete state of the TRIZ analysis process.
 */
export interface FullTrizResult {
    /** The original situation translated to English if necessary */
    translatedSituation: string;
    /** The Ideal Final Result (IFR) derived from the situation */
    goal: string | GoalStructure;
    /** Formulated problem statement */
    problem: string;
    /** Identified contradiction and principles (nullable if not yet found) */
    contradiction: ContradictionResult | null;
    /** List of generated solutions */
    solutions: Solution[];
    /** Final evaluation and implementation plan (nullable if not yet done) */
    evaluation: Evaluation | null;
}

/**
 * User-defined constraints for the analysis provided via the UI.
 */
export interface AnalysisConstraints {
    /** 0-100 scale representing available financial resources (Higher = More Budget) */
    budget: number;
    /** 0-100 scale representing time urgency (Higher = More Urgent/Less Time) */
    time: number;
    /** 0-100 scale representing risk tolerance (Higher = More Risky/Experimental) */
    risk: number;
}

/**
 * Dictionary structure for localization
 */
export interface Dictionary {
    common: {
        solveButton: string;
        solving: string;
        commandInput: string;
        systemReady: string;
        executeAnalysis: string;
        inputPlaceholder: string;
        language: string;
        uploadContext: string;
        validation: {
            validating: string;
            invalid: string;
            defaultError: string;
        };
        examples: {
            label: string;
            text: string;
        }[];
    };
    results: {
        title: string;
        analysisReport: string;
        idealFinalResult: string;
        operationalDelta: string;
        technicalConflict: string;
        strategicOptions: string;
        aiRecommendation: string;
        deployStrategy: string;
        implementationPlan: string;
        currentState: string;
        idealState: string;
        improving: string;
        worsening: string;
        vs: string;
        metrics: {
            logisticsCost: string;
            durability: string;
            deployment: string;
            feasibility: string;
            risk: string;
            roi: string;
        };
        chart: {
            costEfficiency: string;
            durability: string;
            speed: string;
            simplicity: string;
        };
        units: {
            days: string;
            percent: string;
            [key: string]: string;
        };
        problemStatement: string;
        contradictionAnalysis: string;
        improvingParameter: string;
        worseningParameter: string;
        suggestedPrinciples: string;
        generatedSolutions: string;
        recommendedSolution: string;
        detailedEvaluation: string;
        valueContribution: string;
        feasibility?: string;
        resourceCosts: string;
        humanResources: string;
        timeInvestment: string;
        financialCost: string;
    };
    landing: {
        badge: string;
        titlePrefix: string;
        titleSuffix: string;
        subtitle: string;
        startButton: string;
        features: {
            systematicTitle: string;
            systematicDesc: string;
            instantTitle: string;
            instantDesc: string;
            innovativeTitle: string;
            innovativeDesc: string;
        };
    };
    constraints: {
        title: string;
        budget: {
            label: string;
            min: string;
            max: string;
        };
        time: {
            label: string;
            min: string;
            max: string;
        };
        risk: {
            label: string;
            min: string;
            max: string;
        };
        ai_note: {
            text: string;
            sub_practical: string;
            sub_radical: string;
        };
    };
    footer: {
        cta: {
            exploreTitle: string;
            exploreDesc: string;
            communityTitle: string;
            communityDesc: string;
            contactTitle: string;
            contactDesc: string;
        };
    };
    secoper?: {
        title: string;
        subtitle: string;
        inputPlaceholder: string;
        parkingLotLabel: string;
        parkingLotPlaceholder: string;
        diagnoseButton: string;
        diagnosing: string;
        examplesLabel: string;
        handoffToTriz: string;
        downloadPdf: string;
        copyMarkdown: string;
        copied: string;
    };
}

/**
 * SECOPER 3.0 Types & Interfaces
 */

export interface SecoperTriage {
    isQualified: boolean;
    triageReason: string;
    isJustDoIt: boolean;
    parkingLotSolutions: string[];
}

export interface SecoperSituation {
    situationStatement: string;
    targetStatement: string;
    guardrailMetric: {
        name: string;
        threshold: string;
        rationale: string;
    };
    shadowMetric?: {
        name: string;
        rationale: string;
    };
    rawGap: string;
    sCurveSanityCheck: {
        status: 'OPTIMIZATION_ALLOWED' | 'S_CURVE_CEILING_REACHED';
        analysis: string;
        recommendation: string;
    };
    isProxyOrFermi: boolean;
}

export interface SecoperEvidenceItem {
    assumption: string;
    falsifier: string;
    evidence: string;
    conclusion: 'TRUE' | 'FALSE' | 'INSUFFICIENT_DATA';
    riskLabel?: string;
}

export interface SecoperEvidence {
    assumptions: SecoperEvidenceItem[];
    metricValidityConclusion: string;
    redTeamReviewSummary: string;
}

export interface SecoperCoreGapCandidate {
    id: string;
    text: string;
    label: 'Symptom' | 'Gap' | 'Contradiction' | 'Cause' | 'Consequence';
    impactScore?: number; // 1-5
    leverageScore?: number; // 1-5
    rank?: number;
    isStrategicBypass?: boolean; // Leverage = 5/5
    isAdministrativeContradictionRejected?: boolean;
}

export interface SecoperCoreGap {
    allCandidates: SecoperCoreGapCandidate[];
    validCandidates: SecoperCoreGapCandidate[];
    dependencyAnalysis: string;
    selectedCoreGap: {
        type: 'Gap' | 'Contradiction';
        statement: string;
        rationale: string;
    };
    parallelBranch?: {
        type: 'STRATEGIC_RESTRUCTURING' | 'INDEPENDENT_CORE_GAP';
        statement: string;
    };
}

export interface SecoperCauseNode {
    id: string;
    name: string;
    parentId?: string;
    impactScore?: number;
    directnessScore?: number;
    isLeaf?: boolean;
    isAlternativeBranch?: boolean;
}

export interface SecoperObstacle {
    causeTree: SecoperCauseNode[];
    leafCauses: {
        cause: string;
        impactScore: number;
        directnessScore: number;
    }[];
    selectedObstacle: string;
    impactRationale: string;
    reinforcingLoopCheck: {
        isReinforcingLoop: boolean;
        analysis: string;
        weakestLink?: string;
    };
    incentiveCheck: {
        hasVestedInterest: boolean;
        cobraEffectAnalysis: string;
        recommendation: string;
    };
}

export interface SecoperPerspective {
    locus: 'INDIVIDUAL' | 'DEPARTMENT' | 'SYSTEM' | 'MARKET';
    authorityLevelNeeded: string;
    keyDecisionMaker: string;
    decisionToChange: string;
    escalationCase?: {
        businessCaseSummary: string;
        defaultToActionNotice: string;
        horizontalHandshakeCoSignDepartment?: string;
    };
    marketHandlingStrategy?: 'ESCALATE' | 'TURN_HARM_INTO_BENEFIT' | 'REDUCE_SCOPE_TO_SUB_SYSTEM';
}

export interface SecoperEssence {
    branchType: 'A_GAP' | 'B_CONTRADICTION';
    statement: string;
    anchorsCheck: {
        isCoreGapMatched: boolean;
        isObstacleMatched: boolean;
        isSituationMatched: boolean;
    };
}

export interface SecoperReframe {
    reframeQuestion: string;
    resourceRadar: {
        emptySpace: string;
        idleTime: string;
        wasteInfo: string;
        physicalDifferential: string;
        turnHarmIntoBenefit: string;
    };
    fiveGoldenGates: {
        noImplicitSolution: boolean;
        isMeasurable: boolean;
        hasAuthority: boolean;
        isUnambiguous: boolean;
        areRealConstraints: boolean;
    };
    gateNotes: string[];
    livingHypothesisNotice: string;
}

export interface FullSecoperResult {
    triage: SecoperTriage;
    situation: SecoperSituation;
    evidence: SecoperEvidence;
    coreGap: SecoperCoreGap;
    obstacle: SecoperObstacle;
    perspective: SecoperPerspective;
    essence: SecoperEssence;
    reframe: SecoperReframe;
}

