import { Provider } from 'react-redux';
import { HashRouter, Outlet, Route, Routes } from 'react-router-dom';

import { store } from './API/Redux/ReduxProvider';
import Navbar from './components/Navbar';
import AddVocabularyScreen from './screens/AddVocabularyScreen';
import BrowseVocabularyScreen from './screens/BrowseVocabularyScreen';
import FlashCardsScreen from './screens/FlashCardsScreen';
import HomeScreen from './screens/HomeScreen';
import ModeSelectionMenu from './screens/ModeSelectionMenuScreen';
import ModeSelection from './screens/ModeSelectionScreen';
import TranslationScreen from './screens/TranslationScreen';

function App() {
  return (
    <HashRouter>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Navbar />}>
            <Route index element={<HomeScreen />} />
            <Route path=":id" element={<Outlet />}>
              <Route path="add-vocabulary" element={<AddVocabularyScreen />} />
              <Route
                path="browse-vocabulary"
                element={<BrowseVocabularyScreen />}
              />
              <Route path="mode-selection" element={<Outlet />}>
                <Route index element={<ModeSelection />} />
                <Route path="mode-selecion-menu" element={<Outlet />}>
                  <Route index element={<ModeSelectionMenu />} />
                  <Route path=":type/flashcard" element={<FlashCardsScreen />} />
                  <Route
                    path=":type/translation"
                    element={<TranslationScreen />}
                  ></Route>
                </Route>
              </Route>
            </Route>
          </Route>
        </Routes>
      </Provider>
    </HashRouter>
  );
}

export default App;
