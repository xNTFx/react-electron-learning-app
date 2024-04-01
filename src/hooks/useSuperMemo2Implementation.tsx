import { useUpdateReviewMutation } from '../API/Redux/reduxQueryFetch';

export default function useSuperMemo2Implementation() {
  const [updateReview] = useUpdateReviewMutation();

  function calculateInterval(n: number, EF: number) {
    if (n === 1) {
      return 1;
    }
    if (n === 2) {
      return 6;
    }
    return Math.ceil(n * EF);
  }

  function addDaysAndGetFormattedDate(days: number) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + days);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDateTime;
  }

  function superMemo2Implementation(
    reviewId: number,
    vocabularyId: number,
    ease_factor: number,
    repetition: number,
    interval: number,
    quality: number,
  ) {
    const superMemo2Function = Number(
      (
        ease_factor +
        (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      ).toFixed(2),
    );
    const newEeaseFactor = superMemo2Function >= 1.3 ? superMemo2Function : 1.3;
    const newInterval = calculateInterval(interval, newEeaseFactor);

    if (quality !== 0) {
      updateReview({
        reviewId: reviewId,
        vocabularyId: vocabularyId,
        reviewDate: addDaysAndGetFormattedDate(newInterval),
        easeFactor: newEeaseFactor,
        repetition: repetition + 1,
        interval: newInterval,
      });
    } else if (quality === 0) {
      updateReview({
        reviewId: reviewId,
        vocabularyId: vocabularyId,
        reviewDate: addDaysAndGetFormattedDate(0),
        easeFactor: 2.5,
        repetition: 1,
        interval: 1,
      });
    }
  }
  return superMemo2Implementation;
}
