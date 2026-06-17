import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { UserSession } from '@/types/workout-sessions.type';
import { apiDateToIso, formatTime } from '@/utils/formatDate';
import { isSameDay } from '@/utils/day';

const HOUR_HEIGHT = 64;
const GUTTER = 52;
const MIN_BLOCK_MIN = 40; // durée d'affichage minimale d'un bloc
const DEFAULT_DURATION_MIN = 60;

type Props = {
  day: Date;
  sessions: UserSession[];
  onPress: (session: UserSession) => void;
};

type Placed = {
  session: UserSession;
  start: number; // minutes depuis minuit
  end: number;
  col: number;
  cols: number;
};

/** Répartit les séances qui se chevauchent en colonnes côte à côte. */
function layout(sessions: UserSession[]): Placed[] {
  const items = sessions
    .map((session) => {
      const start = new Date(apiDateToIso(session.performedAt));
      const startMin = start.getHours() * 60 + start.getMinutes();
      const duration = Math.max(session.total_duration_min ?? DEFAULT_DURATION_MIN, MIN_BLOCK_MIN);
      return { session, start: startMin, end: startMin + duration, col: 0, cols: 1 };
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);

  let group: Placed[] = [];
  let groupEnd = -1;

  const flush = () => {
    const cols = Math.max(...group.map((g) => g.col)) + 1;
    group.forEach((g) => (g.cols = cols));
    group = [];
  };

  for (const item of items) {
    // Nouveau cluster dès qu'une séance commence après la fin de tout le groupe.
    if (group.length && item.start >= groupEnd) {
      flush();
      groupEnd = -1;
    }
    // première colonne libre (dont le dernier événement est terminé)
    const colEnds: number[] = [];
    for (const g of group) colEnds[g.col] = Math.max(colEnds[g.col] ?? 0, g.end);
    let col = 0;
    while (colEnds[col] !== undefined && colEnds[col] > item.start) col += 1;
    item.col = col;
    group.push(item);
    groupEnd = Math.max(groupEnd, item.end);
  }
  if (group.length) flush();

  return items;
}

export default function DayTimetable({ day, sessions, onPress }: Props) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const placed = useMemo(() => layout(sessions), [sessions]);

  // Fenêtre d'heures affichée : 7h–21h par défaut, élargie pour couvrir les séances.
  const { startHour, endHour } = useMemo(() => {
    let min = 7;
    let max = 21;
    for (const p of placed) {
      min = Math.min(min, Math.floor(p.start / 60));
      max = Math.max(max, Math.ceil(p.end / 60));
    }
    return { startHour: Math.max(0, min), endHour: Math.min(24, Math.max(max, min + 1)) };
  }, [placed]);

  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour],
  );

  // Horloge locale rafraîchie chaque minute (le trait « maintenant » suit l'heure).
  // `performedAt` et `now` sont tous deux convertis en heure locale (cf. apiDateToIso),
  // donc la comparaison est cohérente quel que soit le fuseau renvoyé par l'API.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const isToday = isSameDay(day, now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowTop = (nowMin - startHour * 60) * (HOUR_HEIGHT / 60);
  const showNow = isToday && nowMin >= startHour * 60 && nowMin <= endHour * 60;

  // Au montage / changement de jour : on cadre sur l'heure actuelle (aujourd'hui),
  // sinon sur la première séance, avec ~1h30 de contexte au-dessus.
  useEffect(() => {
    const current = new Date();
    const target = isToday
      ? current.getHours() * 60 + current.getMinutes()
      : placed.length
        ? placed[0].start
        : startHour * 60;
    const y = Math.max(0, (target - startHour * 60) * (HOUR_HEIGHT / 60) - HOUR_HEIGHT * 1.5);
    const id = setTimeout(() => scrollRef.current?.scrollTo({ y, animated: false }), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, placed.length, isToday, startHour]);

  const contentHeight = (endHour - startHour) * HOUR_HEIGHT;

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ height: contentHeight + Spacing.four }}>
        {/* Lignes horaires + libellés */}
        {hours.map((h) => {
          const top = (h - startHour) * HOUR_HEIGHT;
          return (
            <View key={h} style={[styles.hourRow, { top }]} pointerEvents="none">
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.hourLabel}
                numberOfLines={1}
                allowFontScaling={false}>
                {`${String(h).padStart(2, '0')}:00`}
              </ThemedText>
              <View style={[styles.hourLine, { backgroundColor: theme.backgroundSelected }]} />
            </View>
          );
        })}

        {/* Indicateur "maintenant" */}
        {showNow ? (
          <View style={[styles.nowRow, { top: nowTop }]} pointerEvents="none">
            <View style={[styles.nowDot, { backgroundColor: '#e5484d' }]} />
            <View style={[styles.nowLine, { backgroundColor: '#e5484d' }]} />
          </View>
        ) : null}

        {/* Séances, dans une piste décalée du gouttière des heures */}
        <View style={styles.track} pointerEvents="box-none">
          {placed.map((p) => {
            const top = (p.start - startHour * 60) * (HOUR_HEIGHT / 60);
            const height = (p.end - p.start) * (HOUR_HEIGHT / 60);
            const colWidthPct = 100 / p.cols;
            const count = p.session.exercises?.length ?? 0;
            const compact = height < HOUR_HEIGHT;
            return (
              <Pressable
                key={p.session.userSessionId}
                onPress={() => onPress(p.session)}
                style={[
                  styles.block,
                  {
                    top: top + 1,
                    height: height - 2,
                    left: `${p.col * colWidthPct}%`,
                    width: `${colWidthPct}%`,
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.backgroundSelected,
                  },
                ]}
              >
                <View style={[styles.blockAccent, { backgroundColor: theme.accent }]} />
                <View style={styles.blockBody}>
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {p.session.name}
                  </ThemedText>
                  {!compact ? (
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                      {formatTime(p.session.performedAt)}
                      {count ? ` · ${count} exercice${count > 1 ? 's' : ''}` : ''}
                    </ThemedText>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: Spacing.two },
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    height: 0,
  },
  hourLabel: {
    width: GUTTER - Spacing.two,
    textAlign: 'right',
    fontSize: 12,
    transform: [{ translateY: -8 }],
  },
  hourLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.two,
  },
  nowRow: {
    position: 'absolute',
    left: GUTTER - Spacing.two,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    height: 0,
    zIndex: 10,
  },
  nowDot: { width: 8, height: 8, borderRadius: 4, marginLeft: -4 },
  nowLine: { flex: 1, height: 1.5 },
  track: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: GUTTER + Spacing.two,
    right: Spacing.one,
  },
  block: {
    position: 'absolute',
    borderRadius: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  blockAccent: { width: 3 },
  blockBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    gap: 2,
  },
});
