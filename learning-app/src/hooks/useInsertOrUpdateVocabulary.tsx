import { Editor } from '@tiptap/core';
import { useParams } from 'react-router-dom';

import {
  useAddVocabularyMutation,
  useUpdateVocabularyMutation,
} from '../API/Redux/reduxQueryFetch';
import { GetDecksType, VocabularyType } from '../types/APITypes';
import { transformFilePathToAudioElement } from '../utils/categorizeFileType';
import errorAlert from '../utils/errorAlert';
import modifyHTMLAndCopyFiles from '../utils/modifyHTMLAndCopyFiles';

export default function useInsertOrUpdateVocabulary(
  editorsList: Editor[],
  selectedDeck: VocabularyType | null,
  currentDeckName: string,
  deckList: GetDecksType[] | undefined,
  setEditorsList: React.Dispatch<React.SetStateAction<Editor[]>>,
) {
  const { id } = useParams();

  const [addVocabulary, { error: addVocabularyError }] =
    useAddVocabularyMutation();
  const [updateVocabulary, { error }] = useUpdateVocabularyMutation();

  if (error || addVocabularyError) {
    console.error(error);
    console.error(addVocabularyError);
    return;
  }

  function findDeckIdByName(deckName: string) {
    const deck = deckList?.find((deck) => deck.deck_name === deckName);
    return deck ? deck.deck_id : 0;
  }

  async function handleVocabularyButton() {
    if (
      editorsList[0] &&
      editorsList[1] &&
      editorsList[0].getText().trim().length === 0 &&
      editorsList[1].getText().trim().length === 0
    ) {
      errorAlert('Front and Back word fields cannot be empty', 'warning');
      return;
    }
    if (editorsList[0].getText().trim().length === 0) {
      errorAlert('Front word field cannot be empty', 'warning');
      return;
    }
    if (editorsList[1].getText().trim().length === 0) {
      errorAlert('Back word field cannot be empty', 'warning');
      return;
    }

    if (!selectedDeck && id && deckList) {
      const deckId =
        id === '0'
          ? currentDeckName === ''
            ? deckList[0].deck_id
            : Number(findDeckIdByName(currentDeckName))
          : Number(id);

      addVocabulary({
        deckId: deckId,
        frontWord: editorsList[0].getText().trim(),
        backWord: editorsList[1].getText().trim(),
        audioName: transformFilePathToAudioElement(editorsList[2].getText()),
        frontWordHTML: modifyHTMLAndCopyFiles(editorsList[0].getHTML()),
        backWordHTML: modifyHTMLAndCopyFiles(editorsList[1].getHTML()),
        frontDescHTML: modifyHTMLAndCopyFiles(editorsList[3].getHTML()),
        backDescHTML: modifyHTMLAndCopyFiles(editorsList[4].getHTML()),
      });

      //SetTimeout is only used to fix a strange FlushSync bug that doesn't seem to affect the application
      setTimeout(() => {
        editorsList.forEach((editorElement) => {
          editorElement.commands.setContent(null);
        });
      });

      setEditorsList([]);
    } else if (selectedDeck) {
      await updateVocabulary({
        front_word: editorsList[0].getText().trim(),
        back_word: editorsList[1].getText().trim(),
        audio_name: transformFilePathToAudioElement(editorsList[2].getText()),
        front_word_html: modifyHTMLAndCopyFiles(editorsList[0].getHTML()),
        back_word_html: modifyHTMLAndCopyFiles(editorsList[1].getHTML()),
        front_desc_html: modifyHTMLAndCopyFiles(editorsList[3].getHTML()),
        back_desc_html: modifyHTMLAndCopyFiles(editorsList[4].getHTML()),
        vocabulary_id: Number(selectedDeck.vocabulary_id),
      });
    }
  }
  return handleVocabularyButton;
}
