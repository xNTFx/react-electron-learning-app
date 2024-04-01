import { Editor } from '@tiptap/core';
import { CSSProperties, MouseEventHandler } from 'react';
import { VocabularyType } from './APITypes';

interface EditorButtonType {
  isActive?: boolean;
  onClick: MouseEventHandler<HTMLElement> | undefined;
  className?: string;
  title?: string | undefined;
  style?: CSSProperties | undefined;
  children: React.ReactNode;
}

interface EditorButtonListType {
  editorsList: Editor[];
  activeEditor: Editor | null;
}

interface AddVocabularyScreenProps {
  selectedDeck?: VocabularyType | null;
  setVocabularyList?: React.Dispatch<React.SetStateAction<VocabularyType[]>>;
}

interface EditorTipTapType {
  index: number;
  setActiveEditor: React.Dispatch<React.SetStateAction<Editor | null>>;
  onEditorUpdate: (editor: Editor) => void;
  initialValue: string | null | undefined;
}

interface EditorInputValuesType {
  [key: number]: string;
}

export type {
  EditorButtonType,
  EditorButtonListType,
  EditorTipTapType,
  EditorInputValuesType,
  AddVocabularyScreenProps,
};
