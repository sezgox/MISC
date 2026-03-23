// Incluye todos los formatos de imagen en la carpeta gallery
const galleryFiles = import.meta.glob('../../assets/puzzle/gallery/*.{svg,jpg,jpeg,png,webp,gif}', {
  eager: true,
  import: 'default'
});

const nameMap = {
  bosque: 'Bosque',
  oceano: 'Oceano',
  safari: 'Safari'
};

function fileNameToDisplayName(fileName) {
  const id = fileName.replace(/\.[^.]+$/, '');
  if (nameMap[id]) return nameMap[id];
  return id
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const puzzleGallery = Object.entries(galleryFiles)
  .map(([path, url]) => {
    const fileName = path.split('/').pop();
    const id = fileName.replace(/\.[^.]+$/, '');
    return {
      id,
      name: fileNameToDisplayName(fileName),
      previewKey: `puzzle-gallery-${id}`,
      url
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));
