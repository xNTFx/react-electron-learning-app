import { categorizeFileType } from './categorizeFileType';
import { handleFileCopied } from './handleFileLogic';

export default function modifyHTMLAndCopyFiles(htmlString: string) {
  //Removing empty <p></p>
  htmlString = htmlString.replace(/<p>\s*<\/p>/g, '');

  //Replace src with alt
  const regex =
    /<(img|audio|movie)([^>]+)src="([^"]*)"([^>]+)alt="([^"]*)"([^>]*)>/g;

  let match;
  const srcBefore = [];
  const srcAfter: string[] = [];

  //Extract src before replacement
  while ((match = regex.exec(htmlString)) !== null) {
    srcBefore.push(match[3]);
  }

  //Extract src after replacement
  const updatedHtmlString = htmlString.replace(
    regex,
    (_match, tag, prefix, _src, middle, altValue, suffix) => {
      const newSrc = `${altValue}`;
      srcAfter.push(newSrc);
      return `<${tag}${prefix}src="${newSrc}"${middle}alt="${newSrc}"${suffix}>`;
    },
  );

  //List of unique src files
  const newSrcBefore = [...new Set(srcBefore)];
  const newSrcAfter = [...new Set(srcAfter)];

  for (let i = 0; i < newSrcAfter.length; i++) {
    if (
      newSrcBefore[i].split('/')[0] !== 'images' &&
      newSrcBefore[i].split('/')[0] !== 'audio' &&
      newSrcBefore[i].split('/')[0] !== 'movies'
    ) {
      handleFileCopied(
        newSrcAfter[i],
        categorizeFileType(newSrcAfter[i]),
        newSrcBefore[i],
      );
    }
  }

  return updatedHtmlString;
}
