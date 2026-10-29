import * as THREE from "three";

export class GoalPad {
  public mesh: THREE.Mesh;
  public active = false;

  constructor(scene: THREE.Scene, position: { x: number; y: number; z: number }) {
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 0.25, 32),
      new THREE.MeshStandardMaterial({
        color: 0x7ef0ff,
        emissive: 0x0d6670
      })
    );

    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  }

  isReachedBy(position: THREE.Vector3) {
    const target = new THREE.Vector3(this.mesh.position.x, this.mesh.position.y + 1, this.mesh.position.z);
    return position.distanceTo(target) < 1.9;
  }

  activate() {
    if (!this.active) {
      this.active = true;
      this.mesh.material = new THREE.MeshStandardMaterial({
        color: 0xb9fff8,
        emissive: 0x5ad5ff
      });
    }
  }
}
