import * as THREE from "three";
import { InputManager } from "./InputManager";
import { LevelLoader } from "./LevelLoader";
import { HUD } from "./HUD";
import { MarbleController } from "./MarbleController";
import { GoalPad } from "./GoalPad";
import { Gem } from "./Gem";
import { Hazard } from "./Hazard";
import { Level } from "./Level";

export class Game {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  private renderer = new THREE.WebGLRenderer({ antialias: true });
  private input = new InputManager();
  private hud = new HUD();
  private clock = new THREE.Clock();

  private level!: Level;
  private marble!: MarbleController;
  private goal!: GoalPad;
  private gems: Gem[] = [];
  private hazards: Hazard[] = [];
  private totalGems = 0;

  constructor(private root: HTMLElement) {
    this.scene.background = new THREE.Color(0x9ec5ff);
    this.scene.fog = new THREE.Fog(0x9ec5ff, 18, 80);

    this.camera.position.set(0, 8, 12);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.root.appendChild(this.renderer.domElement);
    this.addLights();
  }

  async start() {
    const loader = new LevelLoader();
    this.level = await loader.loadLevel("/data/levels/demo-level.json");
    this.buildLevel(this.level);
    this.hud.setGems(0, this.totalGems);
    this.hud.setStatus("Ready");

    this.renderer.setAnimationLoop(() => {
      const delta = Math.min(this.clock.getDelta(), 0.033);
      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    });
  }

  private addLights() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 1.5);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(12, 18, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(sun);
  }

  private buildLevel(level: Level) {
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(level.size.x, 1, level.size.z),
      new THREE.MeshStandardMaterial({ color: 0x2f6f3e })
    );
    ground.position.set(0, -0.5, 0);
    ground.receiveShadow = true;
    this.scene.add(ground);

    for (const entity of level.entities) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(entity.size.x, entity.size.y, entity.size.z),
        new THREE.MeshStandardMaterial({ color: entity.color ?? 0x6b4a3d })
      );
      mesh.position.set(entity.position.x, entity.position.y, entity.position.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    }

    this.marble = new MarbleController(this.scene, new THREE.Vector3(level.spawn.x, level.spawn.y, level.spawn.z));
    this.goal = new GoalPad(this.scene, level.goalPosition);

    this.gems = level.gems.map((gemDef) => new Gem(this.scene, gemDef.position));
    this.hazards = level.hazards.map((hazard) => new Hazard(this.scene, hazard));

    this.totalGems = this.gems.length;
  }

  private update(delta: number) {
    const moveLeft = this.input.isPressed("left");
    const moveRight = this.input.isPressed("right");
    const jump = this.input.isPressed("jump");

    this.marble.update({
      left: moveLeft,
      right: moveRight,
      jump,
      delta
    });

    for (const gem of this.gems) {
      gem.update(delta);
      if (gem.isCollectedBy(this.marble.position)) {
        gem.collect();
      }
    }

    const collected = this.gems.filter((gem) => gem.isCollected).length;
    this.hud.setGems(collected, this.totalGems);

    for (const hazard of this.hazards) {
      if (hazard.isTouching(this.marble.position)) {
        this.marble.reset(new THREE.Vector3(this.level.spawn.x, this.level.spawn.y, this.level.spawn.z));
        this.hud.setStatus("Oops!");
        setTimeout(() => this.hud.setStatus("Ready"), 500);
        return;
      }
    }

    if (this.goal.isReachedBy(this.marble.position)) {
      this.goal.activate();
      this.hud.setStatus(collected >= this.totalGems ? "Level complete" : "Goal reached");
    } else {
      this.hud.setStatus(collected >= this.totalGems ? "Goal ready" : "Collect gems");
    }

    this.camera.position.x += (this.marble.position.x - this.camera.position.x) * 0.08;
    this.camera.position.z += (this.marble.position.z + 9 - this.camera.position.z) * 0.08;
    this.camera.position.y += (this.marble.position.y + 4.5 - this.camera.position.y) * 0.08;
    this.camera.lookAt(this.marble.position.x, this.marble.position.y, this.marble.position.z);
  }
}
