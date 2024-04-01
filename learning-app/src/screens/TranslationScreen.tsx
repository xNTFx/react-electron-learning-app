import DOMPurify from 'dompurify';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetVocabularyToReviewQuery } from '../API/Redux/reduxQueryFetch';
import AudioButton from '../components/AudioButton';
import useSuperMemo2Implementation from '../hooks/useSuperMemo2Implementation';
import { GetVocabularyToReviewType } from '../types/APITypes';
import { extractSingleAudioAndImageSrc } from '../utils/extractAudioAndImageSrc';

export default function TranslationScreen() {
  const navigate = useNavigate();

  const { id, type } = useParams();
  const limit = 30;
  const { data, isLoading, error } = useGetVocabularyToReviewQuery({
    deckId: Number(id),
    limit: limit,
    type: type,
  });
  const [isFrontPage, setIsFrontPage] = useState(true);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [answerType, setAnswerType] = useState({ wrong: 0, correct: 0 });
  const [isEnd, setIsEnd] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [correctVocabulary, setCorrectVocabulary] = useState<string | null>(
    null,
  );
  const [isInputErrorMessage, setIsInputErrorMessage] = useState(false);

  const superMemo2Implementation = useSuperMemo2Implementation();

  const [vocabulary, setVocabulary] = useState<GetVocabularyToReviewType[]>([]);
  const initialize = useRef(true);

  //Get static data
  useEffect(() => {
    if (data && initialize.current) {
      setVocabulary(data);
      initialize.current = false;
    }
  }, [data]);

  if (!data) return;
  const item = vocabulary[reviewIndex];

  function handleShowAnswer(backWord: string) {
    const isAnswerCorrect = inputValue.trim() === item.back_word;

    if (inputValue.trim().length > 0) {
      if (isAnswerCorrect) {
        superMemo2Implementation(
          item.review_id,
          item.vocabulary_id,
          item.ease_factor,
          item.repetition,
          item.repetition,
          5,
        );
      } else {
        superMemo2Implementation(
          item.review_id,
          item.vocabulary_id,
          item.ease_factor,
          item.repetition,
          item.repetition,
          0,
        );
      }

      setIsFrontPage(false);
      setCorrectVocabulary(backWord);
      if (isInputErrorMessage) {
        setIsInputErrorMessage(false);
      }
    } else {
      setIsInputErrorMessage(true);
    }
  }

  function handleNextVocabulary() {
    const isAnswerCorrect = inputValue.trim() === item?.back_word;

    const difficulty = isAnswerCorrect ? 'correct' : 'wrong';
    setAnswerType((prev) => ({
      ...prev,
      [difficulty]: prev[difficulty as keyof typeof prev] + 1,
    }));
    if (reviewIndex < vocabulary?.length - 1) {
      setReviewIndex((prev) => (prev += 1));
      setIsFrontPage(true);
      setInputValue('');
    }
    if (reviewIndex === vocabulary?.length - 1) {
      setIsEnd(true);
    }
  }

  function handleShowAnswerMessage() {
    if (isFrontPage) return null;
    return (
      <div className="mb-2 flex w-8/12 flex-col items-center justify-start">
        <div className="flex w-full flex-col">
          {correctVocabulary === inputValue.trim() ? (
            <div className="rounded-md bg-green-200 p-2 font-bold text-green-700">
              <h1>Your Answer</h1>
              <h2>{inputValue}</h2>
            </div>
          ) : (
            <div className="rounded-md bg-red-200 p-2 font-bold text-red-700">
              <h1>Your Answer</h1>
              <h2>{inputValue}</h2>
            </div>
          )}
        </div>
      </div>
    );
  }

  function NoVocabularyScreen() {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-[#1F1F1F] font-bold text-white">
        <div className="flex h-2/5 flex-col items-center justify-center gap-3">
          <h1 className="text-3xl">No vocabulary to learn</h1>
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
  if (vocabulary.length === 0) return <NoVocabularyScreen />;

  if (error) {
    console.error(error);
  }
  if (isLoading) return <div>Loading...</div>;

  function frontFlashCard() {
    const item = vocabulary[reviewIndex];
    const sanitizedFrontHtml = DOMPurify.sanitize(item.front_word_html ?? '');
    const sanitizedFrontDescHtml = DOMPurify.sanitize(
      item.front_desc_html ?? '',
    );
    return (
      <>
        <div className="flex h-full flex-col">
          <div className="h-full overflow-auto break-all rounded-t-lg bg-[#2C2C2C] p-6">
            <div className="flex w-full flex-col justify-center gap-4 text-center">
              <div dangerouslySetInnerHTML={{ __html: sanitizedFrontHtml }} />
              <AudioButton
                audioSrc={
                  extractSingleAudioAndImageSrc(item.audio_name) ?? null
                }
              />
              <div
                dangerouslySetInnerHTML={{ __html: sanitizedFrontDescHtml }}
              />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleShowAnswer(item.back_word);
            }}
          >
            <div className="flex flex-col items-center justify-center gap-1 rounded-b-lg bg-[#2C2C2C] pb-2">
              <div className="flex w-full items-center justify-center">
                <input
                  value={inputValue}
                  placeholder="Write vocabulary"
                  onChange={(e) => {
                    e.preventDefault();
                    setInputValue(e.target.value);
                  }}
                  className="h-10 w-3/5 rounded-md bg-black px-2"
                />
              </div>
              {isInputErrorMessage ? (
                <p className="rounded-md bg-red-200 p-1 font-bold text-red-600">
                  Input cannot be empty
                </p>
              ) : null}
            </div>

            <div className="mt-2 flex flex-row justify-center rounded-lg bg-black p-2">
              <button className="flex items-center justify-center rounded-lg border-2 border-solid border-white px-2 py-1 font-bold hover:bg-white hover:text-black">
                Show Answer
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  function backFlashCard() {
    const sanitizedFrontHtml = DOMPurify.sanitize(item.front_word_html);
    const sanitizedFrontDescHtml = DOMPurify.sanitize(
      item.front_desc_html ?? '',
    );
    const sanitizedBack = DOMPurify.sanitize(
      item.back_word_html + (item.back_desc_html ? item.back_desc_html : ''),
    );

    return (
      <>
        <div className="flex h-full flex-col gap-2">
          <div className="h-full overflow-auto break-all rounded-lg bg-[#2C2C2C] p-6">
            <div className="flex w-full flex-col justify-center gap-4 text-center">
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizedFrontHtml,
                }}
              />
              <AudioButton
                audioSrc={extractSingleAudioAndImageSrc(item.audio_name)}
              />
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizedFrontDescHtml,
                }}
              />
              <hr />
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizedBack,
                }}
              />
            </div>
          </div>

          <div className="flex flex-row justify-center rounded-lg bg-black p-2">
            <button
              onClick={handleNextVocabulary}
              className="flex items-center justify-center rounded-lg border-2 border-solid border-green-600 px-2 py-1 font-bold hover:bg-green-600"
            >
              Next
            </button>
          </div>
        </div>
      </>
    );
  }

  function DefaultEndScreen() {
    return (
      <div className="flex h-5/6 items-start justify-center">
        <div className="flex max-w-[70vw] flex-col items-center justify-start gap-5 overflow-auto rounded-md bg-[#2C2C2C] p-10 text-white">
          <h1 className="text-3xl text-green-500">
            You completed the session!
          </h1>
          <div className="flex flex-row gap-5">
            <p>
              <span className="text-green-600">Correct: </span>
              {answerType.correct}
            </p>
            <p>
              <span className="text-red-600">Wrong: </span>
              {answerType.wrong}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-md bg-[#382bf0] p-2 hover:bg-[#5e43f3]"
          >
            Go back to menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col items-center justify-center overflow-auto bg-[#1F1F1F] py-10">
      {!isEnd ? (
        <>
          {isFrontPage ? (
            <div className="flex w-full justify-center px-6">
              <h1 className="w-8/12 pb-1 text-white">
                Type the correct translation
              </h1>
            </div>
          ) : (
            handleShowAnswerMessage()
          )}
          <div
            className={`relative flex h-full w-8/12 flex-col items-center rounded-xl text-white transition-all duration-500 [transform-style:preserve-3d] ${
              isFrontPage ? '' : '[transform:rotateY(180deg)]'
            }`}
          >
            <div className="absolute inset-0 [backface-visibility:hidden]">
              {isFrontPage ? frontFlashCard() : null}
            </div>
            <div className="absolute inset-0 rounded-xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
              {!isFrontPage ? backFlashCard() : null}
            </div>
          </div>
        </>
      ) : (
        <DefaultEndScreen />
      )}
    </div>
  );
}
