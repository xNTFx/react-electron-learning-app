import '@sweetalert2/theme-dark/dark.css';
import '@sweetalert2/theme-dark/dark.css';
import Bold from '@tiptap/extension-bold';
import { Color } from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import Dropcursor from '@tiptap/extension-dropcursor';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Italic from '@tiptap/extension-italic';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Strike from '@tiptap/extension-strike';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Text from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import { IoTrashBin } from 'react-icons/io5';

import { EditorTipTapType } from '../../../types/TypeScriptTypes';
import { isItAudioFile } from '../../../utils/categorizeFileType';
import errorAlert from '../../../utils/errorAlert';
import {
  handleCheckIfFileExists,
  handleFileInsert,
} from '../../../utils/handleFileLogic';
import FileHandler from './Extensions/FileHandler';
import FontSize from './Extensions/FontSize';
import { ImageResize } from './Extensions/ImageResize';

export default function EditorTipTap({
  index,
  setActiveEditor,
  onEditorUpdate,
  initialValue = null,
}: EditorTipTapType) {
  const editor = useEditor({
    extensions: [
      FileHandler.configure({
        onDrop: (editor: Editor, files: File[]) => {
          files.forEach((file) => {
            const reader = new FileReader();
            handleFileInsert(file, editor);
            reader.readAsDataURL(file);
          });
        },
      }),
      Document,
      Heading,
      Paragraph,
      Dropcursor,
      ImageResize,
      Superscript,
      Underline,
      Subscript,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Strike,
      FontSize,
      TextStyle,
      HorizontalRule,
      Text,
      Bold,
      Placeholder.configure({
        placeholder: 'Text',
      }),
      Italic,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'justify',
      }),
    ],
    content: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      editor?.commands.setContent(initialValue);
    });
  }, [initialValue, editor]);

  useEffect(() => {
    if (editor) {
      onEditorUpdate(editor);
    }
  }, [onEditorUpdate, editor]);

  if (!editor) return;

  async function checkAudioFileExtension(filePath: string | null) {
    if (isItAudioFile(filePath)) {
      const ifFileExist = await handleCheckIfFileExists(filePath);
      if (ifFileExist) {
        editor?.commands.setContent(filePath);
      }
    } else {
      errorAlert('File is not an audio', 'error');
    }
  }

  if (initialValue === undefined) return <div>Loading...</div>;

  return (
    <>
      {index === 2 ? (
        <div>
          <div className="flex w-full flex-row items-center">
            {editor.getText() ? (
              <button
                title="Remove audio"
                className="rounded-md bg-red-600 p-1 hover:bg-red-400"
                onClick={() => editor?.commands.setContent(null)}
              >
                <IoTrashBin />
              </button>
            ) : null}
            <button
              title="Upload audio"
              onClick={() => fileInputRef.current?.click()}
              className={
                'm-1 rounded bg-black p-2 font-bold text-white hover:bg-blue-400 hover:text-white'
              }
            >
              Upload Audio
            </button>
            <div className="overflow-auto">
              <p>
                {editor.getText() ? editor.getText() : 'No audio file selected'}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            onChange={(e) => {
              const filePath = e.target.files ? e.target.files[0].path : null;
              e.target.value = '';
              checkAudioFileExtension(filePath);
            }}
            type="file"
            accept="audio/*"
            className="hidden"
          />
          <div className="hidden">
            <EditorContent editor={editor} />
          </div>
        </div>
      ) : (
        <div className="rounded-md bg-black text-white">
          <div
            onClick={() => setActiveEditor(editor)}
            className="cursor-text p-2"
          >
            <EditorContent editor={editor} style={{ padding: '0.2rem' }} />
          </div>
        </div>
      )}
    </>
  );
}
