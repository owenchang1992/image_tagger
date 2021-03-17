import React, { useReducer, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../assets/css/photon.css';
import path from 'path';
import ContextStore from '../context_store';

import pageReducer from '../reducers/page_reducer';
import labelReducer from '../reducers/label_reducers';
import { initializeLabel } from '../reducers/label_actions';

import {
  addPage,
  closePage,
  pageCreater,
  updatePage,
} from '../reducers/page_actions';

import Main from './main_pane';
import Header from './header';

import {
  update,
  send2Local,
  receive,
  FIND,
  find,
  remove,
} from '../request';

import {
  TO_MAIN,
  FROM_MAIN,
  PROJECT_NAME,
  SELECT_FILES,
  UPDATE,
  LABELS,
  FIND_ONE,
  TO_GENERAL,
  FROM_GENERAL,
  EXPORT_PROJECT,
  SELECT_FOLDER,
  PAGES,
} from '../constants';

const App = () => {
  const history = useHistory();
  const [pages, dispatch] = useReducer(pageReducer, []);
  const [labels, ldispatch] = useReducer(labelReducer, []);
  const [workingPath, setWorkingPath] = useState('');

  const initPage = (dbPage) => {
    history.push(dbPage[0].key);
    dbPage.forEach((page) => {
      // console.log(page);
      dispatch(addPage(page));
    });
  };

  const addNewPage = (imgs) => {
    if (Array.isArray(imgs)) {
      history.push(
        imgs.map((img) => {
          const newPage = pageCreater(img, PROJECT_NAME);
          console.log(newPage);
          dispatch(addPage(newPage));
          send2Local(TO_GENERAL, update(PAGES, newPage));
          return newPage;
        })[0].key,
      );
    } else {
      dispatch(addPage(pageCreater(imgs, PROJECT_NAME)));
    }
  };

  const onUpdatePage = (targetPage) => {
    dispatch(updatePage(targetPage));
    send2Local(TO_GENERAL, update(PAGES, targetPage));
  };

  const removePage = (removedPage) => {
    if (removedPage.key === history.location.pathname) {
      history.goBack();
    }
    dispatch(closePage(removedPage));
    send2Local(TO_GENERAL, remove(PAGES, { key: removedPage.key }));
  };

  const showOpenDialog = () => {
    send2Local(TO_GENERAL, {
      type: PAGES,
      name: SELECT_FILES,
    });
  };

  const selectFolder = () => {
    send2Local(TO_GENERAL, {
      type: PAGES,
      name: SELECT_FOLDER,
    });
  };

  const exportProject = () => {
    send2Local(TO_GENERAL, {
      type: PAGES,
      name: EXPORT_PROJECT,
    });
  };

  const getProject = () => {
    send2Local(TO_GENERAL, find(PAGES, {}));
  };

  // Initial Project
  useEffect(() => {
    // Get the preject information from DB
    getProject();

    // Add listener
    receive(FROM_GENERAL, (e, resp) => {
      if (resp.name === SELECT_FILES || resp.name === SELECT_FOLDER) {
        console.log(resp.contents);
        addNewPage(resp.contents);
        setWorkingPath(path.dirname(resp.contents[0].src));
      } else if (resp.name === FIND && resp.type === PAGES) {
        // TODO: ADD Initial page
        initPage(resp.contents);
      }
    });

    const getLabels = (e, resp) => {
      if (resp.contents !== null) {
        if (resp.type === LABELS) {
          if (resp.name === FIND) {
            ldispatch(initializeLabel(resp.contents));
          }
        }
      }
    };

    const getDBLabels = () => {
      send2Local(TO_GENERAL, find(LABELS, {}));
      receive(FROM_GENERAL, getLabels);
    };

    getDBLabels();
  }, []);

  useEffect(() => {
    const checkUpdateCtn = (labelList) => {
      for (let i = 0; i < labelList.length; i += 1) {
        if (!labelList[i]) return false;
      }
      return true;
    };

    if (labels.length !== 0 && checkUpdateCtn(labels)) {
      send2Local(
        TO_GENERAL,
        update(
          LABELS,
          labels,
        ),
      );
    }
  }, [labels]);

  useEffect(() => {
    const getProjectConfig = (e, resp) => {
      setWorkingPath(resp.contents.workingPath);
    };

    if (workingPath.length !== 0) {
      send2Local(TO_MAIN, {
        name: UPDATE,
        contents: {
          name: PROJECT_NAME,
          key: PROJECT_NAME,
          workingPath,
        },
      });
    } else {
      send2Local(TO_MAIN, {
        name: FIND_ONE,
        contents: { key: PROJECT_NAME },
      });

      receive(FROM_MAIN, getProjectConfig);
    }
  }, [workingPath]);

  return (
    <ContextStore.Provider
      value={{
        projectName: PROJECT_NAME,
        labels,
        ldispatch,
        removePage,
        onUpdatePage,
        workingPath,
      }}
    >
      <div className="window">
        <Header
          showOpenDialog={showOpenDialog}
          exportProject={exportProject}
          selectFolder={selectFolder}
        />
        <div className="window-content">
          <Main pages={pages} />
        </div>
      </div>
    </ContextStore.Provider>
  );
};

export default App;
