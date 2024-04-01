import Autocomplete from '@mui/material/Autocomplete';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useMemo, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import { FaBold, FaItalic } from 'react-icons/fa';
import {
  FaAlignCenter,
  FaAlignJustify,
  FaAlignLeft,
  FaAlignRight,
  FaEraser,
  FaHighlighter,
  FaPaperclip,
  FaStrikethrough,
  FaSubscript,
  FaSuperscript,
  FaUnderline,
} from 'react-icons/fa6';
import { GoHorizontalRule } from 'react-icons/go';
import { RxText } from 'react-icons/rx';

import useIsOpen from '../../../hooks/useIsMenuOpen';
import { EditorButtonListType } from '../../../types/TypeScriptTypes';
import { handleFileInsert } from '../../../utils/handleFileLogic';
import EditorButton from './EditorButton';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const defaultFontSize = '16';

export default function EdiitorButtonList({
  editorsList,
  activeEditor,
}: EditorButtonListType) {

  const { isOpen, setIsOpen, openRef } = useIsOpen(false);
  const {
    isOpen: isTxColorPickerOpen,
    setIsOpen: setIsTxColorPickerOpen,
    openRef: txColorMenuRef,
  } = useIsOpen(false);
  const {
    isOpen: isBgColorPickerOpen,
    setIsOpen: setIsBgColorPickerOpen,
    openRef: bgColorMenuRef,
  } = useIsOpen(false);

  const [oneRender, setOneRender] = useState({
    bold: false,
    italic: false,
    underline: false,
    superscript: false,
    subscript: false,
    strike: false,
  });

  const [toggleStyleValue, setToggleStyleValue] = useState({
    textColor: '#ffffff',
    backgroundColor: '#000000',
    fontType: '',
    fontSize: '',
  });

  const [tempFontSize, setTempFontSize] = useState(
    toggleStyleValue.fontSize === ''
      ? defaultFontSize
      : toggleStyleValue.fontSize,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const numbersList = useMemo(() => {
    const numbers = [];
    for (let i = 1; i < 100; i++) {
      numbers.push(i.toString());
    }
    return numbers;
  }, []);

  const handleInputChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: string,
    reason: string,
  ) => {
    if (reason === 'input') {
      if (/^(?!0)\d*$|^$/.test(value)) {
        setTempFontSize(value);
      }
    }
  };

  const handleOptionSelect = (
    _event: React.SyntheticEvent<Element, Event>,
    value: string | null,
  ) => {
    if (value !== null) {
      setToggleStyleValue((prev) => ({ ...prev, fontSize: value }));
      const modifiedFontSize = (Number(value) * (1 / 16)).toString();
      tipTapEditorCommand('setFontSize', modifiedFontSize + 'rem');
      setTempFontSize(value);
    }
  };

  function handleOnBlur() {
    if (tempFontSize === '') {
      setTempFontSize(defaultFontSize);
    } else {
      setToggleStyleValue((prev) => ({ ...prev, fontSize: tempFontSize }));
    }
  }

  function tipTapEditorCommand(commandName: string, ...args: unknown[]) {
    for (let i = 0; i < editorsList.length; i++) {
      if (i !== 2) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const command = (editorsList[i].commands as any)[commandName];
        if (typeof command === 'function') {
          command(...args);
        }
      }
    }
  }

  if (
    !editorsList ||
    !editorsList[0] ||
    !editorsList[1] ||
    !editorsList[2] ||
    !editorsList[3] ||
    !editorsList[4]
  )
    return null;

  if (!activeEditor) return;

  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-1 border-b bg-[#2C2C2C] p-1 pt-6">
      <ThemeProvider theme={darkTheme}>
        <Autocomplete
          inputValue={tempFontSize}
          onInputChange={handleInputChange}
          onChange={handleOptionSelect}
          onBlur={handleOnBlur}
          disablePortal
          title="Font size"
          noOptionsText={'none'}
          clearIcon={null}
          id="combo-box-demo"
          filterOptions={
            toggleStyleValue.fontSize !== '' &&
            tempFontSize !== toggleStyleValue.fontSize
              ? undefined
              : (options: string[]) => options
          }
          options={numbersList}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <TextField
              {...params}
              label="px"
              inputProps={{
                ...params.inputProps,
                maxLength: 2,
              }}
            />
          )}
          sx={{
            '& .MuiInputBase-root': {
              p: 0,
              width: 60,
              color: 'white',
              backgroundColor: 'black',
            },
          }}
        />
      </ThemeProvider>

      <div
        className={`relative flex cursor-pointer rounded`}
        ref={txColorMenuRef}
      >
        <EditorButton
          onClick={() => setIsTxColorPickerOpen((prev) => !prev)}
          title="Text color"
          style={{ color: toggleStyleValue.textColor }}
        >
          <RxText />
        </EditorButton>

        {isTxColorPickerOpen ? (
          <div className="absolute top-[100%] z-10">
            <SketchPicker
              color={toggleStyleValue.textColor}
              onChangeComplete={(color) => {
                tipTapEditorCommand('setColor', color.hex);
                setToggleStyleValue((prev) => ({
                  ...prev,
                  textColor: color.hex,
                }));
              }}
            />
          </div>
        ) : null}
      </div>
      <div
        className={`relative flex cursor-pointer rounded`}
        ref={bgColorMenuRef}
      >
        <EditorButton
          onClick={() => setIsBgColorPickerOpen((prev) => !prev)}
          title="Background color"
          className="hover:text-blue-400"
          style={{ backgroundColor: toggleStyleValue.backgroundColor }}
        >
          <FaHighlighter />
        </EditorButton>

        {isBgColorPickerOpen ? (
          <div className="absolute top-[100%] z-10">
            <SketchPicker
              color={toggleStyleValue.backgroundColor}
              onChangeComplete={(color) => {
                tipTapEditorCommand('setHighlight', { color: color.hex });
                setToggleStyleValue((prev) => ({
                  ...prev,
                  backgroundColor: color.hex,
                }));
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="relative" ref={openRef}>
        <EditorButton
          title="Alignment"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <FaAlignJustify />
        </EditorButton>
        {isOpen ? (
          <div className="absolute right-[-110%] z-10 flex flex-row rounded-lg bg-black">
            <EditorButton
              title="Left alignment"
              onClick={() => activeEditor.commands.setTextAlign('left')}
              className="border border-solid"
            >
              <FaAlignLeft />
            </EditorButton>
            <EditorButton
              title="Center alignment"
              onClick={() => activeEditor.commands.setTextAlign('center')}
              className="border border-solid"
            >
              <FaAlignCenter />
            </EditorButton>
            <EditorButton
              title="Right alignment"
              onClick={() => activeEditor.commands.setTextAlign('right')}
              className="border border-solid"
            >
              <FaAlignRight />
            </EditorButton>
          </div>
        ) : null}
      </div>
      <EditorButton
        isActive={oneRender.bold}
        onClick={() => {
          tipTapEditorCommand('toggleBold');
          setOneRender((prev) => ({
            ...prev,
            bold: !prev.bold,
          }));
        }}
        title="Bold text"
      >
        <FaBold />
      </EditorButton>
      <EditorButton
        isActive={oneRender.underline}
        onClick={() => {
          tipTapEditorCommand('toggleUnderline');
          setOneRender((prev) => ({
            ...prev,
            underline: !prev.underline,
          }));
        }}
        title="Underline text"
      >
        <FaUnderline />
      </EditorButton>
      <EditorButton
        isActive={oneRender.superscript}
        onClick={() => {
          tipTapEditorCommand('toggleSuperscript');
          setOneRender((prev) => ({
            ...prev,
            superscript: !prev.superscript,
          }));
        }}
        title="Superscript text"
      >
        <FaSuperscript />
      </EditorButton>
      <EditorButton
        isActive={oneRender.subscript}
        onClick={() => {
          tipTapEditorCommand('toggleSubscript');
          setOneRender((prev) => ({
            ...prev,
            subscript: !prev.subscript,
          }));
        }}
        title="Subscript text"
      >
        <FaSubscript />
      </EditorButton>
      <EditorButton
        isActive={oneRender.italic}
        onClick={() => {
          tipTapEditorCommand('toggleItalic');
          setOneRender((prev) => ({
            ...prev,
            italic: !prev.italic,
          }));
        }}
        title="Italic text"
      >
        <FaItalic />
      </EditorButton>
      <EditorButton
        isActive={oneRender.strike}
        onClick={() => {
          tipTapEditorCommand('toggleStrike');
          setOneRender((prev) => ({
            ...prev,
            strike: !prev.strike,
          }));
        }}
        title="Strike text"
      >
        <FaStrikethrough />
      </EditorButton>
      <EditorButton
        onClick={() => activeEditor.commands.setHorizontalRule()}
        title="Horizontal rule"
      >
        <GoHorizontalRule />
      </EditorButton>

      <EditorButton
        onClick={() => activeEditor.commands.unsetAllMarks()}
        title="Remove all styles from selected text"
      >
        <FaEraser />
      </EditorButton>

      <input
        type="file"
        id="file-upload"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files ? e.target.files[0] : null;
          e.target.value = '';
          handleFileInsert(file, activeEditor);
        }}
        accept="image/*"
        className="hidden"
      />
      <EditorButton
        onClick={() => fileInputRef.current?.click()}
        title="Upload image/audio"
      >
        <FaPaperclip />
      </EditorButton>
    </div>
  );
}
