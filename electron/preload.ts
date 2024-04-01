import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send: (channel: string, data: any) => {
    // whitelist channels
    const validChannels = [
      'copy-file-to-public',
      'remove-file-from-public',
      'get-all-files-from-public',
      'local-file',
      'handle-image-insert',
      'get-decks',
      'get-decks-with-limit',
      'add-flashcard',
      'update-deck',
      'delete-deck',
      'create-deck',
      'get-vocabulary-to-browse',
      'get-vocabulary-to-delete-deck',
      'update-vocabulary',
      'delete-vocabulary',
      'check-if-file-exists',
      'get-vocabulary-to-review',
      'update-review',
      'get-deck-by-id',
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  receive: (channel: string, func: any) => {
    const validChannels = [
      'file-copied',
      'file-removed',
      'image-inserted',
      'file-exists',
    ];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wrappedFunc = (_: any, ...args: any[]) => func(...args);
      ipcRenderer.on(channel, wrappedFunc);

      return () => {
        ipcRenderer.removeListener(channel, wrappedFunc);
      };
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoke: (channel: string, ...args: any) =>
    ipcRenderer.invoke(channel, ...args),
});

// --------- Preload scripts loading ---------
function domReady(
  condition: DocumentReadyState[] = ['complete', 'interactive'],
) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      parent.removeChild(child);
    }
  },
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`;
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
  const oStyle = document.createElement('style');
  const oDiv = document.createElement('div');

  oStyle.id = 'app-loading-style';
  oStyle.innerHTML = styleContent;
  oDiv.className = 'app-loading-wrap';
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// ----------------------------------------------------------------------

// eslint-disable-next-line react-hooks/rules-of-hooks
const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading();
};

setTimeout(removeLoading, 4999);
