import React, { useReducer } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import '../assets/css/photon.css';

import { pageReducer } from '../reducers/page_reducer';
import { addNewPage, closePage } from '../reducers/page_actions';

import Main from './main_pane';
import Header from './header';
import SideBar from './sidebar';

const page1 = {
  name: 'page 1',
  type: 'image_editor',
  routingPath: '/page1',
  props: {
    imagePath: 'dev/icon.png',
  },
};

const App = () => {
  const [newpages, dispatch] = useReducer(pageReducer, [page1]);

  const addPage = (page) => {
    dispatch(addNewPage(page));
  };

  const onClosePage = (removedPage) => {
    dispatch(closePage(removedPage));
  };

  return (
    <Router>
      <div className="window">
        <Header />
        <div className="window-content">
          <div className="pane-group">
            <SideBar addPage={addPage} />
            <Main newpages={newpages} closePage={onClosePage} />
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
