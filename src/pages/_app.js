import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider } from "react-redux";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SettingsConsumer, SettingsProvider } from "../contexts/settings-context";
import { RTL } from "../components/rtl";
import { store } from "../store";
import { createTheme } from "../theme";
import { createEmotionCache } from "../utils/create-emotion-cache";
import "../libs/nprogress";
import { PrivateRoute } from "../components/PrivateRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useMediaPredicate } from "react-media-hook";
import Error500 from "./500";
import { ErrorBoundary } from "react-error-boundary";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import CippSpeedDial from 'src/components/CippComponents/CippSpeedDial'
import {
  Help as HelpIcon,
  BugReport as BugReportIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material'
import React from "react";
TimeAgo.addDefaultLocale(en);

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then((d) => ({
    default: d.ReactQueryDevtools,
  }))
);

const queryClient = new QueryClient();
const clientSideEmotionCache = createEmotionCache();
const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);
  const preferredTheme = useMediaPredicate("(prefers-color-scheme: dark)") ? "dark" : "light";

  const speedDialActions = [
    {
      id: "bug-report",
      icon: <BugReportIcon />,
      name: "Report Bug",
      href: "https://github.com/KelvinTegelaar/CIPP/issues/new?template=bug.yml",
    },
    {
      id: "feature-request",
      icon: <FeedbackIcon />,
      name: "Request Feature",
      href: "https://github.com/KelvinTegelaar/CIPP/issues/new?template=feature.yml",
    },
  ];

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>CIPP</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <SettingsConsumer>
                {(settings) => {
                  if (!settings.isInitialized) {
                  }
                  const theme = createTheme({
                    colorPreset: "orange",
                    direction: settings.direction,
                    paletteMode:
                      settings.currentTheme?.value !== "browser"
                        ? settings.currentTheme?.value
                        : preferredTheme,
                    contrast: "high",
                  });

                  return (
                    <>
                      <ThemeProvider theme={theme}>
                        <RTL direction={settings.direction}>
                          <CssBaseline />
                          <ErrorBoundary FallbackComponent={Error500}>
                            <PrivateRoute>{getLayout(<Component {...pageProps} />)}</PrivateRoute>
                          </ErrorBoundary>
                          <Toaster position="top-center" />
                          <CippSpeedDial 
                          actions={speedDialActions}
                          icon={<HelpIcon />}
                          position={{ bottom: 16, right: 16 }}
                        />
                        </RTL>
                      </ThemeProvider>
                      {settings?.showDevtools && (
                        <React.Suspense fallback={null}>
                          <ReactQueryDevtoolsProduction />
                        </React.Suspense>
                      )}
                    </>
                  );
                }}
              </SettingsConsumer>
            </LocalizationProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </CacheProvider>
  );
};

export default App;
