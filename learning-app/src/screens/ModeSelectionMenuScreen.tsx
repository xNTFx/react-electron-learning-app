import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useGetDeckByIdQuery } from '../API/Redux/reduxQueryFetch';

export default function ModeSelectionMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const selectedMode = location.state.mode;

  const { data, error, isLoading } = useGetDeckByIdQuery(Number(id));

  if (!data) return;
  if (error) {
    console.error(error);
  }
  if (isLoading) return <div>Loading...</div>;

  const deck = data[0];

  return (
    <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-[#1F1F1F] text-white">
      <div className="flex h-5/6 items-start justify-center">
        <div className="flex w-[30rem] max-w-[70vw] flex-col items-center justify-start gap-2 overflow-auto rounded-md bg-[#2C2C2C] p-10">
          <h2 className="max-w-[100%] overflow-auto font-bold">
            {deck.deck_name}
          </h2>
          <div className="flex flex-row items-center justify-center gap-5">
            <div className="flex flex-col items-center justify-center gap-1">
              <button
                onClick={
                  deck.new && deck.new !== '0'
                    ? () => navigate('new-words/' + selectedMode)
                    : undefined
                }
                className={`${
                  deck.new === '0'
                    ? 'cursor-default brightness-[20%]'
                    : 'hover:bg-blue-500'
                } flex w-28 flex-col items-center justify-center rounded-md bg-blue-700 p-2`}
              >
                <span>Learn New</span>
                <span>Words</span>
              </button>
              <p className="font-extrabold">
                {deck.new !== '0' ? deck.new : 'No new vocabulary'}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <button
                onClick={
                  deck.review && deck.review !== '0'
                    ? () => navigate('new-reviews/' + selectedMode)
                    : undefined
                }
                className={`${
                  deck.review === '0'
                    ? 'cursor-default brightness-[20%]'
                    : 'hover:bg-green-500'
                } flex w-28 flex-col items-center justify-center rounded-md bg-green-700 p-2`}
              >
                <span>Learn</span>
                <span>Reviews</span>
              </button>
              <p className="font-extrabold">
                {deck.review !== '0' ? deck.review : 'No new reviews'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
