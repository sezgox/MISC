import memoryConfig from '../../consts/memory.json';

const themeFiles = import.meta.glob('../../assets/memory/themes/*/*.{svg,png,jpg,jpeg,webp,avif,gif}', {
  eager: true,
  import: 'default'
});

const cardBackFile = import.meta.glob('../../assets/memory/card-back.svg', {
  eager: true,
  import: 'default'
});

const cardBackPath = '../../assets/memory/card-back.svg';
export const memoryCardBack = cardBackFile[cardBackPath] ?? new URL(cardBackPath, import.meta.url).href;

const normalizePath = (value) => String(value ?? '').replace(/\\/g, '/').replace(/^\/+/, '');

const normalizeThemeFilePath = (value) => normalizePath(value).replace(/^\.\.\/\.\.\//, 'src/');

const toDisplayName = (key) =>
  String(key ?? '')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const isCardConfig = (value) =>
  Boolean(value && typeof value === 'object' && typeof value.imageUrl === 'string');

const configThemes = memoryConfig?.themes && typeof memoryConfig.themes === 'object' ? memoryConfig.themes : {};

const assetUrlByPath = new Map();
const assetByThemeAndId = new Map();
const discoveredThemeKeys = new Set();

Object.entries(themeFiles).forEach(([filePath, fileUrl]) => {
  const normalized = normalizeThemeFilePath(filePath);
  const relativeThemePath = normalized.replace(/^src\/assets\/memory\/themes\//, '');
  const [themeKey, fileName] = relativeThemePath.split('/');
  if (!themeKey || !fileName) {
    return;
  }

  discoveredThemeKeys.add(themeKey);
  assetUrlByPath.set(normalized, fileUrl);
  assetUrlByPath.set(`/${normalized}`, fileUrl);
  assetUrlByPath.set(`src/assets/memory/themes/${themeKey}/${fileName}`, fileUrl);
  assetUrlByPath.set(`/src/assets/memory/themes/${themeKey}/${fileName}`, fileUrl);
  assetUrlByPath.set(`assets/memory/themes/${themeKey}/${fileName}`, fileUrl);
  assetUrlByPath.set(`/assets/memory/themes/${themeKey}/${fileName}`, fileUrl);
  assetUrlByPath.set(`themes/${themeKey}/${fileName}`, fileUrl);
  assetUrlByPath.set(`/themes/${themeKey}/${fileName}`, fileUrl);

  const cardId = fileName.replace(/\.[^.]+$/, '');
  if (!assetByThemeAndId.has(themeKey)) {
    assetByThemeAndId.set(themeKey, new Map());
  }
  assetByThemeAndId.get(themeKey).set(cardId, fileUrl);
});

const resolveCardImageUrl = (themeKey, cardId, rawImageUrl) => {
  const normalizedImagePath = normalizePath(rawImageUrl);
  if (normalizedImagePath && assetUrlByPath.has(normalizedImagePath)) {
    return assetUrlByPath.get(normalizedImagePath);
  }

  const themeAssets = assetByThemeAndId.get(themeKey);
  if (themeAssets?.has(cardId)) {
    return themeAssets.get(cardId);
  }

  if (/^(https?:|data:|blob:)/.test(String(rawImageUrl ?? ''))) {
    return rawImageUrl;
  }

  return '';
};

const themeKeys = Array.from(discoveredThemeKeys)
  .filter((themeKey) => Boolean(configThemes[themeKey]))
  .sort((a, b) => a.localeCompare(b));

export const memoryThemes = themeKeys
  .map((themeKey) => {
    const themeConfig = configThemes[themeKey];
    const cards = Object.entries(themeConfig)
      .filter(([cardId, value]) => cardId !== 'name' && isCardConfig(value))
      .map(([cardId, cardConfig]) => {
        const imageUrl = resolveCardImageUrl(themeKey, cardId, cardConfig.imageUrl);
        if (!imageUrl) {
          console.warn(`[memory] No se encontro imagen para ${themeKey}/${cardId}`);
          return null;
        }

        const title = typeof cardConfig.title === 'string' && cardConfig.title.trim() ? cardConfig.title : toDisplayName(cardId);
        const description = typeof cardConfig.description === 'string' ? cardConfig.description : '';
        const textureKey = `memory-${themeKey}-${cardId}`;

        return {
          id: cardId,
          key: textureKey,
          imageUrl,
          title,
          description,
          url: imageUrl
        };
      })
      .filter(Boolean);

    if (cards.length === 0) {
      return null;
    }

    const name = typeof themeConfig.name === 'string' && themeConfig.name.trim() ? themeConfig.name : toDisplayName(themeKey);
    return {
      key: themeKey,
      name,
      cards
    };
  })
  .filter(Boolean);
