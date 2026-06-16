import { useState } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import Icon, { IconName } from '@/components/ui/Icon';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/use-theme';
import { useThemePreference, type ThemePreference } from '@/stores/themeStore';

export default function ProfileMenu() {
  const { user, logout, deleteAccount } = useAuth();
  const theme = useTheme();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    logout();
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Supprimer le compte',
      message: 'Cette action est définitive. Toutes vos données seront supprimées. Continuer ?',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!ok) return;
    close();
    try {
      await deleteAccount();
    } catch {
      await confirm({
        title: 'Erreur',
        message: 'Impossible de supprimer le compte pour le moment.',
        confirmLabel: 'OK',
        cancelLabel: 'Fermer',
      });
    }
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
        <Icon name="profile-filled" size={20} color={theme.text} />
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

              <ThemeSwitcher />

              <ThemedView style={[styles.separator, { backgroundColor: theme.backgroundSelected }]} />

              <MenuItem
                icon="logout"
                label="Se déconnecter"
                onPress={handleLogout}
                color={theme.text}
              />
              <MenuItem
                icon="trash"
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

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: 'system', label: 'Auto', icon: 'theme-auto' },
  { value: 'light', label: 'Clair', icon: 'theme-light' },
  { value: 'dark', label: 'Sombre', icon: 'theme-dark' },
];

function ThemeSwitcher() {
  const theme = useTheme();
  const { preference, setPreference } = useThemePreference();

  return (
    <ThemedView style={styles.themeBlock}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.themeLabel}>
        Apparence
      </ThemedText>
      <ThemedView style={[styles.segment, { backgroundColor: theme.surface2 }]}>
        {THEME_OPTIONS.map((opt) => {
          const active = preference === opt.value;
          return (
            <Pressable
              key={opt.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Thème ${opt.label}`}
              onPress={() => setPreference(opt.value)}
              style={({ pressed }) => [
                styles.segmentItem,
                active && { backgroundColor: theme.accentSoft },
                pressed && !active && styles.itemPressed,
              ]}>
              <Icon
                name={opt.icon}
                size={16}
                color={active ? theme.accentText : theme.textSecondary}
              />
              <ThemedText
                type="small"
                style={{
                  color: active ? theme.accentText : theme.textSecondary,
                  fontWeight: active ? '700' : '500',
                }}>
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ThemedView>
    </ThemedView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  color,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
      <Icon name={icon} size={18} color={color} />
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
  themeBlock: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    gap: Spacing.two,
  },
  themeLabel: {
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.one + Spacing.half,
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
