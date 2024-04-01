import { EditorButtonType } from '../../../types/TypeScriptTypes';

const EditorButton = ({
  isActive = false,
  onClick = undefined,
  className = '',
  title = undefined,
  style = undefined,
  children,
}: EditorButtonType) => {
  return (
    <button
      onClick={onClick}
      title={title}
      style={style}
      className={`${className} m-1 flex items-center justify-center rounded bg-black p-2 font-bold text-white hover:bg-blue-400 hover:text-white
        ${isActive ? 'm-1 rounded bg-blue-500 font-bold text-white' : ''}`}
    >
      {children}
    </button>
  );
};

export default EditorButton;
