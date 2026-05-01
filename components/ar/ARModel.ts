/**
 * ARModel — 3D karaciğer modeli durum yönetimi
 *
 * Bu sınıf modelin durum bilgisini (renk, yükleme vs.) merkezi olarak tutar.
 * Asıl render LiverModelViewer.tsx içinde expo-gl + expo-three ile yapılır.
 *
 * İleride ViroReact entegrasyonunda bu sınıf <Viro3DObject> ile bağlanacak.
 */

export type ModelColorState = 'default' | 'correct' | 'wrong';

export class ARModel {
  /** GLB dosyasının asset yolu */
  readonly modelPath: string;

  /** Mevcut renk durumu */
  currentColor: ModelColorState;

  /** Model yüklenme durumu */
  isLoaded: boolean;

  constructor(modelPath: string) {
    this.modelPath = modelPath;
    this.currentColor = 'default';
    this.isLoaded = false;
  }

  /**
   * Modelin yüklendiğini işaretle.
   * LiverModelViewer, GLB yükleme tamamlandığında bu metodu çağırabilir.
   */
  markLoaded(): void {
    this.isLoaded = true;
    console.log('ARModel: Karaciğer modeli yüklendi →', this.modelPath);
  }

  /**
   * Senaryoya göre karaciğer rengini değiştir.
   * - 'correct' → yeşil (sağlıklı)
   * - 'wrong'   → koyu kırmızı (hasarlı)
   * - 'default' → doğal karaciğer rengi
   *
   * Gerçek renk uygulaması LiverModelViewer içindeki Three.js materyali üzerinden yapılır.
   */
  setColorState(state: ModelColorState): void {
    this.currentColor = state;
    console.log(`ARModel: Renk durumu → ${state}`);
  }

  /**
   * Modeli sıfırla (senaryo yeniden başladığında kullan).
   */
  reset(): void {
    this.currentColor = 'default';
    console.log('ARModel: Sıfırlandı.');
  }
}

// Uygulama genelinde tek model örneği (singleton)
export const liverModel = new ARModel(
  'assets/models/hati__liver_3d_modelling.glb'
);
