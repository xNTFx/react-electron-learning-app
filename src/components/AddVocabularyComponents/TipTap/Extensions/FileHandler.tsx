import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

const FileHandler = Extension.create({
  name: 'fileHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop: (view, event) => {
              event.preventDefault();

              const files = Array.from(
                event.dataTransfer?.files ?? [],
              ) as File[];
              const coords = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });
              const pos = coords?.pos;

              if (files.length && pos !== undefined) {
                // Correctly invoking the onDrop function defined in the options
                this.options.onDrop(this.editor, files, pos);
              }

              return true;
            },
          },
        },
      }),
    ];
  },
});

export default FileHandler;
