/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/
import React, { ProviderProps, createContext, useContext, useState } from 'react';

// Types
import { GlobalState, TypeGlobalState } from '../src/domain/types/_app';

const GlobalStateContext = createContext<TypeGlobalState>({} as TypeGlobalState);

export const GlobalStateProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState<GlobalState>({
     isLoad: false,
     isLogged: false,
     data: {},
     fieldForm: []
  });

  return (
    <GlobalStateContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);