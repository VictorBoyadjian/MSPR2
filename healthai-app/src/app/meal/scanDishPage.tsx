import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { scanDishService } from '@/services/scanDishService';

type Phase = 'camera' | 'preview' | 'loading';

export default function ScanDishPage() {
  const router = useRouter();
  const theme = useTheme();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('camera');
  const [cameraReady, setCameraReady] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
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

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
        setError('');
        setPhase('preview');
      }
    } catch {
      setError("Impossible d'ouvrir la galerie");
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
      router.replace({
        pathname: '/meal/add-form',
        params: { aliments: JSON.stringify(response.aliments) },
      });
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
                onPress={pickFromGallery}
                style={[styles.galleryButton, { borderColor: theme.text }]}>
                <SymbolView
                  name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }}
                  size={26}
                  tintColor={theme.text}
                />
              </Pressable>

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
  captureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.four },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  error: { color: '#e5484d' },
});
