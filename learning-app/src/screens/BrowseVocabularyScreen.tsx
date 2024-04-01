import { TextField, ThemeProvider, createTheme } from '@mui/material';
import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import DataGrid from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { MdDeleteForever } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import Split from 'react-split';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Swal from 'sweetalert2/dist/sweetalert2.min.js';

import { useGetVocabularyQuery } from '../API/Redux/reduxQueryFetch';
import useHandleVocabularyRemove from '../hooks/useHandleVocabularyRemove';
import { VocabularyType } from '../types/APITypes';
import { extractSingleAudioAndImageSrc } from '../utils/extractAudioAndImageSrc';
import AddVocabularyScreen from './AddVocabularyScreen';

export default function BrowseVocabularyScreen() {
  const { id } = useParams();
  const [inputSearchValue, setInputSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');

  const itemHeight = 35;
  const initialLimit = Math.ceil(window.innerHeight / itemHeight) + 1;
  const [limit, setLimit] = useState(initialLimit);
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const { data, error, isLoading } = useGetVocabularyQuery({
    deckId: Number(id),
    limit,
    offset: 0,
    search: `%${debouncedSearchValue}%`,
  });

  const [selectedDeck, setSelectedDeck] = useState<VocabularyType | null>(null);

  const handleVocabularyRemove = useHandleVocabularyRemove();

  // Ref for tracking whether there is more data to load
  const hasMore = useRef(true);

  useEffect(() => {
    const handleResize = debounce(() => {
      const updatedLimit = Math.ceil(window.innerHeight / itemHeight) + 1;
      setLimit(updatedLimit);
    }, 100);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initialized = useRef(false);

  useEffect(() => {
    if (data && data.length > 0 && !initialized.current) {
      const audioSrc =
        extractSingleAudioAndImageSrc(data[0].audio_name) || null;
      setSelectedDeck({ ...data[0], audio_name: audioSrc });
      initialized.current = true;
    }
  }, [data]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (
      !isLoading &&
      hasMore.current &&
      data &&
      scrollTop + clientHeight >= scrollHeight
    ) {
      hasMore.current = data?.length % initialLimit === 0;
      setLimit((prevOffset) => prevOffset + initialLimit);
    }
  };

  function handleChangeVocabulary(vocabularyId: number) {
    const selectedVocabulary = data?.find(
      (vocabulary: VocabularyType) => vocabulary.vocabulary_id === vocabularyId,
    );

    if (
      selectedVocabulary &&
      selectedDeck &&
      selectedVocabulary.vocabulary_id !== Number(selectedDeck.vocabulary_id)
    ) {
      const audioSrc =
        extractSingleAudioAndImageSrc(selectedVocabulary.audio_name) || null;
      setSelectedDeck({ ...selectedVocabulary, audio_name: audioSrc });
    }
  }

  function handleSearchInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputSearchValue(event?.target.value);
    setTimeout(() => {
      setDebouncedSearchValue(event?.target.value);
    }, 500);
  }

  function findVocabularyById(vocabularyId: number) {
    const vocabulary = data?.find((voc) => voc.vocabulary_id === vocabularyId);
    return vocabulary ? vocabulary : null;
  }

  function handleVocabularyRemoveFunction(rowId: number) {
    handleVocabularyRemove(findVocabularyById(rowId));
    if (data && data.length > 1) {
      const prevVocabularyIndex = data.findIndex(
        (voc) => voc.vocabulary_id === rowId,
      );
      const currentVocabularyIndex =
        prevVocabularyIndex + 1 > data.length - 1
          ? prevVocabularyIndex - 1
          : prevVocabularyIndex + 1;
      const audioSrc =
        extractSingleAudioAndImageSrc(
          data[currentVocabularyIndex].audio_name,
        ) || null;
      setSelectedDeck({
        ...data[currentVocabularyIndex],
        audio_name: audioSrc,
      });
    }
  }

  if (!data) return;
  if (error) {
    console.error(error);
  }
  if (isLoading) return <div>Loading...</div>;

  const columns = [
    {
      key: 'remove_vocabulary_key',
      name: '',
      width: '0%',
    },
    {
      key: 'front_word',
      name: 'Front word',
      resizable: true,
      width: '40%',
    },
    { key: 'back_word', name: 'Back word', resizable: true, width: '40%' },
    { key: 'deck_name', name: 'Deck name', resizable: true },
  ];

  const rows = data.map((vocabulary) => ({
    id: vocabulary.vocabulary_id,
    remove_vocabulary_key: (
      <MdDeleteForever className="h-[60%] w-full cursor-pointer text-red-600 transition-transform hover:rotate-45" />
    ),
    front_word: vocabulary.front_word,
    back_word: vocabulary.back_word,
    deck_name: vocabulary.deck_name,
  }));

  return (
    <Split
      sizes={data.length > 0 ? [50, 50] : [100, 0]}
      className="flex flex-row justify-center bg-[#1F1F1F]"
      minSize={0}
      expandToMin={false}
      gutterSize={10}
      gutterAlign="center"
      snapOffset={30}
      dragInterval={1}
      direction="horizontal"
    >
      <div className="mt-12 h-[calc(100vh-3rem)]">
        <div className="flex flex-col items-center justify-center">
          <div className="flex w-11/12 flex-col items-center justify-center gap-4 rounded-lg bg-[#2C2C2C] p-4">
            <div className="w-[90%]">
              {data.length > 0 ? (
                <ThemeProvider theme={darkTheme}>
                  <TextField
                    label="Search"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      handleSearchInputChange(event);
                    }}
                    value={inputSearchValue}
                    className="w-[100%] rounded-lg bg-black"
                    inputProps={{
                      style: { color: 'white' },
                    }}
                  />
                </ThemeProvider>
              ) : null}
            </div>
            <DataGrid
              style={{
                width: '100%',
                height: '75vh',
                maxHeight: '75vh',
              }}
              onScroll={handleScroll}
              onCellClick={(e) => {
                handleChangeVocabulary(e.row.id);
                if (e.column.key === 'remove_vocabulary_key') {
                  Swal.fire({
                    title: 'Are you sure you want to delete the vocabulary?',
                    icon: 'question',
                    inputAttributes: { autocapitalize: 'off' },
                    showCancelButton: true,
                    confirmButtonText: 'Delete',
                    showLoaderOnConfirm: true,
                    preConfirm: (response: boolean) => {
                      if (response) {
                        handleVocabularyRemoveFunction(e.row.id);
                      }
                    },
                  });
                }
              }}
              columns={columns}
              rows={rows}
            />
            {isLoading && <div>Loading more...</div>}
          </div>
        </div>
      </div>
      {data.length > 0 ? (
        <div>
          <AddVocabularyScreen
            selectedDeck={selectedDeck ? selectedDeck : null}
          />
        </div>
      ) : null}
    </Split>
  );
}
