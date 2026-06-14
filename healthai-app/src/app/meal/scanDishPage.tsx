import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { scanDishService } from '@/services/scanDishService';
import { ScanDishResponse } from '@/types/san-dish-response.type';

type Phase = 'camera' | 'preview' | 'loading' | 'result';

export default function ScanDishPage() {
  const router = useRouter();
  const theme = useTheme();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('camera');
  const [cameraReady, setCameraReady] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<ScanDishResponse | null>(null);
  const [error, setError] = useState('');

  const takePhoto = async () => {
    if (!cameraRef.current || !cameraReady) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setPhase('preview');
      }
    } catch {
      setError("Impossible de prendre la photo");
    }
  };

  const retake = () => {
    setPhotoUri(null);
    setError('');
    setPhase('camera');
  };

  const confirm = async () => {
    if (!photoUri) return;
    setError('');
    setPhase('loading');
    try {
      const response = await scanDishService.scan(photoUri);
      console.log("ScanDishPage: response from scanDishService.scan:", response);
      setResult(response);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'analyse");
      setPhase('preview');
    }
  };

  // --- Gestion des permissions caméra ---
  if (!permission) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.text} />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="default" style={styles.permissionText}>
          Nous avons besoin de l&apos;accès à la caméra pour scanner votre plat.
        </ThemedText>
        <Button label="Autoriser la caméra" onPress={requestPermission} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Scanner mon plat</ThemedText>

          {/* Zone carrée : caméra ou aperçu */}
          <View style={styles.square}>
            {phase === 'camera' && (
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="back"
                onCameraReady={() => setCameraReady(true)}
              />
            )}

            {(phase === 'preview' || phase === 'loading') && photoUri && (
              <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
            )}

            {phase === 'loading' && (
              <View style={styles.overlay}>
                <ActivityIndicator size="large" color="#fff" />
                <ThemedText type="small" style={styles.overlayText}>
                  Analyse en cours…
                </ThemedText>
              </View>
            )}
          </View>

          {error ? (
            <ThemedText type="small" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          {/* Contrôles selon la phase */}
          {phase === 'camera' && (
            <View style={styles.captureRow}>
              <Pressable
                onPress={takePhoto}
                disabled={!cameraReady}
                style={[styles.shutterOuter, { borderColor: theme.text, opacity: cameraReady ? 1 : 0.4 }]}>
                <View style={[styles.shutterInner, { backgroundColor: theme.text }]} />
              </Pressable>
            </View>
          )}

          {phase === 'preview' && (
            <View style={styles.actions}>
              <Button label="Valider" onPress={confirm} />
              <Button label="Reprendre" variant="secondary" onPress={retake} />
            </View>
          )}

          {phase === 'result' && result && (
            <View style={styles.results}>
              <ThemedText type="smallBold">Résultat de l&apos;analyse</ThemedText>
              {Object.keys(result.aliments).length === 0 ? (
                <ThemedText type="small">Aucun aliment détecté.</ThemedText>
              ) : (
                Object.entries(result.aliments).map(([name, food]) => (
                  <View
                    key={name}
                    style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText type="smallBold">{name}</ThemedText>
                    <ThemedText type="small">Quantité : {food.quantity_g} g</ThemedText>
                    <ThemedText type="small">Calories : {food.calories_kcal} kcal</ThemedText>
                    <ThemedText type="small">Protéines : {food.proteins_g} g</ThemedText>
                    <ThemedText type="small">Glucides : {food.carbs_g} g</ThemedText>
                    <ThemedText type="small">Lipides : {food.fats_g} g</ThemedText>
                    <ThemedText type="small">Fibres : {food.fiber_g} g</ThemedText>
                    <ThemedText type="small">
                      Précision : {Math.round(food.accuracy * 100)} %
                    </ThemedText>
                  </View>
                ))
              )}
              <Button label="Scanner un autre plat" onPress={retake} />
            </View>
          )}

          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four, gap: Spacing.three },
  permissionText: { textAlign: 'center' },
  content: { padding: Spacing.four, gap: Spacing.four },
  square: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    gap: Spacing.two,
  },
  overlayText: { color: '#fff' },
  captureRow: { alignItems: 'center' },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: { width: 56, height: 56, borderRadius: 28 },
  actions: { gap: Spacing.two },
  results: { gap: Spacing.three },
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
  error: { color: '#e5484d' },
});
