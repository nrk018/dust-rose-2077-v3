"use client";

import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, RoundedBox, Capsule, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

export type RobotState = "normal" | "damaged" | "alert";
export type PartHealth = {
  head?: number;
  torso?: number;
  leftArm?: number;
  rightArm?: number;
  leftLeg?: number;
  rightLeg?: number;
  weapon?: number;
};

type PartKey = "head" | "torso" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg" | "weapon";

// Enhanced materials for better visual quality
function RustMaterial({ color, emissive = "#000000", emissiveIntensity = 0 }: { color: string; emissive?: string; emissiveIntensity?: number }) {
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.9,
    roughness: 0.4,
    clearcoat: 0.2,
    clearcoatRoughness: 0.8,
    emissive,
    emissiveIntensity,
  }), [color, emissive, emissiveIntensity]);
  return <primitive object={material} attach="material" />;
}

function HighlightOutline({ scale = 1.05, color = "#22d3ee" }: { scale?: number; color?: string }) {
  return (
    <mesh scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={color} side={THREE.BackSide} transparent opacity={0.3} />
    </mesh>
  );
}

function DamageOutline({ scale = 1.03, color = "#ef4444" }: { scale?: number; color?: string }) {
  return (
    <mesh scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={color} side={THREE.BackSide} transparent opacity={0.4} />
    </mesh>
  );
}

function PartInfo({ label, value, position, onRepair, isRepairing, repairProgress }: { 
  label: string; 
  value: number; 
  position: [number, number, number]; 
  onRepair?: () => void;
  isRepairing?: boolean;
  repairProgress?: number;
}) {
  const isDamaged = value < 50;
  
  return (
    <Html
      center
      transform
      position={position}
      distanceFactor={8}
      zIndexRange={[20, 0]}
      style={{
        pointerEvents: "auto",
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#000",
        textShadow: "0 0 6px rgba(211,106,40,.85), 0 0 12px rgba(211,106,40,.55)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.1))",
        border: isDamaged ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,140,0,0.25)",
        borderRadius: 4,
        padding: "4px 6px",
        backdropFilter: "blur(2px)",
        whiteSpace: "nowrap",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        minWidth: "120px",
        maxWidth: "120px", // Fixed width to prevent movement
        position: "fixed", // Fixed positioning to prevent movement
        transform: "translate(-50%, -50%)", // Center the fixed element
      }}
    >
      <div style={{ textAlign: "center" }}>{label}: {Math.max(0, Math.min(100, Math.round(value)))}%</div>
      {isDamaged && onRepair && !isRepairing && (
        <button
          onClick={onRepair}
          style={{
            fontSize: "8px",
            padding: "2px 6px",
            backgroundColor: "#22d3ee",
            color: "#000",
            border: "1px solid #22d3ee",
            borderRadius: "3px",
            cursor: "pointer",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            boxShadow: "0 0 8px rgba(34,211,238,0.5)",
            transition: "all 0.2s ease",
            width: "100%",
            position: "relative", // Ensure button stays in place
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#6ef5ff";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(34,211,238,0.8)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#22d3ee";
            e.currentTarget.style.boxShadow = "0 0 8px rgba(34,211,238,0.5)";
          }}
        >
          REPAIR
        </button>
      )}
      {isRepairing && (
        <div style={{ 
          width: "100%", 
          display: "flex", 
          flexDirection: "column", 
          gap: "2px",
          position: "relative" // Ensure progress bar stays in place
        }}>
          <div style={{ fontSize: "7px", textAlign: "center", color: "#22d3ee" }}>REPAIRING...</div>
          <div style={{ 
            width: "100%", 
            height: "4px", 
            backgroundColor: "rgba(0,0,0,0.3)", 
            borderRadius: "2px", 
            overflow: "hidden",
            border: "1px solid rgba(34,211,238,0.3)"
          }}>
            <div style={{
              width: `${repairProgress || 0}%`,
              height: "100%",
              backgroundColor: "#22d3ee",
              borderRadius: "2px",
              boxShadow: "0 0 4px rgba(34,211,238,0.6)",
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>
      )}
    </Html>
  );
}

// Individual robot components
function Head({ state, health, selected, onSelect, onRepair, isRepairing, repairProgress }: { state: RobotState; health: number; selected: boolean; onSelect: () => void; onRepair?: () => void; isRepairing?: boolean; repairProgress?: number }) {
  const headRef = useRef<THREE.Group>(null);
  const isDamaged = health < 50;
  
  useFrame(({ clock }) => {
    if (headRef.current && isDamaged) {
      const t = clock.getElapsedTime();
      headRef.current.rotation.y = Math.sin(t * 8) * 0.1;
    }
  });

  return (
    <group ref={headRef} position={[0, 1.8, 0]} onClick={onSelect} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
      {/* Main head */}
      <RoundedBox args={[0.6, 0.8, 0.5]} radius={0.1} castShadow>
        <RustMaterial color={isDamaged ? "#5a3a26" : "#7a4e32"} />
      </RoundedBox>
      
      {/* Visor */}
      <mesh position={[0, 0.1, 0.26]} castShadow>
        <planeGeometry args={[0.4, 0.2]} />
        <meshStandardMaterial color={state === "alert" ? "#22d3ee" : "#c8d1d1"} transparent opacity={0.8} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.15, 0.15, 0.28]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={isDamaged ? "#ff7a3a" : "#ffffff"} emissive={isDamaged ? "#ff7a3a" : "#ffffff"} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.15, 0.15, 0.28]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={isDamaged ? "#ff7a3a" : "#ffffff"} emissive={isDamaged ? "#ff7a3a" : "#ffffff"} emissiveIntensity={0.6} />
      </mesh>
      
      {/* Damage effects */}
      {isDamaged && <DamageOutline scale={1.05} />}
      {selected && <HighlightOutline scale={1.08} />}
      {selected && <PartInfo label="Head" value={health} position={[0.8, 0.4, 0]} onRepair={onRepair} isRepairing={isRepairing} repairProgress={repairProgress} />}
    </group>
  );
}

function Torso({ state, health, selected, onSelect, onRepair, isRepairing, repairProgress }: { state: RobotState; health: number; selected: boolean; onSelect: () => void; onRepair?: () => void; isRepairing?: boolean; repairProgress?: number }) {
  const isDamaged = health < 50;
  
  return (
    <group position={[0, 0.8, 0]} onClick={onSelect} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
      {/* Main torso */}
      <RoundedBox args={[1.2, 1.4, 0.8]} radius={0.1} castShadow>
        <RustMaterial color={isDamaged ? "#5a3a26" : "#7a4e32"} />
      </RoundedBox>
      
      {/* Chest panel */}
      <mesh position={[0, 0.2, 0.41]} castShadow>
        <planeGeometry args={[0.6, 0.4]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Damage effects */}
      {isDamaged && <DamageOutline scale={1.02} />}
      {selected && <HighlightOutline scale={1.05} />}
      {selected && <PartInfo label="Torso" value={health} position={[1.0, 0.6, 0]} onRepair={onRepair} isRepairing={isRepairing} repairProgress={repairProgress} />}
    </group>
  );
}

function Arm({ side, state, health, selected, onSelect, onRepair, isRepairing, repairProgress }: { side: "left" | "right"; state: RobotState; health: number; selected: boolean; onSelect: () => void; onRepair?: () => void; isRepairing?: boolean; repairProgress?: number }) {
  const armRef = useRef<THREE.Group>(null);
  const isDamaged = health < 50;
  const xPos = side === "left" ? -0.8 : 0.8;
  
  useFrame(({ clock }) => {
    if (armRef.current && isDamaged) {
      const t = clock.getElapsedTime();
      armRef.current.rotation.z = Math.sin(t * 6) * 0.2;
    }
  });

  return (
    <group ref={armRef} position={[xPos, 1.0, 0]} onClick={onSelect} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
      {/* Upper arm */}
      <RoundedBox args={[0.3, 0.6, 0.3]} radius={0.05} castShadow>
        <RustMaterial color={isDamaged ? "#5a3a26" : "#9ca3af"} />
      </RoundedBox>
      
      {/* Forearm */}
      <group position={[0, -0.4, 0]}>
        <RoundedBox args={[0.25, 0.5, 0.25]} radius={0.05} castShadow>
          <RustMaterial color={isDamaged ? "#5a3a26" : "#9ca3af"} />
        </RoundedBox>
        
        {/* Weapon mount */}
        <group position={[side === "left" ? -0.2 : 0.2, -0.1, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
            <meshStandardMaterial color="#2b2b2b" metalness={0.95} roughness={0.2} />
          </mesh>
        </group>
      </group>
      
      {/* Damage effects */}
      {isDamaged && <DamageOutline scale={1.03} />}
      {selected && <HighlightOutline scale={1.06} />}
      {selected && <PartInfo label={`${side === "left" ? "Left" : "Right"} Arm`} value={health} position={[side === "left" ? -1.2 : 1.2, 0.3, 0]} onRepair={onRepair} isRepairing={isRepairing} repairProgress={repairProgress} />}
    </group>
  );
}

function Leg({ side, state, health, selected, onSelect, onRepair, isRepairing, repairProgress }: { side: "left" | "right"; state: RobotState; health: number; selected: boolean; onSelect: () => void; onRepair?: () => void; isRepairing?: boolean; repairProgress?: number }) {
  const legRef = useRef<THREE.Group>(null);
  const isDamaged = health < 50;
  const xPos = side === "left" ? -0.3 : 0.3;
  
  useFrame(({ clock }) => {
    if (legRef.current && isDamaged) {
      const t = clock.getElapsedTime();
      legRef.current.position.y = Math.sin(t * 4) * 0.05;
    }
  });

  return (
    <group ref={legRef} position={[xPos, -0.2, 0]} onClick={onSelect} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
      {/* Thigh */}
      <RoundedBox args={[0.4, 0.8, 0.4]} radius={0.05} castShadow>
        <RustMaterial color={isDamaged ? "#5a3a26" : "#71717a"} />
      </RoundedBox>
      
      {/* Shin */}
      <group position={[0, -0.6, 0]}>
        <RoundedBox args={[0.35, 0.7, 0.35]} radius={0.05} castShadow>
          <RustMaterial color={isDamaged ? "#5a3a26" : "#71717a"} />
        </RoundedBox>
        
        {/* Foot */}
        <group position={[0, -0.5, 0.1]}>
          <RoundedBox args={[0.4, 0.2, 0.6]} radius={0.05} castShadow>
            <RustMaterial color="#404040" />
          </RoundedBox>
        </group>
      </group>
      
      {/* Damage effects */}
      {isDamaged && <DamageOutline scale={1.02} />}
      {selected && <HighlightOutline scale={1.05} />}
      {selected && <PartInfo label={`${side === "left" ? "Left" : "Right"} Leg`} value={health} position={[side === "left" ? -0.8 : 0.8, -0.5, 0]} onRepair={onRepair} isRepairing={isRepairing} repairProgress={repairProgress} />}
    </group>
  );
}

function Weapon({ state, health, selected, onSelect, onRepair, isRepairing, repairProgress }: { state: RobotState; health: number; selected: boolean; onSelect: () => void; onRepair?: () => void; isRepairing?: boolean; repairProgress?: number }) {
  const weaponRef = useRef<THREE.Group>(null);
  const isDamaged = health < 50;
  
  useFrame(({ clock }) => {
    if (weaponRef.current && isDamaged) {
      const t = clock.getElapsedTime();
      weaponRef.current.rotation.z = Math.sin(t * 10) * 0.1;
    }
  });

  return (
    <group ref={weaponRef} position={[0.5, 0.3, 0]} onClick={onSelect} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
      {/* Main weapon body */}
      <RoundedBox args={[0.6, 0.2, 0.2]} radius={0.05} castShadow>
        <RustMaterial color={isDamaged ? "#5a3a26" : "#2b2b2b"} />
      </RoundedBox>
      
      {/* Barrel */}
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.1} />
      </mesh>
      
      {/* Scope */}
      <mesh position={[0.1, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Damage effects */}
      {isDamaged && <DamageOutline scale={1.05} />}
      {selected && <HighlightOutline scale={1.08} />}
      {selected && <PartInfo label="Weapon" value={health} position={[1.0, 0.5, 0]} onRepair={onRepair} isRepairing={isRepairing} repairProgress={repairProgress} />}
    </group>
  );
}

// Battlefield environment props
function BattlefieldEnvironment() {
  const tankRefs = useRef<(THREE.Group | null)[]>([]);
  const helicopterRefs = useRef<(THREE.Group | null)[]>([]);
  const policeRefs = useRef<(THREE.Group | null)[]>([]);
  const smokeRefs = useRef<(THREE.Group | null)[]>([]);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Multiple tanks following road paths - avoiding robot area
    tankRefs.current.forEach((tankRef, index) => {
      if (tankRef) {
        const speed = 0.1 + index * 0.05;
        const radius = 25 + index * 5; // Increased radius to avoid robot
        const angle = t * speed + index * Math.PI / 3;
        
        // Follow circular road path
        tankRef.position.x = Math.cos(angle) * radius;
        tankRef.position.z = Math.sin(angle) * radius;
        tankRef.rotation.y = angle + Math.PI / 2;
        tankRef.position.y = -0.8 + Math.sin(t * 0.5 + index) * 0.02;
      }
    });
    
    // Multiple helicopters patrolling - avoiding robot area
    helicopterRefs.current.forEach((helicopterRef, index) => {
      if (helicopterRef) {
        const speed = 0.2 + index * 0.1;
        const radius = 20 + index * 3; // Increased radius to avoid robot
        const angle = t * speed + index * Math.PI / 4;
        
        // Figure-8 patrol pattern
        const x = Math.sin(angle) * radius;
        const z = Math.sin(angle * 2) * radius * 0.5;
        
        helicopterRef.position.x = x;
        helicopterRef.position.z = z;
        helicopterRef.position.y = 5 + Math.sin(t * 0.8 + index) * 0.5;
        helicopterRef.rotation.y = angle;
        helicopterRef.rotation.z = Math.sin(angle) * 0.1;
      }
    });
    
    // Multiple police vehicles - avoiding robot area
    policeRefs.current.forEach((policeRef, index) => {
      if (policeRef) {
        const speed = 0.1 + index * 0.03;
        const radius = 22 + index * 4; // Increased radius to avoid robot
        const angle = t * speed + index * Math.PI / 2;
        
        // Circular patrol pattern
        policeRef.position.x = Math.cos(angle) * radius;
        policeRef.position.z = Math.sin(angle) * radius;
        policeRef.rotation.y = angle + Math.PI / 2;
        policeRef.position.y = 3 + Math.sin(t * 0.3 + index) * 0.3;
        policeRef.rotation.z = Math.sin(angle) * 0.1;
      }
    });
    
    // Multiple smoke effects
    smokeRefs.current.forEach((smokeRef, index) => {
      if (smokeRef) {
        smokeRef.position.y = Math.sin(t * 0.8 + index) * 0.1;
        smokeRef.rotation.y = t * 0.2 + index;
      }
    });
  });

  return (
    <group>
      {/* Multiple Battle Tanks */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={`tank-${i}`} ref={(el) => (tankRefs.current[i] = el)} position={[0, -0.8, 0]} rotation={[0, 0, 0]}>
          {/* Tank body */}
          <RoundedBox args={[3.5, 1.2, 1.8]} radius={0.15} castShadow>
            <RustMaterial color="#3a3a3a" />
          </RoundedBox>
          
          {/* Tank turret */}
          <group position={[0, 0.8, 0]}>
            <RoundedBox args={[1.8, 0.8, 1.4]} radius={0.1} castShadow>
              <RustMaterial color="#2a2a2a" />
            </RoundedBox>
            
            {/* Main gun */}
            <mesh position={[0, 0, 1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 2.5, 12]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
            </mesh>
            
            {/* Gun mantlet */}
            <mesh position={[0, 0, 0.8]} castShadow>
              <sphereGeometry args={[0.4, 8, 8]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.4} />
            </mesh>
          </group>
          
          {/* Tracks */}
          <group position={[-1.6, -0.6, 0]}>
            <RoundedBox args={[0.3, 0.8, 1.6]} radius={0.05} castShadow>
              <RustMaterial color="#1a1a1a" />
            </RoundedBox>
          </group>
          <group position={[1.6, -0.6, 0]}>
            <RoundedBox args={[0.3, 0.8, 1.6]} radius={0.05} castShadow>
              <RustMaterial color="#1a1a1a" />
            </RoundedBox>
          </group>
          
          {/* Engine exhaust */}
          <group position={[-1.2, 0.2, -0.8]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
          <group position={[1.2, 0.2, -0.8]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
        </group>
      ))}
      
      {/* Multiple Police Flying Vehicles */}
      {Array.from({ length: 3 }, (_, i) => (
        <group key={`police-${i}`} ref={(el) => (policeRefs.current[i] = el)} position={[0, 2, 0]} rotation={[0, 0, 0]}>
          {/* Main body */}
          <RoundedBox args={[2.8, 1.0, 1.4]} radius={0.1} castShadow>
            <RustMaterial color="#2a2a2a" />
          </RoundedBox>
          
          {/* Cab */}
          <group position={[0, 0.6, 0.2]}>
            <RoundedBox args={[1.2, 0.8, 0.8]} radius={0.08} castShadow>
              <RustMaterial color="#1a1a1a" />
            </RoundedBox>
            
            {/* Windshield */}
            <mesh position={[0, 0.1, 0.45]} castShadow>
              <planeGeometry args={[0.8, 0.4]} />
              <meshStandardMaterial color="#333333" transparent opacity={0.6} />
            </mesh>
          </group>
          
          {/* Light bar */}
          <group position={[0, 1.1, 0]}>
            <RoundedBox args={[1.0, 0.15, 0.3]} radius={0.05} castShadow>
              <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
            </RoundedBox>
            <RoundedBox args={[0.3, 0.15, 0.3]} radius={0.05} castShadow>
              <meshStandardMaterial color="#0000ff" emissive="#0000ff" emissiveIntensity={0.8} />
            </RoundedBox>
          </group>
          
          {/* Main thrusters - rear */}
          <group position={[0, -0.3, -0.8]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.6, 12]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Thruster glow */}
            <mesh position={[0, 0, -0.4]} castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
              <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.6} />
            </mesh>
          </group>
          
          {/* Side thrusters */}
          <group position={[-1.2, -0.2, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Thruster glow */}
            <mesh position={[0, 0, -0.25]} castShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.1, 8]} />
              <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.4} />
            </mesh>
          </group>
          <group position={[1.2, -0.2, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Thruster glow */}
            <mesh position={[0, 0, -0.25]} castShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.1, 8]} />
              <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.4} />
            </mesh>
          </group>
        </group>
      ))}
      
      {/* Multiple Military Helicopters */}
      {Array.from({ length: 3 }, (_, i) => (
        <group key={`helicopter-${i}`} ref={(el) => (helicopterRefs.current[i] = el)} position={[0, 4, 0]}>
          {/* Main fuselage */}
          <RoundedBox args={[2.2, 0.6, 0.8]} radius={0.1} castShadow>
            <RustMaterial color="#3a3a3a" />
          </RoundedBox>
          
          {/* Cockpit */}
          <group position={[0, 0.2, 0.2]}>
            <RoundedBox args={[0.8, 0.4, 0.4]} radius={0.05} castShadow>
              <RustMaterial color="#2a2a2a" />
            </RoundedBox>
            
            {/* Windshield */}
            <mesh position={[0, 0.1, 0.25]} castShadow>
              <planeGeometry args={[0.6, 0.2]} />
              <meshStandardMaterial color="#333333" transparent opacity={0.7} />
            </mesh>
          </group>
          
          {/* Tail boom */}
          <group position={[0, 0, -1.2]}>
            <RoundedBox args={[0.3, 0.3, 1.5]} radius={0.05} castShadow>
              <RustMaterial color="#3a3a3a" />
            </RoundedBox>
            
            {/* Tail rotor */}
            <mesh position={[0, 0, -0.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
          </group>
          
          {/* Main rotor hub */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 8]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          
          {/* Main rotor blades */}
          <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <planeGeometry args={[6, 0.15]} />
            <meshStandardMaterial color="#2a2a2a" transparent opacity={0.6} />
          </mesh>
          
          {/* Landing skids */}
          <group position={[-0.6, -0.3, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
          <group position={[0.6, -0.3, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
        </group>
      ))}
      
      {/* Multiple Smoke Effects */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={`smoke-${i}`} ref={(el) => (smokeRefs.current[i] = el)} position={[
          -20 + Math.random() * 40, 
          1 + Math.random() * 3, 
          -15 - Math.random() * 10
        ]}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color="#666666" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0.2, 0.3, 0.1]} castShadow>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#777777" transparent opacity={0.2} />
          </mesh>
          <mesh position={[-0.1, 0.5, -0.1]} castShadow>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#888888" transparent opacity={0.15} />
          </mesh>
        </group>
      ))}
      
      {/* Destroyed Building Debris */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={`debris-${i}`} position={[
          -15 + Math.random() * 30, 
          -0.5, 
          -10 - Math.random() * 15
        ]} rotation={[0, Math.random() * Math.PI, 0]}>
          <RoundedBox args={[2, 1.5, 1]} radius={0.1} castShadow>
            <RustMaterial color="#4a4a4a" />
          </RoundedBox>
          <RoundedBox args={[1, 0.8, 0.6]} radius={0.05} castShadow>
            <RustMaterial color="#5a5a5a" />
          </RoundedBox>
          <mesh position={[0.5, 1.2, 0]} castShadow>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
        </group>
      ))}
      
      {/* Additional Military Equipment */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={`equipment-${i}`} position={[
          -20 + Math.random() * 40, 
          -0.7, 
          -8 - Math.random() * 12
        ]} rotation={[0, Math.random() * Math.PI, 0]}>
          {/* Ammunition crates */}
          <RoundedBox args={[1.2, 0.8, 0.8]} radius={0.05} castShadow>
            <RustMaterial color="#2a2a2a" />
          </RoundedBox>
          <RoundedBox args={[1.2, 0.8, 0.8]} radius={0.05} castShadow>
            <RustMaterial color="#2a2a2a" />
          </RoundedBox>
          
          {/* Communication equipment */}
          <group position={[0, 0.6, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.4, 0.3, 0.2]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          </group>
        </group>
      ))}
      
      {/* Dense Dark Clouds */}
      <DarkClouds />
      
      {/* Futuristic Cityscape - 360 Background */}
      <FuturisticCityscape />
      
      {/* Broken Roads */}
      <BrokenRoads />
      
      {/* Hawa Mahal-inspired Building */}
      <HawaMahalBuilding />
    </group>
  );
}

// Dense dark clouds component
const DarkClouds = React.memo(() => {
  const cloudData = useMemo(() => {
    const clouds = [];
    
    // Create multiple layers of clouds at different heights - well above all buildings
    for (let layer = 0; layer < 4; layer++) {
      const height = 25 + layer * 12; // 25, 37, 49, 61 units high (buildings max ~12 units)
      const cloudCount = 8 + layer * 4; // More clouds at higher layers
      
      for (let i = 0; i < cloudCount; i++) {
        const x = -50 + Math.random() * 100; // Wider coverage
        const z = -50 + Math.random() * 100;
        const size = 10 + Math.random() * 15; // Larger clouds for better coverage
        const opacity = 0.3 + Math.random() * 0.4;
        
        clouds.push({
          x, z, height, size, opacity,
          rotation: Math.random() * Math.PI * 2,
          speed: 0.1 + Math.random() * 0.2
        });
      }
    }
    
    return clouds;
  }, []);

  return (
    <group>
      {cloudData.map((cloud, index) => (
        <CloudLayer 
          key={`cloud-${index}`}
          position={[cloud.x, cloud.height, cloud.z]}
          size={cloud.size}
          opacity={cloud.opacity}
          rotation={cloud.rotation}
          speed={cloud.speed}
        />
      ))}
    </group>
  );
});

// Individual cloud layer component
function CloudLayer({ position, size, opacity, rotation, speed }: {
  position: [number, number, number];
  size: number;
  opacity: number;
  rotation: number;
  speed: number;
}) {
  const cloudRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (cloudRef.current) {
      // Slow drifting motion
      cloudRef.current.position.x = position[0] + Math.sin(clock.getElapsedTime() * speed) * 2;
      cloudRef.current.position.z = position[2] + Math.cos(clock.getElapsedTime() * speed * 0.7) * 1.5;
      cloudRef.current.rotation.y = rotation + clock.getElapsedTime() * speed * 0.1;
    }
  });

  return (
    <group ref={cloudRef} position={position}>
      {/* Main cloud body */}
      <mesh castShadow>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          transparent 
          opacity={opacity}
          fog={false}
        />
      </mesh>
      
      {/* Additional cloud puffs for density */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * size * 1.5,
            (Math.random() - 0.5) * size * 0.5,
            (Math.random() - 0.5) * size * 1.5
          ]}
          castShadow
        >
          <sphereGeometry args={[size * 0.6, 12, 12]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            transparent 
            opacity={opacity * 0.8}
            fog={false}
          />
        </mesh>
      ))}
      
      {/* Smaller cloud details */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh 
          key={`detail-${i}`}
          position={[
            (Math.random() - 0.5) * size * 2,
            (Math.random() - 0.5) * size * 0.3,
            (Math.random() - 0.5) * size * 2
          ]}
          castShadow
        >
          <sphereGeometry args={[size * 0.3, 8, 8]} />
          <meshStandardMaterial 
            color="#333333" 
            transparent 
            opacity={opacity * 0.6}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Memoized cityscape to prevent re-rendering
const FuturisticCityscape = React.memo(() => {
  // Pre-calculate building data to avoid random generation on every render
  const buildingData = useMemo(() => {
    type CityBuilding = { x: number; z: number; height: number; width: number; depth: number; color: string; hasRooftop?: boolean };
    type CityBlock = { x: number; z: number; buildings: CityBuilding[] };
    const blocks: CityBlock[] = [];
    const lights: { x: number; z: number }[] = [];
    const scattered: CityBuilding[] = [];
    
    // Main city blocks - reduced number near robot
    for (let blockX = 0; blockX < 6; blockX++) {
      for (let blockZ = 0; blockZ < 6; blockZ++) {
        const x = -18 + blockX * 8; // Increased spacing
        const z = -18 + blockZ * 8;
        
        // Skip blocks that are too close to robot (center area)
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        if (distanceFromCenter < 12) continue; // Increased minimum distance
        
        const buildingCount = 1 + Math.floor(Math.random() * 2); // Reduced building count
        
        const block: CityBlock = {
          x, z, buildings: []
        };
        
        for (let i = 0; i < buildingCount; i++) {
          const buildingX = -3 + (i % 2) * 6;
          const buildingZ = -3 + Math.floor(i / 2) * 6;
          const height = 4 + Math.random() * 6; // Reduced height variation
          const width = 1.5 + Math.random() * 0.5;
          const depth = 1.5 + Math.random() * 0.5;
          
          block.buildings.push({
            x: buildingX, z: buildingZ, height, width, depth,
            color: `#${Math.floor(Math.random() * 2 + 3)}a${Math.floor(Math.random() * 2 + 3)}a${Math.floor(Math.random() * 2 + 3)}a`,
            hasRooftop: Math.random() > 0.5
          });
        }
        
        blocks.push(block);
      }
    }
    
    // Street lights - reduced number
    for (let i = 0; i < 12; i++) {
      const x = -18 + (i % 6) * 8;
      const z = -18 + Math.floor(i / 6) * 8;
      
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 12) continue;
      
      lights.push({ x, z });
    }
    
    // Scattered buildings - reduced number
    for (let i = 0; i < 15; i++) {
      let x, z;
      let attempts = 0;
      
      do {
        x = -25 + Math.random() * 50;
        z = -25 + Math.random() * 50;
        attempts++;
      } while (Math.sqrt(x * x + z * z) < 15 && attempts < 30);
      
      if (attempts < 30) {
        const height = 3 + Math.random() * 4;
        const width = 1 + Math.random() * 1;
        const depth = 1 + Math.random() * 1;
        
        scattered.push({
          x, z, height, width, depth,
          color: `#${Math.floor(Math.random() * 2 + 3)}a${Math.floor(Math.random() * 2 + 3)}a${Math.floor(Math.random() * 2 + 3)}a`
        });
      }
    }
    
    return { blocks, lights, scattered };
  }, []); // Empty dependency array - only calculate once

  return (
    <group>
      {/* Main city blocks */}
      {buildingData.blocks.map((block, blockIndex) => (
        <group key={`block-${blockIndex}`} position={[block.x, 0, block.z]}>
          {block.buildings.map((building, buildingIndex) => (
            <group key={`building-${buildingIndex}`} position={[building.x, 0, building.z]}>
              {/* Main building structure */}
              <RoundedBox args={[building.width, building.height, building.depth]} radius={0.1} castShadow>
                <RustMaterial color={building.color} />
              </RoundedBox>
              
              {/* Windows with fixed lighting */}
              {Array.from({ length: Math.floor(building.height) }, (_, floor) => (
                <group key={floor} position={[0, -building.height/2 + floor * 1 + 0.5, building.depth/2 + 0.01]}>
                  {Array.from({ length: Math.floor(building.width * 2) }, (_, window) => (
                    <mesh key={window} position={[-building.width/2 + window * 0.5 + 0.25, 0, 0]} castShadow>
                      <planeGeometry args={[0.3, 0.4]} />
                      <meshStandardMaterial 
                        color={window % 2 === 0 ? "#ffffff" : "#22d3ee"} 
                        emissive={window % 2 === 0 ? "#ffffff" : "#22d3ee"} 
                        emissiveIntensity={0.4} 
                      />
                    </mesh>
                  ))}
                </group>
              ))}
              
              {/* Rooftop details */}
              {building.hasRooftop && (
                <group position={[0, building.height/2 + 0.1, 0]}>
                  <mesh position={[-building.width/3, 0, -building.depth/3]} castShadow>
                    <boxGeometry args={[0.3, 0.2, 0.3]} />
                    <meshStandardMaterial color="#2a2a2a" />
                  </mesh>
                  <mesh position={[0, 0.2, 0]} castShadow>
                    <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
                    <meshStandardMaterial color="#1a1a1a" />
                  </mesh>
                </group>
              )}
            </group>
          ))}
        </group>
      ))}
      
      {/* Street lighting */}
      {buildingData.lights.map((light, index) => (
        <group key={`streetlight-${index}`} position={[light.x, 0, light.z]}>
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <group position={[0, 4, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.4, 0.2, 0.4]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
            <mesh position={[0, 0.1, 0]} castShadow>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.8} 
              />
            </mesh>
          </group>
        </group>
      ))}
      
      {/* Scattered buildings */}
      {buildingData.scattered.map((building, index) => (
        <group key={`scattered-${index}`} position={[building.x, 0, building.z]}>
          <RoundedBox args={[building.width, building.height, building.depth]} radius={0.1} castShadow>
            <RustMaterial color={building.color} />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
});

// Civilized road network with clear robot space
function BrokenRoads() {
  return (
    <group>
      {/* Main horizontal roads - avoiding robot area */}
      {Array.from({ length: 9 }, (_, i) => {
        const z = -24 + i * 6;
        
        // Skip roads too close to robot
        if (Math.abs(z) < 6) return null;
        
        return (
          <group key={`h-road-${i}`} position={[0, -1.1, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[48, 2]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.2} roughness={0.8} />
            </mesh>
            {/* Road markings */}
            <mesh position={[0, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <planeGeometry args={[48, 0.1]} />
              <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} />
            </mesh>
            {/* Side markings */}
            <mesh position={[-24, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <planeGeometry args={[0.1, 2]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[24, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <planeGeometry args={[0.1, 2]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
          </group>
        );
      }).filter(Boolean)}
      
      {/* Main vertical roads - avoiding robot area */}
      {Array.from({ length: 9 }, (_, i) => {
        const x = -24 + i * 6;
        
        // Skip roads too close to robot
        if (Math.abs(x) < 6) return null;
        
        return (
          <group key={`v-road-${i}`} position={[x, -1.1, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[2, 48]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.2} roughness={0.8} />
            </mesh>
            {/* Road markings */}
            <mesh position={[0, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <planeGeometry args={[0.1, 48]} />
              <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} />
            </mesh>
            {/* Side markings */}
            <mesh position={[0, -0.99, -24]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <planeGeometry args={[2, 0.1]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0, -0.99, 24]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <planeGeometry args={[2, 0.1]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
          </group>
        );
      }).filter(Boolean)}
      
      {/* Intersections with traffic lights - avoiding robot area */}
      {Array.from({ length: 9 }, (_, i) => (
        Array.from({ length: 9 }, (_, j) => {
          const x = -24 + i * 6;
          const z = -24 + j * 6;
          
          // Skip intersections too close to robot
          const distanceFromCenter = Math.sqrt(x * x + z * z);
          if (distanceFromCenter < 8) return null;
          
          return (
            <group key={`intersection-${i}-${j}`} position={[x, -1.05, z]}>
              {/* Intersection area */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
              </mesh>
              
              {/* Traffic light */}
              <group position={[1.2, 0, 0]}>
                {/* Pole */}
                <mesh position={[0, 1.5, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
                  <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                
                {/* Light housing */}
                <group position={[0, 3, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.3, 0.4, 0.2]} />
                    <meshStandardMaterial color="#2a2a2a" />
                  </mesh>
                  
                  {/* Red light */}
                  <mesh position={[0, 0.1, 0.11]} castShadow>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.6} />
                  </mesh>
                  
                  {/* Yellow light */}
                  <mesh position={[0, 0, 0.11]} castShadow>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.4} />
                  </mesh>
                  
                  {/* Green light */}
                  <mesh position={[0, -0.1, 0.11]} castShadow>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.6} />
                  </mesh>
                </group>
              </group>
            </group>
          );
        })
      )).flat().filter(Boolean)}
      
      {/* Sidewalks - avoiding robot area */}
      {Array.from({ length: 9 }, (_, i) => (
        Array.from({ length: 9 }, (_, j) => {
          const x = -24 + i * 6;
          const z = -24 + j * 6;
          
          // Skip sidewalks too close to robot
          const distanceFromCenter = Math.sqrt(x * x + z * z);
          if (distanceFromCenter < 8) return null;
          
          return (
            <group key={`sidewalk-${i}-${j}`} position={[x, -1.05, z]}>
              {/* Sidewalk around intersection */}
              <mesh position={[1.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[0.5, 2]} />
                <meshStandardMaterial color="#3a3a3a" metalness={0.1} roughness={0.9} />
              </mesh>
              <mesh position={[-1.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[0.5, 2]} />
                <meshStandardMaterial color="#3a3a3a" metalness={0.1} roughness={0.9} />
              </mesh>
              <mesh position={[0, 0, 1.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[2, 0.5]} />
                <meshStandardMaterial color="#3a3a3a" metalness={0.1} roughness={0.9} />
              </mesh>
              <mesh position={[0, 0, -1.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[2, 0.5]} />
                <meshStandardMaterial color="#3a3a3a" metalness={0.1} roughness={0.9} />
              </mesh>
            </group>
          );
        })
      )).flat().filter(Boolean)}
      
      {/* Clear area around robot - just ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.9} />
      </mesh>
    </group>
  );
}

// Hawa Mahal-inspired futuristic building
function HawaMahalBuilding() {
  return (
    <group position={[0, 0, -25]} rotation={[0, Math.PI, 0]}>
      {/* Main structure */}
      <RoundedBox args={[6, 4, 3]} radius={0.2} castShadow>
        <RustMaterial color="#4a3a2a" />
      </RoundedBox>
      
      {/* Curved facade with windows (Hawa Mahal style) */}
      <group position={[0, 0, 1.6]}>
        {/* Main curved wall */}
        <mesh castShadow>
          <cylinderGeometry args={[3, 3, 0.2, 16, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#5a4a3a" metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Windows in rows */}
        {Array.from({ length: 4 }, (_, floor) => (
          <group key={floor} position={[0, -1.5 + floor * 1, 0]}>
            {Array.from({ length: 8 }, (_, window) => (
              <mesh key={window} position={[
                Math.cos((window * Math.PI) / 8) * 2.8,
                0,
                Math.sin((window * Math.PI) / 8) * 2.8
              ]} rotation={[0, (window * Math.PI) / 8, 0]} castShadow>
                <planeGeometry args={[0.3, 0.4]} />
                <meshStandardMaterial 
                  color={window % 2 === 0 ? "#22d3ee" : "#ff6b35"} 
                  emissive={window % 2 === 0 ? "#22d3ee" : "#ff6b35"} 
                  emissiveIntensity={0.4} 
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      
      {/* Rooftop structures */}
      <group position={[0, 2.2, 0]}>
        {/* Central dome */}
        <mesh castShadow>
          <sphereGeometry args={[0.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#6a5a4a" metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Corner towers */}
        {[-2, 2].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
              <meshStandardMaterial color="#4a3a2a" />
            </mesh>
            <mesh position={[0, 0.6, 0]} castShadow>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* Base platform */}
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[4, 4, 0.5, 16]} />
        <meshStandardMaterial color="#3a2a1a" metalness={0.2} roughness={0.8} />
      </mesh>
      
      {/* Decorative arches */}
      <group position={[0, -1, 1.6]}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[-2 + i * 1, 0, 0]} castShadow>
            <torusGeometry args={[0.4, 0.1, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#5a4a3a" metalness={0.4} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function RobotMech({ state, health, onSelect, selected, hovered, onRepair, repairingPart, repairProgress }: { 
  state: RobotState; 
  health: Required<PartHealth>; 
  onSelect: (p: PartKey) => void; 
  selected?: PartKey | null; 
  hovered: boolean;
  onRepair: (part: PartKey) => void;
  repairingPart?: PartKey | null;
  repairProgress?: number;
}) {
  const rootRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (rootRef.current) {
      // Subtle idle breathing motion
      rootRef.current.position.y = Math.sin(t * 0.8) * 0.02;
      rootRef.current.rotation.y = Math.sin(t * 0.3) * 0.05;
    }
  });

  return (
    <group ref={rootRef}>
      {/* Ground base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <circleGeometry args={[1.5, 16]} />
        <meshStandardMaterial color="#2a231f" metalness={0.1} roughness={0.95} />
      </mesh>
      
      {/* Robot components */}
      <Head 
        state={state} 
        health={health.head} 
        selected={selected === "head"} 
        onSelect={() => onSelect("head")} 
        onRepair={() => onRepair("head")}
        isRepairing={repairingPart === "head"}
        repairProgress={repairingPart === "head" ? repairProgress : undefined}
      />
      
      <Torso 
        state={state} 
        health={health.torso} 
        selected={selected === "torso"} 
        onSelect={() => onSelect("torso")} 
        onRepair={() => onRepair("torso")}
        isRepairing={repairingPart === "torso"}
        repairProgress={repairingPart === "torso" ? repairProgress : undefined}
      />
      
      <Arm 
        side="left" 
        state={state} 
        health={health.leftArm} 
        selected={selected === "leftArm"} 
        onSelect={() => onSelect("leftArm")} 
        onRepair={() => onRepair("leftArm")}
        isRepairing={repairingPart === "leftArm"}
        repairProgress={repairingPart === "leftArm" ? repairProgress : undefined}
      />
      
      <Arm 
        side="right" 
        state={state} 
        health={health.rightArm} 
        selected={selected === "rightArm"} 
        onSelect={() => onSelect("rightArm")} 
        onRepair={() => onRepair("rightArm")}
        isRepairing={repairingPart === "rightArm"}
        repairProgress={repairingPart === "rightArm" ? repairProgress : undefined}
      />
      
      <Leg 
        side="left" 
        state={state} 
        health={health.leftLeg} 
        selected={selected === "leftLeg"} 
        onSelect={() => onSelect("leftLeg")} 
        onRepair={() => onRepair("leftLeg")}
        isRepairing={repairingPart === "leftLeg"}
        repairProgress={repairingPart === "leftLeg" ? repairProgress : undefined}
      />
      
      <Leg 
        side="right" 
        state={state} 
        health={health.rightLeg} 
        selected={selected === "rightLeg"} 
        onSelect={() => onSelect("rightLeg")} 
        onRepair={() => onRepair("rightLeg")}
        isRepairing={repairingPart === "rightLeg"}
        repairProgress={repairingPart === "rightLeg" ? repairProgress : undefined}
      />
      
      <Weapon 
        state={state} 
        health={health.weapon} 
        selected={selected === "weapon"} 
        onSelect={() => onSelect("weapon")} 
        onRepair={() => onRepair("weapon")}
        isRepairing={repairingPart === "weapon"}
        repairProgress={repairingPart === "weapon" ? repairProgress : undefined}
      />
    </group>
  );
}

export default function RobotViewer({ state = "normal" as RobotState, parts }: { state?: RobotState; parts?: PartHealth }) {
  const [health, setHealth] = useState<Required<PartHealth>>({
    head: parts?.head ?? 85,
    torso: parts?.torso ?? 78,
    leftArm: parts?.leftArm ?? 92,
    rightArm: parts?.rightArm ?? 45, // Damaged
    leftLeg: parts?.leftLeg ?? 88,
    rightLeg: parts?.rightLeg ?? 91,
    weapon: parts?.weapon ?? 67,
  });
  
  const [selected, setSelected] = useState<PartKey | null>(null);
  const [hovered, setHovered] = useState(false);
  const [repairingPart, setRepairingPart] = useState<PartKey | null>(null);
  const [repairProgress, setRepairProgress] = useState(0);
  
  const handleRepair = (part: PartKey) => {
    if (repairingPart) return; // Prevent multiple repairs at once
    
    setRepairingPart(part);
    setRepairProgress(0);
    
    // Animate repair progress over 3 seconds
    const repairDuration = 3000; // 3 seconds
    const startTime = Date.now();
    const startHealth = health[part];
    const targetHealth = Math.min(100, startHealth + 30);
    
    const animateRepair = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / repairDuration, 1);
      
      setRepairProgress(progress * 100);
      
      // Update health gradually
      const newHealth = startHealth + (targetHealth - startHealth) * progress;
      setHealth(prev => ({
        ...prev,
        [part]: Math.round(newHealth)
      }));
      
      if (progress < 1) {
        requestAnimationFrame(animateRepair);
      } else {
        // Repair complete
        setRepairingPart(null);
        setRepairProgress(0);
      }
    };
    
    requestAnimationFrame(animateRepair);
  };
  
  return (
    <Canvas camera={{ position: [4, 3, 5], fov: 50 }} gl={{ alpha: true, antialias: true }} shadows style={{ background: "transparent" }} onPointerMissed={() => setSelected(null)}>
      <OrbitControls enablePan={false} enableDamping dampingFactor={0.15} minDistance={3} maxDistance={10} />
      
      {/* Enhanced lighting for battlefield atmosphere */}
      <Environment preset="warehouse" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffd7b3" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[2, 4, 2]} intensity={0.8} color="#ff6b35" distance={8} decay={2} />
      <spotLight position={[-3, 6, 3]} angle={0.3} penumbra={0.5} intensity={0.6} color="#22d3ee" castShadow />
      
      {/* Ground shadows */}
      <ContactShadows position={[0, -1.2, 0]} opacity={0.8} scale={20} blur={3} far={5} color="#1a0e0a" />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2a231f" metalness={0.1} roughness={0.95} />
      </mesh>
      
      {/* Battlefield environment */}
      <BattlefieldEnvironment />
      
      {/* Main robot */}
      <group onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <RobotMech 
          state={state} 
          health={health} 
          onSelect={setSelected} 
          selected={selected} 
          hovered={hovered} 
          onRepair={handleRepair}
          repairingPart={repairingPart}
          repairProgress={repairProgress}
        />
      </group>
    </Canvas>
  );
}