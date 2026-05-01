import React, { useEffect, useRef, useCallback, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer, loadAsync } from 'expo-three';
import { Asset } from 'expo-asset';
import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Color,
  MeshStandardMaterial,
  Mesh,
  Object3D,
} from 'three';

// ─── Props ────────────────────────────────────────────────────────────────────
interface LiverModelViewerProps {
  /** 'default' | 'correct' (yeşil) | 'wrong' (kırmızı) */
  colorState?: 'default' | 'correct' | 'wrong';
  style?: object;
}

// Renk haritası
const COLOR_MAP: Record<string, string> = {
  default: '#c0392b', // doğal karaciğer kırmızısı
  correct: '#27ae60', // yeşil — sağlıklı
  wrong: '#8e1010',   // koyu kırmızı — hasarlı
};

// ─── Component ────────────────────────────────────────────────────────────────
export function LiverModelViewer({ colorState = 'default', style }: LiverModelViewerProps) {
  const [ready, setReady] = useState(false);
  const meshesRef = useRef<Mesh[]>([]);
  const animFrameRef = useRef<number>(0);
  const rendererRef = useRef<Renderer | null>(null);

  // Renk değişimini model üzerinde uygula
  useEffect(() => {
    const hex = COLOR_MAP[colorState];
    meshesRef.current.forEach((mesh) => {
      const mat = mesh.material as MeshStandardMaterial;
      if (mat?.color) mat.color.set(hex);
    });
  }, [colorState]);

  const onContextCreate = useCallback(async (gl: ExpoWebGLRenderingContext) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(new Color('black'), 0);
    rendererRef.current = renderer;

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new Scene();

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new PerspectiveCamera(50, width / height, 0.01, 1000);
    camera.position.set(0, 0.5, 3);

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new AmbientLight(0xffffff, 1.2));

    const dirLight = new DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    const fillLight = new DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-5, -5, -5);
    scene.add(fillLight);

    // ── GLB Modeli — expo-asset + expo-three loadAsync ile yükle ───────────────
    try {
      // 1. expo-asset: Metro'nun asset sisteminden URI al ve cihaza indir
      const asset = Asset.fromModule(
        require('../../assets/models/hati__liver_3d_modelling.glb')
      );
      await asset.downloadAsync();

      // 2. expo-three: İndirilen dosyanın yerel URI'sinden yükle
      const gltf = await loadAsync(asset.localUri as string);

      const model: Object3D = gltf.scene;
      // Modeli büyütüyoruz (5.5)
      model.scale.set(5.5, 5.5, 5.5);
      // Ekranın tam ortasında durması için Y pozisyonu uyarlandı (biraz yukarı alındı)
      model.position.set(0, -0.3, 0);
      scene.add(model);

      // Tüm mesh'leri topla (renk değişimi için)
      model.traverse((child: Object3D) => {
        const mesh = child as Mesh;
        if (mesh.isMesh) {
          meshesRef.current.push(mesh);
          // Başlangıç rengini uygula
          const mat = mesh.material as MeshStandardMaterial;
          if (mat?.color) mat.color.set(COLOR_MAP[colorState]);
        }
      });

      setReady(true);
    } catch (err) {
      console.error('LiverModelViewer: GLB yüklenemedi —', err);
      setReady(true); // Hata olsa bile render döngüsü devam etsin
    }

    // ── Render döngüsü ────────────────────────────────────────────────────────
    let rotY = 0;
    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      rotY += 0.008;
      scene.rotation.y = rotY;
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  }, []);

  // Unmount temizliği
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      rendererRef.current?.dispose?.();
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <GLView
        style={StyleSheet.absoluteFill}
        onContextCreate={onContextCreate}
      />
      {!ready && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#34d399" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
