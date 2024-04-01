import { Menu, MenuItem, ThemeProvider, createTheme } from '@mui/material';
import '@sweetalert2/theme-dark/dark.css';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import { FaGear } from 'react-icons/fa6';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Swal from 'sweetalert2/dist/sweetalert2.min.js';

import {
  useCreateDeckMutation,
  useGetDecksWithLimitQuery,
  useUpdateDeckMutation,
} from '../API/Redux/reduxQueryFetch';
import useHandleDeckRemove from '../hooks/useHandleDeckRemove';
import { GetDeckWithCountType } from '../types/APITypes';

export default function HomeScreen() {
  const itemHeight = 35;

  const updatedLimit = Math.ceil(window.innerHeight / itemHeight) + 1;

  const [limit, setLimit] = useState(updatedLimit);

  const { data, error, isLoading } = useGetDecksWithLimitQuery({
    limit: limit,
    offset: 0,
  });
  const [createDeck, { error: createDeckError }] = useCreateDeckMutation();
  const [updateDeck, { error: updateDeckError }] = useUpdateDeckMutation();

  const navigate = useNavigate();
  //Used to set the position of the popover
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);

  const handleDeckRemove = useHandleDeckRemove();

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setLimit(Math.ceil(window.innerHeight / itemHeight) + 1);
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleClick(
    event: React.MouseEvent<HTMLButtonElement>,
    deckId: number,
  ) {
    setAnchorEl(event.currentTarget);
    setSelectedDeckId(deckId);
  }

  function handleClose() {
    setAnchorEl(null);
    setSelectedDeckId(null);
  }

  function updateDeckFunction(deckId: number, deckName: string) {
    handleClose();
    Swal.fire({
      title: 'Rename the deck',
      input: 'text',
      inputValue: deckName,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: (input: string) => {
        if (input.trim() !== deckName) {
          updateDeck({ deckId, deckName: input.trim() });
        }
      },
    });
  }

  function handleDeckRemoveFunction(deckId: number) {
    handleClose();
    Swal.fire({
      title: 'Are you sure you want to delete the deck?',
      icon: 'question',
      inputAttributes: { autocapitalize: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Delete',
      showLoaderOnConfirm: true,
      preConfirm: (response: boolean) => {
        if (response) {
          handleDeckRemove(Number(deckId));
        }
      },
    });
  }

  function createDeckFunction() {
    handleClose();
    Swal.fire({
      title: 'Write a deck name',
      input: 'text',
      inputAttributes: { autocapitalize: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: async (input: string) => {
        try {
          createDeck(input.trim());
        } catch (error) {
          console.error('An error occurred while creating the deck:', error);
        }
      },
    });
  }

  const errors = [error, createDeckError, updateDeckError];
  const firstError = errors.find((err) => err !== undefined);

  if (!data) {
    return;
  }

  if (firstError) {
    console.error(firstError);
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] select-none flex-col items-center bg-[#1F1F1F]">
      <div
        id="scrollableDiv"
        className="mt-10 box-border flex max-h-[80%] flex-col gap-2 overflow-auto rounded-lg bg-[#2C2C2C] p-4 text-white shadow-md"
      >
        <InfiniteScroll
          dataLength={data.length}
          next={() => {
            setLimit((prev) => (prev += 30));
          }}
          hasMore={data.length === limit}
          loader={<p>...Loading</p>}
          scrollableTarget="scrollableDiv"
        >
          <table className="border-collapse">
            <thead className="border-b-2 border-b-cyan-600">
              <tr>
                <th className="text-left">Decks</th>
                <th className="px-2 pl-8 font-extrabold">New</th>
                <th className="px-2 font-extrabold">Review</th>
                <th className="px-2 font-extrabold">Settings</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((deck: GetDeckWithCountType) => (
                <tr key={deck.deck_id} className="text-center">
                  <td className="max-w-[50vw] select-text overflow-auto text-start">
                    <button
                      onClick={() => {
                        navigate(`${deck.deck_id}/mode-selection`);
                      }}
                      className="cursor-pointer rounded-lg p-1 hover:bg-black hover:underline"
                    >
                      {deck.deck_name}
                    </button>
                  </td>
                  <td className="px-2 pl-8 text-blue-700">
                    {deck.new ? deck.new : '0'}
                  </td>
                  <td className="px-2 text-green-400">
                    {deck.review ? deck.review : '0'}
                  </td>
                  <td className="relative px-2 text-center">
                    <button
                      className="text-center transition-transform hover:rotate-90"
                      onClick={(event) => handleClick(event, deck.deck_id)}
                    >
                      <FaGear />
                    </button>
                    <ThemeProvider theme={darkTheme}>
                      <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={selectedDeckId === deck.deck_id}
                        onClose={handleClose}
                      >
                        <MenuItem>Settings</MenuItem>
                        <MenuItem
                          onClick={() =>
                            updateDeckFunction(deck.deck_id, deck.deck_name)
                          }
                        >
                          Rename
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleDeckRemoveFunction(deck.deck_id)}
                        >
                          Delete
                        </MenuItem>
                      </Menu>
                    </ThemeProvider>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </InfiniteScroll>
      </div>
      <div className="p-4 text-white">
        <button
          onClick={createDeckFunction}
          className="rounded-xl bg-[#382bf0] p-2 font-extrabold hover:bg-[#5e43f3]"
        >
          Create Deck
        </button>
      </div>
    </div>
  );
}
