"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Capsule } from "@react-three/drei";
import * as THREE from "three";

export default function ReplayScene({ slow = false }: { slow?: boolean }) {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [6, 4, 8], fov: 55 }} gl={{ alpha: true }}>
        {/* Brighter base lighting so models are clearly visible */}
        <ambientLight intensity={0.6} />
        <hemisphereLight intensity={0.6} groundColor={new THREE.Color('#404040')} />
        <spotLight position={[8, 10, 6]} intensity={1.4} angle={0.35} penumbra={0.5} castShadow />

        {/* Arena ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>

        <ArenaFight slow={slow} />

        {/* Locked camera feel; allow only slight orbit when debugging */}
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>

      {/* Subtle scanlines to keep surveillance feel but not obscure visibility */}
      <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 2px, rgba(255,255,255,.06) 2px 3px)" }} />
    </div>
  );
}

function ArenaFight({ slow }: { slow: boolean }) {
  const root = useRef<THREE.Group>(null);
  const robot = useRef<THREE.Group>(null);
  const scav = useRef<THREE.Group>(null);
  const proj = useRef<THREE.Mesh>(null);
  const projR = useRef<THREE.Mesh>(null);
  const projLife = useRef(0);
  const projRLife = useRef(0);
  const shake = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime() * (slow ? 0.4 : 1);

    // Camera shake decay
    shake.current = Math.max(0, shake.current - delta * 2);
    if (root.current) {
      root.current.position.x = (Math.random() - 0.5) * 0.03 * shake.current;
      root.current.position.y = (Math.random() - 0.5) * 0.03 * shake.current;
    }

    // Robot jab/parry + occasional gun fire
    if (robot.current) {
      const arm = robot.current.getObjectByName('rArm');
      if (arm && arm instanceof THREE.Group) (arm as THREE.Group).rotation.z = Math.sin(t * 2.4) * 0.6;
      // dust while moving
      robot.current.position.x = Math.sin(t * 0.6) * 0.8;

      // Fire robot projectile periodically
      if (projR.current && projRLife.current <= 0 && Math.cos(t) > 0.995) {
        projRLife.current = 1.6; // seconds
        const muzzle = robot.current.getObjectByName('rGunMuzzle') as THREE.Object3D | null;
        if (muzzle) {
          projR.current.position.copy(muzzle.getWorldPosition(new THREE.Vector3()));
        } else {
          projR.current.position.set(robot.current.position.x + 0.9, 1.1, 0);
        }
      }
    }

    // Scavenger dodge + throw
    if (scav.current) {
      scav.current.position.x = Math.sin(t * 0.8 + Math.PI / 3) * 1.2;
      scav.current.position.z = Math.cos(t * 0.7) * 0.6;
      // Throw projectile periodically
      if (proj.current && projLife.current <= 0 && Math.sin(t) > 0.995) {
        projLife.current = 1.8; // seconds
        proj.current.position.set(scav.current.position.x, 1.1, scav.current.position.z);
      }
    }

    if (proj.current) {
      if (projLife.current > 0) {
        projLife.current -= delta;
        // simple ballistic towards robot mid
        const target = new THREE.Vector3(robot.current?.position.x || 0, 1.2, 0);
        const dir = target.clone().sub(proj.current.position).normalize();
        proj.current.position.addScaledVector(dir, delta * 5);
        proj.current.rotation.x += delta * 10;
        // impact check
        if (proj.current.position.distanceTo(target) < 0.3) {
          projLife.current = 0;
          spawnSparks(target);
          shake.current = 1; // screenshake
        }
      } else {
        proj.current.position.set(100, -100, 0); // hide
      }
    }

    if (projR.current) {
      if (projRLife.current > 0) {
        projRLife.current -= delta;
        // towards scavenger center
        const target = new THREE.Vector3(scav.current?.position.x || 0, 0.9, scav.current?.position.z || 0);
        const dir = target.clone().sub(projR.current.position).normalize();
        projR.current.position.addScaledVector(dir, delta * 7);
        projR.current.rotation.z += delta * 14;
        if (projR.current.position.distanceTo(target) < 0.3) {
          projRLife.current = 0;
          spawnSparks(target);
          shake.current = 0.6;
        }
      } else {
        projR.current.position.set(-100, -100, 0);
      }
    }
  });

  return (
    <group ref={root}>
      {/* Robot (low poly, clear silhouette: head, eyes, arms with gun, legs) */}
      <group ref={robot} position={[-1.2, 0, 0]}>
        {/* Torso */}
        <RoundedBox args={[0.8, 1.2, 0.6]} radius={0.06} position={[0, 1.2, 0]} castShadow>
          <meshStandardMaterial color="#b66a3a" metalness={0.5} roughness={0.5} />
        </RoundedBox>
        {/* Head */}
        <group position={[0, 1.75, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#d3a079" />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.08, 0.02, 0.19]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#22d3ee" emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[0.08, 0.02, 0.19]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#22d3ee" emissiveIntensity={0.9} />
          </mesh>
        </group>
        {/* Right arm with gun */}
        <group name="rArm" position={[0.6, 1.1, 0]}>
          <RoundedBox args={[0.2, 0.6, 0.2]} radius={0.05} castShadow>
            <meshStandardMaterial color="#cf8450" />
          </RoundedBox>
          <group position={[0.0, -0.45, 0]}>
            <RoundedBox args={[0.18, 0.45, 0.18]} radius={0.04} castShadow>
              <meshStandardMaterial color="#a96a42" />
            </RoundedBox>
            <mesh name="rGunMuzzle" position={[0.15, -0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.3, 10]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>
        {/* Left arm */}
        <group position={[-0.6, 1.1, 0]}>
          <RoundedBox args={[0.2, 0.6, 0.2]} radius={0.05} castShadow>
            <meshStandardMaterial color="#cf8450" />
          </RoundedBox>
        </group>
        {/* Legs */}
        <RoundedBox args={[0.3, 0.7, 0.3]} radius={0.05} position={[-0.2, 0.35, 0]} castShadow>
          <meshStandardMaterial color="#8d6a52" />
        </RoundedBox>
        <RoundedBox args={[0.3, 0.7, 0.3]} radius={0.05} position={[0.2, 0.35, 0]} castShadow>
          <meshStandardMaterial color="#8d6a52" />
        </RoundedBox>
      </group>

      {/* Scavenger human: head, torso, arms, legs */}
      <group ref={scav} position={[1.2, 0, 0]}>
        {/* Torso */}
        <Capsule args={[0.22, 0.7]} position={[0, 0.75, 0]} castShadow>
          <meshStandardMaterial color="#bdbdbd" />
        </Capsule>
        {/* Head */}
        <mesh position={[0, 1.3, 0.02]} castShadow>
          <sphereGeometry args={[0.18, 14, 14]} />
          <meshStandardMaterial color="#f0d5c2" />
        </mesh>
        {/* Arms */}
        <Capsule args={[0.08, 0.45]} position={[-0.28, 0.9, 0]} rotation={[0,0,Math.PI/8]} castShadow>
          <meshStandardMaterial color="#cfcfcf" />
        </Capsule>
        <Capsule args={[0.08, 0.45]} position={[0.28, 0.9, 0]} rotation={[0,0,-Math.PI/8]} castShadow>
          <meshStandardMaterial color="#cfcfcf" />
        </Capsule>
        {/* Legs */}
        <Capsule args={[0.09, 0.55]} position={[-0.12, 0.25, 0]} castShadow>
          <meshStandardMaterial color="#cfcfcf" />
        </Capsule>
        <Capsule args={[0.09, 0.55]} position={[0.12, 0.25, 0]} castShadow>
          <meshStandardMaterial color="#cfcfcf" />
        </Capsule>
      </group>

      {/* Projectiles */}
      <mesh ref={proj} castShadow>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ff6b35" emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={projR} castShadow>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#66e0ff" emissive="#22d3ee" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

const sparksPool: THREE.Points[] = [];
const sparksGeom = new THREE.BufferGeometry().setFromPoints(new Array(80).fill(0).map(() => new THREE.Vector3((Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2)));
const sparksMat = new THREE.PointsMaterial({ color: new THREE.Color("#ffd38a"), size: 0.03, transparent: true, opacity: 0.9 });

function spawnSparks(pos: THREE.Vector3) {
  const pts = new THREE.Points(sparksGeom, sparksMat.clone());
  pts.position.copy(pos);
  sparksPool.push(pts);
  setTimeout(() => {
    const i = sparksPool.indexOf(pts);
    if (i >= 0) sparksPool.splice(i, 1);
  }, 600);
}


