import { type Href, useRouter } from 'expo-router';

type Router = ReturnType<typeof useRouter>;

/**
 * Termine un flux ouvert en modale : referme TOUTES les modales empilées,
 * puis bascule (optionnellement) sur un onglet.
 *
 * À utiliser à la fin d'un parcours (ex. ajout d'un repas) plutôt que
 * `router.replace(onglet)` : `replace` ne remplace que la modale du dessus
 * et laisse les précédentes dans la pile — on peut alors les révéler en
 * balayant vers le bas (« onglets fantômes »). `dismissAll` vide la pile.
 */
export function dismissFlow(router: Router, to?: Href) {
  if (router.canDismiss()) router.dismissAll();
  if (to) router.navigate(to);
}
