import { useEffect, useRef, useState } from 'react';

function useIsOpen(initialValue: null | boolean | string | number) {
  const [isOpen, setIsOpen] = useState<null | boolean | number | string>(
    initialValue,
  );
  const openRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (openRef.current && !openRef.current.contains(target)) {
        setIsOpen(initialValue);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [initialValue]);

  return { isOpen, setIsOpen, openRef };
}

export default useIsOpen;
