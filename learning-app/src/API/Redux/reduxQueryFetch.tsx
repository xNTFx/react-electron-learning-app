import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';

import {
  AddVocabularyType,
  ElectronBaseQueryArgs,
  GetDeckWithCountType,
  GetDecksArgsType,
  GetDecksType,
  GetVocabularyArgumentsType,
  GetVocabularyToReviewArgType,
  GetVocabularyToReviewType,
  UpdateDeckType,
  UpdateReviewPropsArg,
  UpdateVocabularyParams,
} from '../../types/APITypes';
import { VocabularyType } from '../../types/APITypes';

const electronBaseQuery: BaseQueryFn<
  ElectronBaseQueryArgs,
  unknown,
  unknown
> = async ({ url, body }) => {
  //console.log(`Making IPC call to ${url} with body:`, body);
  try {
    const result = await window.electronAPI.invoke(url, body);
    //console.log(`IPC call successful:`, result);
    return { data: result };
  } catch (error) {
    console.error(`IPC call failed:`, error);
    return { error };
  }
};

export const learningAppApi = createApi({
  reducerPath: 'learningAppApi',
  tagTypes: ['vocabulary', 'decks'],
  baseQuery: electronBaseQuery,
  endpoints: (builder) => ({
    getVocabulary: builder.query<VocabularyType[], GetVocabularyArgumentsType>({
      query: ({ deckId, limit, offset, search }) => ({
        url: 'get-vocabulary-to-browse',
        method: 'GET',
        body: { deckId, limit, offset, search },
      }),
      providesTags: ['vocabulary'],
    }),

    getVocabularyForReview: builder.query<
      VocabularyType[],
      GetVocabularyArgumentsType
    >({
      query: (deckId) => ({
        url: 'get-vocabulary-to-browse',
        method: 'GET',
        body: { deckId },
      }),
    }),

    updateVocabulary: builder.mutation<VocabularyType, UpdateVocabularyParams>({
      query: (newVocabulary) => ({
        url: 'update-vocabulary',
        method: 'UPDATE',
        body: newVocabulary,
      }),
      invalidatesTags: ['vocabulary'],
    }),

    addVocabulary: builder.mutation<AddVocabularyType, AddVocabularyType>({
      query: (vocabularyProps) => ({
        url: 'add-flashcard',
        method: 'POST',
        body: vocabularyProps,
      }),
      invalidatesTags: ['vocabulary'],
    }),

    getDecksWithLimit: builder.query<GetDeckWithCountType[], GetDecksArgsType>({
      query: ({ limit, offset }) => ({
        url: 'get-decks-with-limit',
        method: 'GET',
        body: { limit, offset },
      }),
      providesTags: ['decks', 'vocabulary'],
    }),

    getDeckById: builder.query<GetDeckWithCountType[], number>({
      query: (deckId) => ({
        url: 'get-deck-by-id',
        method: 'GET',
        body: { deckId },
      }),
      providesTags: ['decks', 'vocabulary'],
    }),

    getDecks: builder.query<GetDecksType[], void>({
      query: () => ({
        url: 'get-decks',
        method: 'GET',
      }),
      providesTags: ['decks'],
    }),

    createDeck: builder.mutation<GetDeckWithCountType, string>({
      query: (deck_name) => ({
        url: 'create-deck',
        method: 'POST',
        body: { deck_name },
      }),
      invalidatesTags: ['decks'],
    }),

    deleteDeck: builder.mutation<void, number>({
      query: (deckId) => ({
        url: 'delete-deck',
        method: 'DELETE',
        body: { deckId },
      }),
      invalidatesTags: ['decks'],
    }),

    updateDeck: builder.mutation<GetDecksType, UpdateDeckType>({
      query: (newDeck) => ({
        url: 'update-deck',
        method: 'UPDATE',
        body: newDeck,
      }),
      invalidatesTags: ['decks'],
    }),

    deleteVocabulary: builder.mutation<VocabularyType, number>({
      query: (vocabularyId) => ({
        url: 'delete-vocabulary',
        method: 'DELETE',
        body: { vocabularyId },
      }),
      invalidatesTags: ['vocabulary'],
    }),

    getVocabularyToReview: builder.query<
      GetVocabularyToReviewType[],
      GetVocabularyToReviewArgType
    >({
      query: ({ deckId, limit, type }) => ({
        url: 'get-vocabulary-to-review',
        method: 'GET',
        body: { deckId, limit, type },
      }),
      providesTags: ['vocabulary'],
    }),

    updateReview: builder.mutation<void, UpdateReviewPropsArg>({
      query: ({
        reviewId,
        vocabularyId,
        reviewDate,
        easeFactor,
        repetition,
        interval,
      }) => ({
        url: 'update-review',
        method: 'UPDATE',
        body: {
          reviewId,
          vocabularyId,
          reviewDate,
          easeFactor,
          repetition,
          interval,
        },
      }),
      invalidatesTags: ['vocabulary'],
    }),
  }),
});

export const {
  useGetVocabularyQuery,
  useUpdateVocabularyMutation,
  useGetDecksQuery,
  useGetDecksWithLimitQuery,
  useCreateDeckMutation,
  useDeleteDeckMutation,
  useUpdateDeckMutation,
  useAddVocabularyMutation,
  useDeleteVocabularyMutation,
  useGetVocabularyToReviewQuery,
  useUpdateReviewMutation,
  useGetDeckByIdQuery,
} = learningAppApi;
