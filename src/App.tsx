import { ThemeProvider, CssBaseline } from "@mui/material";
import { FormBuilderPage } from "./features/form-builder/FormBuilderPage";
import { theme } from "./theme/theme";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FormBuilderPage />
    </ThemeProvider>
  );
};

export default App;
