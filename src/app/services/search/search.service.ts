import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor() { }

  /**
   * Filtre un tableau d'objets selon une query sur toutes les colonnes spécifiées
   * @param data Tableau à filtrer
   * @param query Texte recherché
   * @param keys Colonnes sur lesquelles faire la recherche (si vide -> toutes les clés)
   */
  filter<T extends Record<string, any>>(data: T[], query: string, keys: string[] = []): T[] {
    if (!query || !query.trim()) return data;
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return data.filter(item => {
      const searchKeys = keys.length ? keys : Object.keys(item);
      return searchKeys.some(k => {
        const v = item?.[k];
        if (v === null || v === undefined) return false;
        const s = String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return s.includes(q);
      });
    });
  }
}
