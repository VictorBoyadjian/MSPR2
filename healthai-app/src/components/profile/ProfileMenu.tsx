import { SymbolView } from 'expo-symbols';
import { ComponentProps, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileMenu() {
  const { user, logout, deleteAccount } = useAuth();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    logout();
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est définitive. Toutes vos données seront supprimées. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            close();
            try {
              await deleteAccount();
            } catch {
              Alert.alert('Erreur', "Impossible de supprimer le compte pour le moment.");
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profil"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.iconButton,
          { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
        ]}>
        <SymbolView
          name={{ ios: 'person.fill', android: 'person', web: 'person' }}
          size={20}
          tintColor={theme.text}
          fallback={<ThemedText type="smallBold">👤</ThemedText>}
        />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.sheetWrapper} onPress={() => {}}>
            <ThemedView type="backgroundElement" style={styles.sheet}>
              <ThemedView type="backgroundElement" style={styles.identity}>
                <ThemedText type="smallBold">
                  {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Mon compte'}
                </ThemedText>
                {user?.email ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {user.email}
                  </ThemedText>
                ) : null}
              </ThemedView>

              <ThemedView style={[styles.separator, { backgroundColor: theme.backgroundSelected }]} />

              <MenuItem
                icon={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
                label="Se déconnecter"
                onPress={handleLogout}
                color={theme.text}
              />
              <MenuItem
                icon={{ ios: 'trash.fill', android: 'delete', web: 'delete' }}
                label="Supprimer mon compte"
                onPress={handleDelete}
                color="#E5484D"
              />
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

type SymbolName = ComponentProps<typeof SymbolView>['name'];

function MenuItem({
  icon,
  label,
  onPress,
  color,
}: {
  icon: SymbolName;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
      <SymbolView name={icon} size={18} tintColor={color} />
      <ThemedText type="small" style={{ color }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheetWrapper: {
    position: 'absolute',
    top: 96,
    right: Spacing.four,
  },
  sheet: {
    minWidth: 220,
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: Spacing.half,
  },
  identity: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.one,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  itemPressed: {
    opacity: 0.6,
  },
});
