/**
 * @author: Cristian Machado <cristian.machado@correounivalle.edu.co>
 * @copyright:  2024 
*/

// Imports
import React from 'react';
import { GlobalStateProvider } from '../hooks/context';
import '../css/_root.css'

// _app
export default ({ Component, pageProps }) => {
  return (
    <GlobalStateProvider>
      <Component {...pageProps} />
    </GlobalStateProvider>
  );
};