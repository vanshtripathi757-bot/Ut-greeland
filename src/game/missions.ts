/**
 * Story mission definitions and deterministic progress helpers.
 * Kept independent from Three.js so objectives can be tested on mobile/CI.
 */

export type MissionObjectiveType = 'enter_zone' | 'interact' | 'collect' | 'reach';

export interface MissionObjective {
  id: string;
  type: MissionObjectiveType;
  target: string;
  description: string;
  required: number;
}

export interface StoryMission {
  id: string;
  title: string;
  chapter: string;
  description: string;
  objectives: MissionObjective[];
}

export interface ObjectiveProgress {
  objectiveId: string;
  current: number;
  completed: boolean;
}

export interface MissionProgress {
  missionId: string;
  objectives: ObjectiveProgress[];
  completed: boolean;
}

export interface MissionEvent {
  type: MissionObjectiveType;
  target: string;
  amount?: number;
}

export const STORY_MISSIONS: StoryMission[] = [
  {
    id: 'first-day',
    title: 'A New Morning',
    chapter: 'Chapter 1 · First Day',
    description: 'Your first morning at Aoyama Academy. Find your way around campus.',
    objectives: [
      {
        id: 'reach-main-hall',
        type: 'reach',
        target: 'Aoyama Main Hall Portico & Steps',
        description: 'Visit the Main Academy Hall',
        required: 1,
      },
      {
        id: 'visit-plaza',
        type: 'enter_zone',
        target: 'Central Stone Lantern Plaza',
        description: 'Explore the Central Plaza',
        required: 1,
      },
      {
        id: 'find-gate',
        type: 'reach',
        target: 'Main Entrance Gate · South Approach',
        description: 'Return to the South Entrance Gate',
        required: 1,
      },
    ],
  },
];

export function createMissionProgress(mission: StoryMission): MissionProgress {
  return {
    missionId: mission.id,
    objectives: mission.objectives.map((objective) => ({
      objectiveId: objective.id,
      current: 0,
      completed: false,
    })),
    completed: false,
  };
}

/**
 * Applies one gameplay event. Progress is capped at the objective requirement;
 * unrelated events and already-completed objectives are ignored.
 */
export function applyMissionEvent(
  mission: StoryMission,
  progress: MissionProgress,
  event: MissionEvent
): MissionProgress {
  if (progress.missionId !== mission.id || progress.completed) return progress;

  const objectives = progress.objectives.map((item) => {
    const definition = mission.objectives.find((objective) => objective.id === item.objectiveId);
    if (
      !definition ||
      item.completed ||
      definition.type !== event.type ||
      definition.target !== event.target
    ) {
      return item;
    }

    const amount = Math.max(1, Math.floor(event.amount ?? 1));
    const current = Math.min(definition.required, item.current + amount);
    return {
      ...item,
      current,
      completed: current >= definition.required,
    };
  });

  return {
    missionId: progress.missionId,
    objectives,
    completed: objectives.length > 0 && objectives.every((item) => item.completed),
  };
}

export function getMissionCompletionPercent(progress: MissionProgress): number {
  if (progress.objectives.length === 0) return 0;
  const completed = progress.objectives.filter((item) => item.completed).length;
  return Math.round((completed / progress.objectives.length) * 100);
}
