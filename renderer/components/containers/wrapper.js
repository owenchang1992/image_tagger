import React, { useEffect, useState } from 'react';
import '../../assets/css/photon.css';

import { PageProvider } from '../../stores/page_store';
import { PreferencesProvider } from '../../stores/preferences_store';

import Main from './main_pane';
import Header from './header';
import SideBar from './sidebar';

import {
  receive,
  initProject,
  updateWorkingPath,
} from '../../request';

import {
  FROM_MAIN,
} from '../../constants';

const App = () => {
  const [workingPath, setWorkingPath] = useState('');

  useEffect(() => {
    // Get the working path and get the file names in that folder
    const getProjectConfig = (e, resp) => {
      const { workingPath: workingFolder } = resp.contents;
      if (workingFolder.indexOf('.zip') !== -1) {
        setWorkingPath('');
        return null;
      }
      setWorkingPath(workingFolder);
      return null;
    };

    if (workingPath.length !== 0) {
      updateWorkingPath(workingPath);
    } else {
      initProject();
      receive(FROM_MAIN, getProjectConfig);
    }
  }, [workingPath]);

  return (
    <PreferencesProvider>
      <PageProvider workingPath={workingPath} setWorkingPath={setWorkingPath}>
        <div className="window">
          <Header
            workingPath={workingPath}
            setWorkingPath={setWorkingPath}
          />
          <div className="window-content">
            <div className="pane">
              <div className="pane-group">
                <SideBar />
                <Main />
              </div>
            </div>
          </div>
        </div>
      </PageProvider>
    </PreferencesProvider>
  );
};

export default App;
