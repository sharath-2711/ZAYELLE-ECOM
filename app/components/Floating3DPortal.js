"use client";
import { Canvas } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import { useRef } from 'react';
import { useInView } from 'framer-motion';

export default function Floating3DPortal({ size, style, color, geometry = 'torus' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "200px" });

  return (
    <div
      ref={ref}
      className="hide-mobile"
      style={{ 
        ...style,
        width: size, height: size,
        position: "absolute",
        pointerEvents: "none",
        zIndex: 1
      }}
    >
      {isInView && (
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Float speed={2} rotationIntensity={2} floatIntensity={2}>
            {geometry === 'giftbox' ? (
              <group>
                <mesh>
                  <boxGeometry args={[1.5, 1.5, 1.5]} />
                  <meshPhysicalMaterial transmission={0.9} opacity={1} transparent roughness={0.1} ior={1.5} color={color || "#ffffff"} />
                </mesh>
                <mesh>
                  <boxGeometry args={[1.55, 1.55, 0.15]} />
                  <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh>
                  <boxGeometry args={[0.15, 1.55, 1.55]} />
                  <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
                </mesh>
              </group>
            ) : (
              <mesh>
                <sphereGeometry args={[1.2, 64, 64]} />
                <meshPhysicalMaterial clearcoat={1} clearcoatRoughness={0.1} metalness={0.1} roughness={0.2} color={color || "#ffffff"} />
              </mesh>
            )}
          </Float>
          <Environment preset="city" />
        </Canvas>
      )}
    </div>
  );
}
