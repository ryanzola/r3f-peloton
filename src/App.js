import * as THREE from "three";
import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useThree, useFrame } from "react-three-fiber";
import { useGLTF, Environment, useTexture } from "@react-three/drei";

import "./styles.css";

function Pelotons({ count }) {
  console.log(count);
  const { nodes } = useGLTF("/peloton.glb", "/draco-gltf/");
  const mesh = useRef();

  const { viewport, mouse } = useThree();

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // generate random positions, speed factors, timings
  const particles = useMemo(() => {
    const temp = [];

    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;

      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }

    return temp;
  }, [count]);

  //render loop
  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;

      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      particle.mx += mouse.x * viewport.width * particle.mx * 0.01;
      particle.my += mouse.y * viewport.height * particle.my * 0.01;

      // update the dummy position
      dummy.position.set(
        (particle.mx / 10) * a +
          xFactor +
          Math.cos((t / 10) * factor) +
          (Math.sin(t * 1) * factor) / 1,
        (particle.my / 10) * b +
          yFactor +
          Math.sin((t / 10) * factor) +
          (Math.cos(t * 2) * factor) / 1,
        (particle.my / 10) * b +
          zFactor +
          Math.cos((t / 10) * factor) +
          (Math.sin(t) * factor) / 10
      );
      dummy.scale.set(s * 1.8, s * 1.8, s * 1.8);
      dummy.rotation.set(s * 5, -s * 5, s * 5);
      dummy.updateMatrix();

      // And apply the matrix to the instanced item
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  const diffuse = useTexture("/peloton-diffuse.png");
  const aomap = useTexture("/peloton-ao-map.png");

  const redMaterial = new THREE.MeshStandardMaterial({
    map: diffuse,
    aoMap: aomap
  });

  return (
    <group dispose={true}>
      <instancedMesh
        ref={mesh}
        args={[null, null, count]}
        geometry={nodes.Peleton.geometry}
        material={redMaterial}
      />

      <mesh
        geometry={nodes.Peleton.geometry}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0.07, 0, 0]}
      >
        <meshStandardMaterial map={diffuse} />
      </mesh>
    </group>
  );
}

export default function App() {
  return (
    <Canvas
      gl={{ alpha: false }}
      colorManagement={false}
      pixelRatio={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 60 }}
    >
      <Suspense fallback={null}>
        <Environment background={false} preset={"studio"} />
        <Pelotons count={600} />
      </Suspense>
    </Canvas>
  );
}
