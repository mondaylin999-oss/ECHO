import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// The Apollo Hasselblad Data Camera has no free 3D scan, so ECHO builds it from reference photos: silver body, rear film magazine, ribbed Biogon lens, battery grip.
export function buildHasselblad():THREE.Object3D{
  const g=new THREE.Group();
  const silver=new THREE.MeshStandardMaterial({color:0xd2d6db,metalness:.92,roughness:.3}), dark=new THREE.MeshStandardMaterial({color:0x15171a,metalness:.35,roughness:.5}), rubber=new THREE.MeshStandardMaterial({color:0x0c0d0f,metalness:.1,roughness:.85}), tag=new THREE.MeshStandardMaterial({color:0xe9791f,metalness:.1,roughness:.6});
  const glass=new THREE.MeshPhysicalMaterial({color:0x1b2a44,metalness:0,roughness:.04,clearcoat:1,clearcoatRoughness:.05,transmission:0,reflectivity:.9});
  const add=(geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); g.add(m); return m; };
  add(new RoundedBoxGeometry(1.7,1.55,1.5,6,.1),silver,0,0,0);                       // camera body
  add(new RoundedBoxGeometry(1.85,1.8,1.65,6,.12),silver,0,.05,-1.55);             // 70 mm film magazine
  add(new THREE.BoxGeometry(.9,.5,.02),dark,0,.15,-2.39);                          // magazine back plate
  add(new THREE.BoxGeometry(.02,.5,.7),tag,.93,.25,-1.55);                         // orange settings label
  add(new RoundedBoxGeometry(1.35,.5,1.3,4,.08),silver,0,-1.0,-.05);               // battery / drive grip
  add(new THREE.BoxGeometry(.5,.14,.45),dark,0,.85,-.05);                          // top cap
  const dial=add(new THREE.CylinderGeometry(.24,.24,.1,32),dark,-.88,.35,.1); dial.rotation.z=Math.PI/2;       // ISO dial
  const knob=add(new THREE.CylinderGeometry(.13,.13,.1,24),dark,-.88,-.1,.1); knob.rotation.z=Math.PI/2;
  const conn=add(new THREE.CylinderGeometry(.16,.16,.22,24),dark,-.55,-1.0,.62); conn.rotation.x=Math.PI/2;   // power connector
  const ring=add(new THREE.TorusGeometry(.13,.03,12,24),new THREE.MeshStandardMaterial({color:0x3a6ea5,metalness:.6,roughness:.4}),-.55,-1.0,.74);
  // lens: mount, ribbed barrel, front ring and glass, built along +Z
  const lens=new THREE.Group(); lens.position.set(0,.02,.75); lens.rotation.x=Math.PI/2; g.add(lens);
  const cyl=(r:number,h:number,mat:THREE.Material,y:number)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,48),mat); m.position.y=y; lens.add(m); return m; };
  cyl(.66,.18,silver,.09); cyl(.58,.5,dark,.43);
  for(let k=0;k<7;k++){ const r=new THREE.Mesh(new THREE.TorusGeometry(.6,.025,8,48),rubber); r.rotation.x=Math.PI/2; r.position.y=.2+k*.07; lens.add(r); }
  cyl(.56,.3,rubber,.82); cyl(.5,.12,silver,1.03); cyl(.44,.04,dark,1.1);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(.4,48),glass); disc.rotation.x=-Math.PI/2; disc.position.y=1.125; lens.add(disc);
  return g;
}
