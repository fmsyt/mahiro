import React from 'react';
import ReactDOM from 'react-dom/client';

import { Stack } from '@mui/material';
import Board from '../Board';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Stack padding={2} height="100vh">
      <Board />
    </Stack>
  </React.StrictMode>
);
