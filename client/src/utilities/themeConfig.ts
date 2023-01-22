import { createTheme, PaletteMode } from '@mui/material';

const colorsPalette = {
  primary: {
    100: '#ffba08',
    200: '#faa307',
    300: '#f48c06',
    400: '#e85d04',
    500: '#dc2f02',
    600: '#d00000',
    700: '#9d0208',
    800: '#6a040f',
    900: '#370617',
    1000: '#03071e',
  },
  grey: {
    100: '#f8f9fa',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
    1000: '#000000',
  },
};

declare module '@mui/material/styles' {
  interface Theme {
    palette: {
      grey: object;
      primary: {
        light: string;
        main: string;
        dark: string;
      };
      neutral: {
        dark: string;
        main: string;
        mediumMain: string;
        medium: string;
        light: string;
      };
      background: {
        default: string;
        paper: string;
      };
    };
  }
}

export const makeTheme = (mode: PaletteMode | undefined) => {
  return createTheme({
    typography: {
      fontFamily: ['"Rubik"', '"Montserrat"', 'sans-serif'].join(','),
    },
    palette: {
      mode,
      ...(mode !== 'dark'
        ? {
            primary: {
              light: colorsPalette.primary[200],
              main: colorsPalette.primary[500],
              dark: colorsPalette.primary[900],
            },
            neutral: {
              dark: colorsPalette.grey[800],
              main: colorsPalette.grey[600],
              mediumMain: colorsPalette.grey[400],
              medium: colorsPalette.grey[300],
              light: colorsPalette.grey[200],
            },
            background: {
              default: colorsPalette.grey[200],
              paper: colorsPalette.grey[100],
            },
          }
        : {
            primary: {
              light: colorsPalette.primary[1000],
              main: colorsPalette.primary[400],
              dark: colorsPalette.primary[200],
            },
            neutral: {
              dark: colorsPalette.grey[100],
              main: colorsPalette.grey[200],
              mediumMain: colorsPalette.grey[300],
              medium: colorsPalette.grey[400],
              light: colorsPalette.grey[700],
            },
            background: {
              default: colorsPalette.grey[700],
              paper: colorsPalette.grey[900],
            },
          }),
    },
  });
};
