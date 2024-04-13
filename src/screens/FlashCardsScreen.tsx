import DOMPurify from "dompurify";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useGetVocabularyToReviewQuery } from "../API/Redux/reduxQueryFetch";
import AudioButton from "../components/AudioButton";
import useSuperMemo2Implementation from "../hooks/useSuperMemo2Implementation";
import { extractSingleAudioAndImageSrc } from "../utils/extractAudioAndImageSrc";
import { GetVocabularyToReviewType } from "../types/APITypes";

export default function FlashCardsScreen() {
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
  const [answerType, setAnswerType] = useState({
    easy: 0,
    normal: 0,
    good: 0,
    hard: 0,
    again: 0,
  });
  const [isEnd, setIsEnd] = useState(false);

  const [vocabulary, setVocabulary] = useState<GetVocabularyToReviewType[]>([]);
  const initialize = useRef(true);

  //Get static data
  useEffect(() => {
    if (data && initialize.current) {
      setVocabulary(data);
      initialize.current = false;
    }
  }, [data]);

  const superMemo2Implementation = useSuperMemo2Implementation();

  function handleDifficulty(
    reviewId: number,
    vocabularyId: number,
    difficulty: string,
    ease_factor: number,
    repetition: number,
    interval: number,
    quality: number
  ) {
    if (!data) return;
    superMemo2Implementation(
      reviewId,
      vocabularyId,
      ease_factor,
      repetition,
      interval,
      quality
    );
    if (reviewIndex < vocabulary?.length - 1) {
      setReviewIndex((prev) => (prev += 1));
      setIsFrontPage(true);
    }
    if (reviewIndex === vocabulary?.length - 1) {
      setIsEnd(true);
    }
    setAnswerType((prev) => ({
      ...prev,
      [difficulty]: prev[difficulty as keyof typeof prev] + 1,
    }));
  }

  if (!data) return;
  const item = vocabulary[reviewIndex];
  if (error) {
    console.error(error);
  }
  if (isLoading) return <div>Loading...</div>;

  function frontFlashCard() {
    if (!data) return;
    const sanitizedFrontHtml = DOMPurify.sanitize(item.front_word_html);
    const sanitizedFrontDescHtml = DOMPurify.sanitize(
      item.front_desc_html ?? ""
    );
    return (
      <article>
        <div className="flex h-full flex-col gap-2">
          <div className="h-full overflow-auto break-all rounded-lg bg-[#2C2C2C] p-6">
            <div className="flex w-full flex-col justify-center gap-4 text-center">
              <div dangerouslySetInnerHTML={{ __html: sanitizedFrontHtml }} />
              <AudioButton
                audioSrc={extractSingleAudioAndImageSrc(item.audio_name)}
              />
              <div
                dangerouslySetInnerHTML={{ __html: sanitizedFrontDescHtml }}
              />
            </div>
          </div>

          <div className="flex flex-row justify-center overflow-x-auto rounded-lg bg-black p-2">
            <div className="flex flex-row gap-4">
              <button
                onClick={() => setIsFrontPage(false)}
                className="flex items-center justify-center rounded-lg border-2 border-solid border-white px-2 py-1 font-bold hover:bg-white hover:text-black"
              >
                Show Answer
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  function backFlashCard() {
    if (!data) return;
    const item = vocabulary[reviewIndex];
    const sanitizedFrontHtml = DOMPurify.sanitize(item.front_word_html);
    const sanitizedFrontDescHtml = DOMPurify.sanitize(
      item.front_desc_html ?? ""
    );
    const sanitizedBack = DOMPurify.sanitize(
      item.back_word_html + item.back_desc_html
    );
    return (
      <article>
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

          <div className="flex flex-row justify-center overflow-x-auto rounded-lg bg-black p-2">
            <div className="flex flex-row gap-4">
              <button
                onClick={() =>
                  handleDifficulty(
                    item.review_id,
                    item.vocabulary_id,
                    "easy",
                    item.ease_factor,
                    item.repetition,
                    item.interval,
                    5
                  )
                }
                className="flex items-center justify-center rounded-lg border-2 border-solid border-green-600 px-2 py-1 font-bold hover:bg-green-600"
              >
                Easy
              </button>
              <button
                onClick={() =>
                  handleDifficulty(
                    item.review_id,
                    item.vocabulary_id,
                    "good",
                    item.ease_factor,
                    item.repetition,
                    item.interval,
                    4
                  )
                }
                className="flex items-center justify-center rounded-lg border-2 border-solid border-gray-400 px-2 py-1 font-bold hover:bg-gray-400 hover:text-black"
              >
                Good
              </button>
              <button
                onClick={() =>
                  handleDifficulty(
                    item.review_id,
                    item.vocabulary_id,
                    "hard",
                    item.ease_factor,
                    item.repetition,
                    item.interval,
                    3
                  )
                }
                className="flex items-center justify-center rounded-lg border-2 border-solid border-orange-600 px-2 py-1 font-bold hover:bg-red-600"
              >
                Hard
              </button>
              <button
                onClick={() =>
                  handleDifficulty(
                    item.review_id,
                    item.vocabulary_id,
                    "again",
                    item.ease_factor,
                    item.repetition,
                    item.interval,
                    0
                  )
                }
                className="flex items-center justify-center rounded-lg border-2 border-solid border-red-600 px-2 py-1 font-bold hover:bg-orange-600"
              >
                Again
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  function FlashcardEndScreen() {
    return (
      <article className="flex h-5/6 items-start justify-center">
        <div className="flex max-w-[70vw] flex-col items-center justify-start gap-5 overflow-auto rounded-md bg-[#2C2C2C] p-10 text-white">
          <h2 className="text-3xl text-green-500">
            You completed the session!
          </h2>
          <div className="flex flex-row gap-5">
            <p>
              <span className="text-green-600">Easy: </span>
              {answerType.easy}
            </p>
            <p>
              <span className="text-gray-400">Good: </span>
              {answerType.good}
            </p>
            <p>
              <span className="text-orange-600">Hard: </span>
              {answerType.hard}
            </p>
            <p>
              <span className="text-red-600">Again: </span>
              {answerType.again}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-md bg-[#382bf0] p-2 hover:bg-[#5e43f3]"
          >
            Go back to menu
          </button>
        </div>
      </article>
    );
  }

  function NoVocabularyScreen() {
    return (
      <article className="flex h-[calc(100vh-3rem)] items-center justify-center bg-[#1F1F1F] font-bold text-white">
        <div className="flex h-2/5 flex-col items-center justify-center gap-3">
          <h2 className="text-3xl">No vocabulary to learn</h2>
          <button
            onClick={() => navigate("/")}
            className="rounded-xl bg-[#382bf0] p-2 font-extrabold hover:bg-[#5e43f3]"
          >
            Go back to decks
          </button>
        </div>
      </article>
    );
  }
  if (vocabulary.length === 0) return <NoVocabularyScreen />;

  return (
    <main className="flex h-[calc(100vh-3rem)] justify-center overflow-auto bg-[#1F1F1F] py-10">
      {!isEnd ? (
        <div
          className={`relative flex h-[90%] w-8/12 flex-col items-center rounded-xl text-white transition-all duration-500 [transform-style:preserve-3d] max-md:w-10/12 ${
            isFrontPage ? "" : "[transform:rotateY(180deg)]"
          }`}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]">
            {isFrontPage ? frontFlashCard() : null}
          </div>
          <div className="absolute inset-0 rounded-xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
            {!isFrontPage ? backFlashCard() : null}
          </div>
        </div>
      ) : (
        <FlashcardEndScreen />
      )}
    </main>
  );
}
