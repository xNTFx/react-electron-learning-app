import '@sweetalert2/theme-dark/dark.css';
import { Editor } from '@tiptap/core';
import { useCallback, useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetDecksQuery } from '../API/Redux/reduxQueryFetch';
import DeckSelection from '../components/AddVocabularyComponents/DeckSelection';
import EditorButtonList from '../components/AddVocabularyComponents/TipTap/EditorButtonList';
import EditorTipTap from '../components/AddVocabularyComponents/TipTap/EditorTipTap';
import useInsertOrUpdateVocabulary from '../hooks/useInsertOrUpdateVocabulary';
import {
  AddVocabularyScreenProps,
  EditorInputValuesType,
} from '../types/TypeScriptTypes';

export default function AddVocabularyScreen({
  selectedDeck = null,
}: AddVocabularyScreenProps) {
  const {
    data: deckList,
    error: deckListError,
    isLoading: deckListIsLoading,
  } = useGetDecksQuery();

  const { id } = useParams();
  const navigate = useNavigate();

  const [inputNames] = useState([
    'Front word',
    'Back word',
    'Audio',
    'Front word description',
    'Back word description',
  ]);

  const [currentDeckName, setCurrentDeckName] = useState('');
  const [editorsList, setEditorsList] = useState<Editor[]>([]);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [hiddenInputs, setHiddenInputs] = useState<number[]>([]);

  const handleVocabularyButton = useInsertOrUpdateVocabulary(
    editorsList,
    selectedDeck,
    currentDeckName,
    deckList,
    setEditorsList,
  );

  const editorInputValues: EditorInputValuesType = {
    0: selectedDeck?.front_word_html?.toString() ?? '',
    1: selectedDeck?.back_word_html?.toString() ?? '',
    2: selectedDeck?.audio_name?.toString() ?? '',
    3: selectedDeck?.front_desc_html?.toString() ?? '',
    4: selectedDeck?.back_desc_html?.toString() ?? '',
  };

  function hiddenInputsFunction(inputId: number) {
    if (inputId === 0 || inputId === 1) return;
    if (hiddenInputs?.some((input) => input === inputId)) {
      setHiddenInputs((inputs) =>
        inputs.filter((input) => {
          return input !== inputId;
        }),
      );
    } else {
      setHiddenInputs([...hiddenInputs, inputId]);
    }
  }
  function IsInputHidden(inputId: number) {
    return hiddenInputs?.some((input) => input === inputId);
  }

  const handleEditorUpdate = useCallback(
    //This avoids unnecessary re-renders when editor is not changed
    (editor: Editor) => {
      if (editorsList.length >= 5) return; // This prevents adding more than 5 editors to the list
      setEditorsList((prev) => [...prev, editor]);
    },
    [editorsList],
  );

  function NoDeckScreen() {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-[#1F1F1F] font-bold text-white">
        <div className="flex h-2/5 flex-col items-center justify-center gap-3">
          <h1 className="text-3xl">
            You cannot add a vocabulary when there is no deck
          </h1>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-[#382bf0] p-2 font-extrabold hover:bg-[#5e43f3]"
          >
            Go back to decks
          </button>
        </div>
      </div>
    );
  }

  if (!deckList) return;

  if (deckListError) {
    console.error(deckListError);
    return;
  }

  if (deckList?.length === 0) return <NoDeckScreen />;

  if (deckListIsLoading || deckListIsLoading) return <div>Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col items-center justify-center overflow-auto bg-[#1F1F1F]">
      <div className="mt-10 w-8/12 bg-black">
        {!selectedDeck && id === '0' ? (
          <DeckSelection
            deckList={deckList}
            currentDeckName={currentDeckName}
            setCurrentDeckName={setCurrentDeckName}
          />
        ) : null}
      </div>
      <div className="relative mt-2 flex h-full w-8/12 flex-col items-center overflow-auto rounded-t-lg bg-[#2C2C2C] text-white max-md:w-10/12">
        <div className="sticky top-0 z-50 w-full">
          <EditorButtonList
            editorsList={editorsList}
            activeEditor={activeEditor ? activeEditor : editorsList[0]}
          />
        </div>
        <div className="w-full">
          <div>
            {inputNames.map((item, index) => {
              return (
                <div key={index} className="px-6 py-2">
                  <button
                    onClick={() => hiddenInputsFunction(index)}
                    className="mb-1 flex flex-row items-center gap-1"
                    style={{
                      cursor:
                        index === 0 || index === 1 ? 'default' : 'pointer',
                    }}
                  >
                    {index === 0 || index === 1 ? null : IsInputHidden(
                        index,
                      ) ? (
                      <FaAngleUp />
                    ) : (
                      <FaAngleDown />
                    )}
                    <p>{item}</p>
                  </button>
                  <div
                    style={{
                      display: hiddenInputs?.some((input) => input === index)
                        ? 'none'
                        : 'initial',
                    }}
                    className="flex flex-row"
                  >
                    <div className="w-full">
                      <EditorTipTap
                        index={index}
                        setActiveEditor={setActiveEditor}
                        onEditorUpdate={handleEditorUpdate}
                        initialValue={editorInputValues[index].toString()} //value of inputs if user want to update a card
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <button
          className="m-4 rounded-xl bg-[#382bf0] p-2 font-extrabold hover:bg-[#5e43f3]"
          onClick={handleVocabularyButton}
        >
          {selectedDeck ? 'Update vocabulary' : 'Post vocabulary'}
        </button>
      </div>
    </div>
  );
}
