import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { useParams } from 'react-router-dom';

import { GetDecksType } from '../../types/APITypes';

interface DeckSelectionTypes {
  deckList: GetDecksType[];
  currentDeckName: string;
  setCurrentDeckName: React.Dispatch<React.SetStateAction<string>>;
}

export default function DeckSelection({
  deckList,
  currentDeckName,
  setCurrentDeckName,
}: DeckSelectionTypes) {
  const { id } = useParams();

  const darkTheme = createTheme({
    components: {
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: 'black',
          },
        },
      },
    },
    palette: {
      mode: 'dark',
    },
  });

  function findDeckNamebyId(deckId: number) {
    const deck = deckList?.find((deck) => deck.deck_id === deckId);
    return deck ? deck.deck_name : '';
  }

  const initialDeckName =
    deckList && deckList.length > 0
      ? id !== '0'
        ? findDeckNamebyId(Number(id))
        : deckList[0].deck_name
      : '';

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <FormControl fullWidth>
          <InputLabel id="add-deck-select-label">Deck</InputLabel>
          <Select
            labelId="add-deck-select-label"
            id="add-deck-select"
            value={currentDeckName || initialDeckName}
            label={currentDeckName || 'Deck'}
            onChange={(event) => {
              setCurrentDeckName(event.target.value);
            }}
          >
            {deckList?.map((deck) => (
              <MenuItem key={deck.deck_id} value={deck.deck_name}>
                {deck.deck_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ThemeProvider>
    </>
  );
}
