import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialCharacterState,
  createInitialCameraState,
  stepCharacterKinematics,
  stepCameraRig,
  resolveCircleAABBCollisions,
  getCurrentZoneName,
  getGroundHeightAt,
  COURTYARD_COLLIDERS,
} from './rules';

test('initial spawn is on open stone promenade facing North toward Main Academy Hall', () => {
  const state = createInitialCharacterState();
  assert.equal(state.x, 0);
  assert.equal(state.z, 22);
  assert.equal(state.yaw, 0);
  assert.equal(state.grounded, true);

  const collision = resolveCircleAABBCollisions(state.x, state.z, 0.42, COURTYARD_COLLIDERS);
  assert.equal(collision.hit, false);
  assert.equal(getCurrentZoneName(state.x, state.z), 'Sakura Stone Promenade');
});

test('forward walk and sprint advance character North (-Z) and update gait & stamina', () => {
  let state = createInitialCharacterState();
  // Walk forward for 10 frames
  for (let i = 0; i < 10; i++) {
    state = stepCharacterKinematics(
      state,
      {
        moveX: 0,
        moveZ: -1,
        sprintHeld: false,
        jumpJustPressed: false,
        jumpHeld: false,
        cameraYaw: 0,
      },
      0.03
    );
  }
  assert.equal(state.gait, 'walk');
  assert.ok(state.z < 22, 'character moved north along -Z');
  assert.equal(state.stamina, 100);

  // Now sprint forward
  for (let i = 0; i < 15; i++) {
    state = stepCharacterKinematics(
      state,
      {
        moveX: 0,
        moveZ: -1,
        sprintHeld: true,
        jumpJustPressed: false,
        jumpHeld: false,
        cameraYaw: 0,
      },
      0.03
    );
  }
  assert.equal(state.gait, 'run');
  assert.ok(state.speed > 5.2, 'sprint speed exceeds walk threshold');
  assert.ok(state.stamina < 100, 'stamina drains while sprinting');
});

test('jump buffering and gravity arc lift and land character cleanly', () => {
  let state = createInitialCharacterState();
  state = stepCharacterKinematics(
    state,
    {
      moveX: 0,
      moveZ: 0,
      sprintHeld: false,
      jumpJustPressed: true,
      jumpHeld: true,
      cameraYaw: 0,
    },
    0.02
  );
  assert.equal(state.grounded, false);
  assert.equal(state.gait, 'jump');
  assert.ok(state.y > 0, 'character ascended off ground');

  // Step until landed
  for (let i = 0; i < 45; i++) {
    state = stepCharacterKinematics(
      state,
      {
        moveX: 0,
        moveZ: 0,
        sprintHeld: false,
        jumpJustPressed: false,
        jumpHeld: false,
        cameraYaw: 0,
      },
      0.03
    );
  }
  assert.equal(state.grounded, true);
  assert.equal(state.y, 0);
});

test('AABB collision resolver prevents walking inside Central Plaza Planter', () => {
  // Central planter is [-2.8, 2.8] on X and Z
  const res = resolveCircleAABBCollisions(0, 2.7, 0.42, COURTYARD_COLLIDERS);
  assert.equal(res.hit, true);
  assert.ok(res.z >= 2.8 + 0.41, `pushed outside planter Z boundary: got ${res.z}`);
});

test('camera rig smoothly switches between third-person and first-person perspectives', () => {
  const charState = createInitialCharacterState();
  let cam = createInitialCameraState();

  cam = stepCameraRig(cam, charState, 0.1, 0.05, 0, 0.03);
  assert.equal(cam.mode, 'third_person');
  assert.ok(cam.currentZ > charState.z, 'third-person camera trails behind player');

  cam.mode = 'first_person';
  for (let i = 0; i < 20; i++) {
    cam = stepCameraRig(cam, charState, 0, 0, 0, 0.03);
  }
  assert.ok(Math.abs(cam.currentX - charState.x) < 0.25);
  assert.ok(Math.abs(cam.currentY - 1.54) < 0.1);
  assert.ok(cam.lookAtZ < cam.currentZ, 'first-person camera looks forward along -Z');
});

test('academy entrance stair profile rises in five walkable steps', () => {
  assert.equal(getGroundHeightAt(0, -13.5), 0);
  assert.equal(getGroundHeightAt(0, -14.3), 0.16);
  assert.equal(getGroundHeightAt(0, -14.9), 0.32);
  assert.equal(getGroundHeightAt(0, -15.5), 0.48);
  assert.equal(getGroundHeightAt(0, -16.0), 0.64);
  assert.equal(getGroundHeightAt(0, -16.6), 0.8);
  assert.equal(getGroundHeightAt(5, -16.6), 0);
});

test('player can walk up the academy entrance steps without jumping', () => {
  let state = createInitialCharacterState();
  state.x = 0;
  state.z = -13.5;
  for (let i = 0; i < 45; i++) {
    state = stepCharacterKinematics(state, {
      moveX: 0,
      moveZ: -1,
      sprintHeld: false,
      jumpJustPressed: false,
      jumpHeld: false,
      cameraYaw: 0,
    }, 0.03);
  }
  assert.ok(state.z < -16.0, `player reached the upper steps: z=${state.z}`);
  assert.equal(state.y, getGroundHeightAt(state.x, state.z));
  assert.ok(state.y >= 0.64, `player climbed the stair profile: y=${state.y}`);
});

test('entrance door has a dedicated collision that can be removed after opening', () => {
  const door = COURTYARD_COLLIDERS.find((collider) => collider.label === 'Academy Entrance Door');
  assert.ok(door);
  assert.ok(door.minZ < door.maxZ);
});
