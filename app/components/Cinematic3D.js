"use client";
import { Canvas } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial, Float } from '@react-three/drei';

export default function Cinematic3D() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <group>
          {/* A beautiful sleek frosted glass gift box */}
          <mesh castShadow>
            <boxGeometry args={[2, 2, 2]} />
            <MeshTransmissionMaterial backside samples={3} thickness={1.5} roughness={0.1} transmission={1} ior={1.5} chromaticAberration={0.06} anisotropy={0.1} color="#f9f9f9" />
          </mesh>
          {/* The Gold Ribbon (Vertical) */}
          <mesh>
            <boxGeometry args={[2.05, 2.05, 0.2]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* The Gold Ribbon (Horizontal) */}
          <mesh>
            <boxGeometry args={[0.2, 2.05, 2.05]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </Float>
      <Environment preset="city" />
    </Canvas>
  );
}
