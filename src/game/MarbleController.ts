import * as THREE from "three";

export class MarbleController {
  public position: THREE.Vector3;
  public mesh: THREE.Mesh;
  private velocity = new THREE.Vector3();
  private grounded = true;

  constructor(scene: THREE.Scene, start: THREE.Vector3) {
    this.position = start.clone();
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xf7d358,
        metalness: 0.35,
        roughness: 0.25
      })
    );

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  update(params: {
    left: boolean;
    right: boolean;
    jump: boolean;
    delta: number;
  }) {
    const { left, right, jump, delta } = params;
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);

    this.velocity.x += moveX * 8.0 * delta;
    this.velocity.x *= 0.88;
    this.velocity.y -= 21 * delta;

    if (jump && this.grounded) {
      this.velocity.y = 9.8;
      this.grounded = false;
    }

    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += 0;

    if (this.position.y <= 1.0) {
      this.position.y = 1.0;
      this.velocity.y = 0;
      this.grounded = true;
    }

    this.position.x = THREE.MathUtils.clamp(this.position.x, -18, 18);
    this.position.z = THREE.MathUtils.clamp(this.position.z, -18, 18);

    this.mesh.position.copy(this.position);
  }

  reset(position: THREE.Vector3) {
    this.position.copy(position);
    this.velocity.set(0, 0, 0);
    this.grounded = true;
    this.mesh.position.copy(this.position);
  }
}
