import * as THREE from "three";

export class Gem {
  private mesh: THREE.Mesh;
  private collected = false;
  private spin = 0;

  constructor(scene: THREE.Scene, position: { x: number; y: number; z: number }) {
    this.mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      new THREE.MeshStandardMaterial({
        color: 0xffd54a,
        emissive: 0x664400,
        emissiveIntensity: 0.7
      })
    );

    this.mesh.position.set(position.x, position.y + 1.2, position.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  }

  update(delta: number) {
    if (this.collected) return;

    this.spin += delta * 2.4;
    this.mesh.rotation.y = this.spin;
    this.mesh.position.y += Math.sin(this.spin * 2) * 0.007;
  }

  isCollectedBy(position: THREE.Vector3) {
    if (this.collected) return false;
    return position.distanceTo(this.mesh.position) < 1.2;
  }

  collect() {
    if (this.collected) return;
    this.collected = true;
    this.mesh.visible = false;
  }

  get isCollected() {
    return this.collected;
  }
}
