import React, { useReducer, useEffect, useState } from 'react';
import pageReducer from '../reducers/page_reducer';
import filtersList from '../utils/page_filters';
import {
  FROM_GENERAL,
  FILTER_TAGGED_PAGE,
  SELECT_FOLDER,
  // FILTER_PAGE_WITH_NAME,
} from '../constants';

import {
  receive,
  selectFolder,
  removeListener,
} from '../request';

import {
  pageCreater,
  updatePage,
  importPage,
} from '../reducers/page_actions';

const PageContext = React.createContext(null);

export const usePage = ({ workingPath, setWorkingPath }) => {
  const [pages, dispatchPages] = useReducer(pageReducer, []);
  const [pageFilters, setPageFilter] = useState([]);

  const addPages = (importedPages) => {
    dispatchPages(importPage(importedPages));
  };

  const addNewPage = (imgs) => {
    if (Array.isArray(imgs)) {
      return addPages(imgs.map((img) => pageCreater(img)));
    }

    return null;
  };

  const onUpdatePage = (targetPage) => {
    dispatchPages(updatePage(targetPage));
  };

  const generalListener = (e, resp) => {
    const onSelectFolder = () => {
      addNewPage(resp.contents);

      setWorkingPath(resp.contents[0].dir);
      return null;
    };

    switch (resp.name) {
      case SELECT_FOLDER:
        return onSelectFolder(resp);
      default:
        // eslint-disable-next-line no-console
        console.log('event not found', resp);
    }

    return null;
  };

  const filterPage = () => {
    if (Array.isArray(pages) && pages.length > 0) {
      return pageFilters.reduce((newPagelist, filter) => (
        newPagelist.filter((page) => filtersList[filter.name](page, filter.options))
      ), pages);
    }

    return pages;
  };

  const findFilter = (filterName) => pageFilters.findIndex(
    (filter) => filter.name === filterName,
  );

  const toggleTagFilter = () => {
    const filterIndex = findFilter(FILTER_TAGGED_PAGE);

    if (filterIndex === -1) {
      setPageFilter(
        [
          ...pageFilters,
          { name: FILTER_TAGGED_PAGE },
        ],
      );
    } else {
      pageFilters.splice(filterIndex, 1);
      setPageFilter([...pageFilters]);
    }
  };

  useEffect(() => {
    receive(FROM_GENERAL, generalListener);

    return () => removeListener(FROM_GENERAL, generalListener);
  }, []);

  useEffect(() => {
    if (workingPath.length !== 0) {
      selectFolder(workingPath);
    }
  }, [workingPath]);

  return {
    pages: filterPage(),
    toggleTagFilter,
    findFilter,
    addNewPage,
    onUpdatePage,
    addPages,
    generalListener,
  };
};

export const PageProvider = ({ workingPath, setWorkingPath, children }) => (
  <PageContext.Provider
    value={usePage({ workingPath, setWorkingPath })}
  >
    {children}
  </PageContext.Provider>
);

export const usePageContext = () => React.useContext(PageContext);
