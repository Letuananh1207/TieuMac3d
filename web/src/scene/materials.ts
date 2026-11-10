import * as THREE from 'three';

/** Vật liệu Lambert: rẻ nhất trong các vật liệu có ánh sáng, hợp với low-poly trên điện thoại. */
export function lambert(
  color: THREE.ColorRepresentation,
  extra?: THREE.MeshLambertMaterialParameters,
): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color, ...extra });
}
