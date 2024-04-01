import { mergeAttributes, nodeInputRule } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';

import ImageResizeComponent from './ResizeIcon';

export interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, number>;
  useFigure: boolean;
}
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageResize: {
      setImage: (options: {
        src: string | undefined;
        alt: string;
        title?: string;
        width?: string | number;
        height?: string | number;
        isDraggable?: boolean;
      }) => ReturnType;
    };
  }
}
export const inputRegex = /(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;
export const ImageResize = Image.extend<ImageOptions>({
  name: 'imageResize',
  draggable: true,
  addOptions() {
    return {
      inline: true,
      allowBase64: false,
      HTMLAttributes: {},
      useFigure: false,
    };
  },
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      width: {
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        renderHTML: (attributes) => {
          return {
            height: attributes.height,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'img',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeComponent);
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title, height, width, isDraggable] = match;
          return { src, alt, title, height, width, isDraggable };
        },
      }),
    ];
  },
});
