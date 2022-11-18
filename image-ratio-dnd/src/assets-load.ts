import AssetsFrame from "./frame";
import { loadImage } from "./utils";

class Assets extends Map<string, any> {
  async save(key: string, value: any) {
    const {type, data} = value;
    if (type === 'frame') {
      const img = await loadImage(data) as HTMLImageElement;
      const assetsFrame = new AssetsFrame(img);
      this.set(key, {
        data: assetsFrame,
        type: value.type,
        ...value.options && {options: value.options}
      })
    }
    else if (type === 'image') {
      const img = await loadImage(data) as HTMLImageElement;
      this.set(key, {
        data: img ?? null,
        type: value.type
      })
    }
  }
}

export default Assets;