// Dialogue de confirmation, exposé via une API impérative :
//   const confirm = useConfirm();
//   if (await confirm({ title: '…', destructive: true })) { … }
//
// Sur web : Modal maison stylé (Alert.alert y est peu fiable).
// Sur natif : Alert.alert, car un <Modal> RN monté à la racine ne peut pas se
// présenter par-dessus un écran ouvert en `presentation: 'modal'` (iOS fige).
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style « danger » sur le bouton de confirmation (suppression, etc.). */
  destructive?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Renvoie `confirm(options) => Promise<boolean>`. À utiliser sous `ConfirmProvider`. */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm doit être utilisé dans un ConfirmProvider');
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    // Natif : Alert.alert se présente de façon fiable, y compris au-dessus d'un
    // écran modal (sinon iOS fige et aucune popup n'apparaît).
    if (Platform.OS !== 'web') {
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          opts.title,
          opts.message,
          [
            { text: opts.cancelLabel ?? 'Annuler', style: 'cancel', onPress: () => resolve(false) },
            {
              text: opts.confirmLabel ?? 'Confirmer',
              style: opts.destructive ? 'destructive' : 'default',
              onPress: () => resolve(true),
            },
          ],
          { cancelable: true, onDismiss: () => resolve(false) },
        );
      });
    }
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  }, []);

  const value = useMemo(() => confirm, [confirm]);
  const visible = options !== null;
  const confirmColor = options?.destructive ? theme.danger : theme.accent;
  const confirmTextColor = options?.destructive ? '#fff' : theme.onAccent;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => settle(false)}>
        <Pressable style={styles.backdrop} onPress={() => settle(false)}>
          {/* Stoppe la propagation pour que cliquer DANS la boîte ne ferme pas. */}
          <Pressable style={styles.center} onPress={() => {}}>
            <ThemedView type="backgroundElement" style={styles.sheet}>
              <ThemedText type="subtitle">{options?.title}</ThemedText>
              {options?.message ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
                  {options.message}
                </ThemedText>
              ) : null}

              <View style={styles.actions}>
                <Pressable
                  onPress={() => settle(false)}
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <ThemedText type="smallBold">{options?.cancelLabel ?? 'Annuler'}</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => settle(true)}
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: confirmColor, opacity: pressed ? 0.8 : 1 },
                  ]}>
                  <ThemedText type="smallBold" style={{ color: confirmTextColor }}>
                    {options?.confirmLabel ?? 'Confirmer'}
                  </ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </ConfirmContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  center: { width: '100%', maxWidth: 360 },
  sheet: { borderRadius: Spacing.three, padding: Spacing.four, gap: Spacing.two },
  message: { lineHeight: 20 },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
});
