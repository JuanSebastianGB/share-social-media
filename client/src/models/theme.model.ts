import { PaletteMode } from '@mui/material';

export interface ThemeState {
  mode: PaletteMode | undefined;
}

export const themeEmptyState: ThemeState = {
  mode: 'light',
};
