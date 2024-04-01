import { AiOutlineTranslation } from 'react-icons/ai';
import { TbCards } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';

export default function ModeSelection() {
  const navigate = useNavigate();

  return (
    <div className="flex h-[calc(100vh-3rem)] select-none flex-col items-center justify-center bg-[#1F1F1F]">
      <div className="h-[calc(100vh-5rem)] w-[60%]">
        <div className="mt-10 rounded-lg bg-[#2C2C2C] p-5 text-white shadow-lg">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-extrabold">Modes</h1>
          </div>
          <div className="grid h-[50%] grid-cols-2 items-center justify-center gap-3 text-white">
            <button
              onClick={() =>
                navigate('mode-selecion-menu', { state: { mode: 'flashcard' } })
              }
              className="flex h-24 flex-col items-center overflow-hidden rounded-lg bg-blue-800 p-2 font-extrabold hover:bg-blue-600"
            >
              <p>Flashcards</p>
              <TbCards className="size-12" />
            </button>
            <button
              onClick={() =>
                navigate('mode-selecion-menu', {
                  state: { mode: 'translation' },
                })
              }
              className="flex h-24 flex-col items-center justify-center overflow-hidden rounded-lg bg-green-600 font-extrabold hover:bg-green-400"
            >
              <p>Translation</p>
              <AiOutlineTranslation className="size-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
