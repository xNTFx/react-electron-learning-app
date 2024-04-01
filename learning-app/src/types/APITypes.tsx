interface Statement {
  lastID: number;
  changes: number;
}

interface ElectronBaseQueryArgs {
  url: string;
  method?: string;
  body?: unknown;
}

interface UpdateDeckType {
  deckId: number;
  deckName: string;
}

interface GetVocabularyArgumentsType {
  deckId: number;
  limit: number;
  offset: number;
  search: string;
}

interface GetDecksArgsType {
  limit: number;
  offset: number;
}

interface GetVocabularyToReviewType {
  review_id: number;
  vocabulary_id: number;
  review_date: string;
  ease_factor: number;
  repetition: number;
  interval: number;
  deck_id: number;
  front_word: string;
  back_word: string;
  audio_name: string | null;
  front_word_html: string;
  back_word_html: string;
  front_desc_html: string | null;
  back_desc_html: string | null;
}

interface GetVocabularyToReviewArgType {
  deckId: number;
  limit: number;
  type: string | undefined;
}

interface UpdateReviewPropsArg {
  reviewId: number;
  vocabularyId: number;
  reviewDate: string;
  easeFactor: number;
  repetition: number;
  interval: number;
}

interface UpdateVocabularyParams {
  front_word: string;
  back_word: string;
  audio_name: string | null;
  front_word_html: string;
  back_word_html: string;
  front_desc_html: string | null;
  back_desc_html: string | null;
  vocabulary_id: number;
}

interface AddVocabularyType {
  deckId: number | string;
  frontWord: string;
  backWord: string;
  audioName: string | null;
  frontWordHTML: string;
  backWordHTML: string;
  frontDescHTML: string | null;
  backDescHTML: string | null;
}

interface GetDecksType {
  deck_id: number;
  deck_name: string;
}

interface GetDeckWithCountType {
  deck_id: number;
  deck_name: string;
  new?: number | string;
  review?: number | string;
}

interface AddFlashcardResponse {
  flashcardId: number;
}
interface GetDeckResponse {
  deckId: string;
}

interface VocabularyType {
  [key: string]: string | number | null;
  vocabulary_id: number;
  deck_id: number;
  front_word: string;
  back_word: string;
  audio_name: string | null;
  front_word_html: string;
  backWord_html: string;
  front_desc_html: string;
  back_desc_html: string;
  deck_name: string;
}

interface GetVocabularyToReview {
  review_id: number;
  vocabulary_id: number;
  review_date: string;
  ease_factor: number;
  repetition: number;
  interval: number;
  deck_id: number;
  front_word: string;
  back_word: string;
  audio_name: string | null;
  front_word_html: string;
  back_word_html: string;
  front_desc_html: string | null;
  back_desc_html: string | null;
}

export type {
  Statement,
  ElectronBaseQueryArgs,
  GetDecksType,
  AddFlashcardResponse,
  GetDeckResponse,
  VocabularyType,
  GetVocabularyToReviewArgType,
  UpdateReviewPropsArg,
  UpdateVocabularyParams,
  AddVocabularyType,
  GetVocabularyToReviewType,
  GetDecksArgsType,
  GetVocabularyArgumentsType,
  UpdateDeckType,
  GetVocabularyToReview,
  GetDeckWithCountType,
};
