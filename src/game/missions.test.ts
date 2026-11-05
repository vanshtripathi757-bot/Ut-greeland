import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORY_MISSIONS,
  applyMissionEvent,
  createMissionProgress,
  getMissionCompletionPercent,
} from './missions';

const mission = STORY_MISSIONS[0];

test('new story mission starts with all objectives incomplete', () => {
  const progress = createMissionProgress(mission);
  assert.equal(progress.missionId, 'first-day');
  assert.equal(progress.completed, false);
  assert.equal(progress.objectives.length, 3);
  assert.equal(getMissionCompletionPercent(progress), 0);
});

test('matching reach event completes only its matching objective', () => {
  const start = createMissionProgress(mission);
  const next = applyMissionEvent(start, mission, {
    type: 'reach',
    target: 'Aoyama Main Hall Portico & Steps',
  });
  assert.equal(next.objectives[0].completed, true);
  assert.equal(next.objectives[1].completed, false);
  assert.equal(next.completed, false);
  assert.equal(getMissionCompletionPercent(next), 33);
});

test('wrong event type or target does not change progress', () => {
  const start = createMissionProgress(mission);
  const next = applyMissionEvent(start, mission, {
    type: 'interact',
    target: 'Aoyama Main Hall Portico & Steps',
  });
  assert.deepEqual(next, start);
});

test('mission completes after every objective is fulfilled', () => {
  let progress = createMissionProgress(mission);
  progress = applyMissionEvent(progress, mission, {
    type: 'reach',
    target: 'Aoyama Main Hall Portico & Steps',
  });
  progress = applyMissionEvent(progress, mission, {
    type: 'enter_zone',
    target: 'Central Stone Lantern Plaza',
  });
  progress = applyMissionEvent(progress, mission, {
    type: 'reach',
    target: 'Main Entrance Gate · South Approach',
  });
  assert.equal(progress.completed, true);
  assert.equal(getMissionCompletionPercent(progress), 100);
});

test('completed objective cannot exceed its required count', () => {
  let progress = createMissionProgress(mission);
  progress = applyMissionEvent(progress, mission, {
    type: 'reach',
    target: 'Aoyama Main Hall Portico & Steps',
    amount: 99,
  });
  assert.equal(progress.objectives[0].current, 1);
  assert.equal(progress.objectives[0].completed, true);
});

test('completed mission ignores subsequent events', () => {
  let progress = createMissionProgress(mission);
  for (const objective of mission.objectives) {
    progress = applyMissionEvent(progress, mission, {
      type: objective.type,
      target: objective.target,
    });
  }
  const after = applyMissionEvent(progress, mission, {
    type: 'reach',
    target: 'Aoyama Main Hall Portico & Steps',
  });
  assert.deepEqual(after, progress);
});
