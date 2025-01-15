import { createContext } from "react";
import PropTypes from 'prop-types';

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const value = {};

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppContextProvider;
