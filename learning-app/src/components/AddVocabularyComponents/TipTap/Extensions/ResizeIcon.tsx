import { NodeViewWrapper } from '@tiptap/react';
import { Resizable } from 're-resizable';
import { useEffect, useRef, useState } from 'react';

interface ImageProps {
  updateAttributes: (attrs: { width: string; height: string }) => void;
  extension: {
    options: {
      useFigure: boolean;
    };
  };
  node: {
    attrs: {
      src: string;
      alt: string;
      title?: string;
    };
  };
}

export default function Image(props: ImageProps) {
  const [initialWidth, setInitialWidth] = useState<number | undefined>(
    undefined,
  );
  const [initialHeight, setInitialHeight] = useState<number | undefined>(
    undefined,
  );
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      const handleLoad = () => {
        setInitialWidth(img.naturalWidth);
        setInitialHeight(img.naturalHeight);
      };

      if (img.complete) {
        handleLoad();
      } else {
        img.addEventListener('load', handleLoad);
        // Cleanup the event listener
        return () => img.removeEventListener('load', handleLoad);
      }
    }
  }, [imgRef]);

  return (
    <NodeViewWrapper>
      <Resizable
        maxWidth={initialWidth}
        maxHeight={initialHeight}
        minWidth={initialWidth ? Math.round(initialWidth * 0.1) : 50}
        minHeight={initialHeight ? Math.round(initialHeight * 0.1) : 50}
        onResizeStop={(_e, _direction, ref) => {
          props.updateAttributes({
            width: ref.style.width,
            height: ref.style.height,
          });
        }}
      >
        <img {...props.node.attrs} ref={imgRef} className="postimage" />
      </Resizable>
    </NodeViewWrapper>
  );
}
