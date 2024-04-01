export function extractSingleAudioAndImageSrc(html: string | null | undefined) {
  if (!html) return;

  const parser = new DOMParser();
  let newHtml: string | null = html;

  if (newHtml) {
    const doc = parser.parseFromString(newHtml, 'text/html');
    const src = doc.querySelector('audio, img')?.getAttribute('src');

    if (src) {
      newHtml = src;
    } else {
      newHtml = null;
    }
  }
  return newHtml;
}

export function extractMultipleAudioAndImageSrc(
  html: string | null | undefined,
) {
  if (!html) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const mediaElements = doc.querySelectorAll('audio, img');

  const srcs = Array.from(mediaElements)
    .map((element) => element.getAttribute('src'))
    .filter((src) => src !== null);

  return srcs;
}
