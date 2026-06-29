import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { postService } from '@/services/postService';
import { useAuthStore } from '@/stores/authStore';
import { contentText } from '@/types/posts.type';

type PickedImage = { uri: string; name?: string; type?: string };

export default function NewPostScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id;

  const [text, setText] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);
  /** En édition : l'image déjà publiée (conservée telle quelle, non modifiable ici). */
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    postService
      .getById(id)
      .then((post) => {
        if (!post) return;
        setText(contentText(post.content));
        setExistingImage(post.medias?.[0]?.original_url ?? null);
      })
      .catch((err) => console.error('NewPost.load error:', err));
  }, [id]);

  const pick = async (fromCamera: boolean) => {
    setError('');
    try {
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });

      const asset = !result.canceled ? result.assets[0] : null;
      if (asset?.uri) {
        setImage({ uri: asset.uri, name: asset.fileName ?? undefined, type: asset.mimeType ?? undefined });
      }
    } catch {
      setError(fromCamera ? "Impossible d'ouvrir l'appareil photo." : "Impossible d'ouvrir la galerie.");
    }
  };

  const submit = async () => {
    if (!user?.id) return;
    if (editing ? !text.trim() : !text.trim() && !image) return;
    setSubmitting(true);
    setError('');
    try {
      if (editing && id) {
        await postService.update(id, text.trim());
      } else {
        await postService.create({
          text: text.trim(),
          userId: user.id,
          imageUri: image?.uri ?? null,
          imageName: image?.name,
          imageType: image?.type,
        });
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : editing ? "Échec de l'enregistrement." : 'Échec de la publication.');
      setSubmitting(false);
    }
  };

  const canSubmit =
    !!user?.id && (editing ? text.trim().length > 0 : text.trim().length > 0 || !!image) && !submitting;

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title={editing ? 'Modifier le post' : 'Nouveau post'} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Quoi de neuf ?"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.borderStrong },
            ]}
          />

          {editing ? (
            existingImage ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: existingImage }} style={styles.preview} contentFit="cover" />
                <ThemedText type="small" themeColor="textSecondary">
                  La photo n&apos;est pas modifiable ici.
                </ThemedText>
              </View>
            ) : null
          ) : image ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: image.uri }} style={styles.preview} contentFit="cover" />
              <Pressable
                onPress={() => setImage(null)}
                hitSlop={8}
                style={[styles.removeBtn, { backgroundColor: theme.background }]}>
                <Icon name="close" size={18} color={theme.text} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.pickRow}>
              <Pressable
                onPress={() => pick(false)}
                style={({ pressed }) => [
                  styles.pickBtn,
                  { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
                ]}>
                <Icon name="image" size={20} color={theme.text} />
                <ThemedText type="small">Galerie</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => pick(true)}
                style={({ pressed }) => [
                  styles.pickBtn,
                  { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
                ]}>
                <Icon name="camera" size={20} color={theme.text} />
                <ThemedText type="small">Photo</ThemedText>
              </Pressable>
            </View>
          )}

          {error ? (
            <ThemedText type="small" style={{ color: theme.danger }}>
              {error}
            </ThemedText>
          ) : null}

          <Button
            label={editing ? 'Enregistrer' : 'Publier'}
            onPress={submit}
            loading={submitting}
            disabled={!canSubmit}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  content: { padding: Spacing.four, gap: Spacing.three },
  input: {
    minHeight: 120,
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  pickRow: { flexDirection: 'row', gap: Spacing.three },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  previewWrap: { position: 'relative' },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Spacing.two,
  },
  removeBtn: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
