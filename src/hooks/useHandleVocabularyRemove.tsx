import { useCallback } from 'react';
import { useDeleteVocabularyMutation } from '../API/Redux/reduxQueryFetch';
import { VocabularyType } from '../types/APITypes';
import { extractMultipleAudioAndImageSrc } from '../utils/extractAudioAndImageSrc';

export default function useHandleVocabularyRemove() {
  const [deleteVocabulary] = useDeleteVocabularyMutation();

  const handleVocabularyRemove = useCallback(
    async (vocabulary: VocabularyType | null) => {
      if (!vocabulary) return;

      try {
        const audioSrcs = extractMultipleAudioAndImageSrc(vocabulary.audio_name);
        const imgSource1 = extractMultipleAudioAndImageSrc(vocabulary.front_desc_html);
        const imgSource2 = extractMultipleAudioAndImageSrc(vocabulary.back_desc_html);

        const combinedSources = [...new Set([...audioSrcs, ...imgSource1, ...imgSource2])];
        const ifSourceIsUnique: string[] = [];

        await Promise.all(combinedSources.map(async (element) => {
          const response = await window.electronAPI.invoke('check-if-img-or-audio-exists', {
            vocabularyId: vocabulary.vocabulary_id,
            html: `%${element}%`,
          });
          if (response[0].count === 0) {
            ifSourceIsUnique.push(element);
          }
        }));

        await deleteVocabulary(vocabulary.vocabulary_id).unwrap();

        if (ifSourceIsUnique.length > 0) {
          ifSourceIsUnique.forEach((element) => {
            window.electronAPI.send('remove-file-from-public', {
              uniqueFilename: element,
            });
          });
        }
      } catch (error) {
        console.error('Error during vocabulary deletion or file removal:', error);
      }
    },
    [deleteVocabulary],
  );

  return handleVocabularyRemove;
}
