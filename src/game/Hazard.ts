import * as THREE from "three";

export class Hazard {
  public mesh: THREE.Mesh;

  constructor(scene: THREE.Scene, data: { x: number; y: number; z: number; radius: number }) {
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius, 18, 18),
      new THREE.MeshStandardMaterial({
        color: 0xff5f5f,
        emissive: 0x3f0707,
        emissiveIntensity: 0.7
      })
    );

    this.mesh.position.set(data.x, data.y, data.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  }

  isTouching(position: THREE.Vector3) {
    const dist = position.distanceTo(this.mesh.position);
    return dist < 1.4 + this.mesh.geometry.parameters.radius * 0.9;
  }
}
