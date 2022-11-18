import { AssetData, AssetType } from "@/assets.config";
import assets from "@/assets";

export const state: {path: string; pages: string[]} = {
  path: '',
  pages: []
}

export default {
  get<T>(key: string): {type: AssetType, data: T} {
    if (assets.has(key)) {
      return assets.get(key) as any;
    } else {
      return { type: 'error', data: null } as any;
    }
  },
  set(key: string, type: AssetType, data: AssetData, options?: any) {
    assets.save(key, type, data, options);
  },
  initPath(path: string) {
    state.path = path;
  },
  savePages(pages: string[]) {
    state.pages = pages;
  }
}

