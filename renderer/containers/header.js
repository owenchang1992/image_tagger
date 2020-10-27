import React from 'react';
import { useHistory } from 'react-router-dom';
import { TO_MAIN } from '../constants';

const SELECT_FILES = 'SELECT_FILES';
const PROJECT_NAME = 'DEFAULT';

const Header = () => {
  const history = useHistory();
  const openSelectFileDialog = () => {
    window.api.send(TO_MAIN, {
      name: SELECT_FILES,
      projectName: PROJECT_NAME,
    });
  };

  const toHomePage = () => {
    history.push('/');
  };

  return (
    <div className="toolbar toolbar-header">
      {/* <h1 className="title">Title</h1> */}

      <div className="toolbar-actions">
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-default"
            onClick={openSelectFileDialog}
          >
            <span className="icon icon-picture" />
          </button>
          <button
            type="button"
            className="btn btn-default"
            onClick={toHomePage}
          >
            <span className="icon icon-export" />
          </button>
          {/* <button type="button" className="btn btn-default">
            <span className="icon icon-folder" />
          </button> */}
          {/* <button type="button" className="btn btn-default">
            <span className="icon icon-popup" />
          </button>
          <button type="button" className="btn btn-default">
            <span className="icon icon-shuffle" />
          </button> */}
        </div>

        {/* <button type="button" className="btn btn-default">
          <span className="icon icon-home icon-text" />
          Filters
        </button> */}
        {/*
        <button type="button" className="btn btn-default btn-dropdown pull-right">
          <span className="icon icon-cog" />
        </button> */}
      </div>
    </div>
  );
};

export default Header;
