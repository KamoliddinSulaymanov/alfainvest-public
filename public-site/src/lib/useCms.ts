import { useState, useEffect } from "react";
import { api, type Product, type NewsArticle, type Branch, type SiteSettings, type Page, type Locale } from "./api";

type State<T> = { data: T | null; loading: boolean; error: string | null };

function useQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = []): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    fetcher()
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((err) => { if (!cancelled) setState({ data: null, loading: false, error: String(err) }); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export const useProducts = (locale: Locale = "ru") =>
  useQuery<Product[]>(() => api.getProducts(locale), [locale]);

export const useProduct = (id: number, locale: Locale = "ru") =>
  useQuery<Product | null>(() => api.getProductById(id, locale), [id, locale]);

export const useNews = (limit = 10, category?: string, locale: Locale = "ru") =>
  useQuery<NewsArticle[]>(() => api.getNews({ limit, category, locale }), [limit, category, locale]);

export const useNewsBySlug = (slug: string, locale: Locale = "ru") =>
  useQuery<NewsArticle | null>(() => api.getNewsBySlug(slug, locale), [slug, locale]);

export const useBranches = (locale: Locale = "ru") =>
  useQuery<Branch[]>(() => api.getBranches(locale), [locale]);

export const useSettings = (locale: Locale = "ru") =>
  useQuery<SiteSettings>(() => api.getSettings(locale), [locale]);

export const usePage = (slug: string, locale: Locale = "ru") =>
  useQuery<Page | null>(() => api.getPageBySlug(slug, locale), [slug, locale]);
