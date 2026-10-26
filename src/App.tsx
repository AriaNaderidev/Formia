import { ThemeProvider, CssBaseline } from "@mui/material";
import { FormBuilderPage } from "./features/form-builder/FormBuilderPage";
import { theme } from "./theme/theme";
import { Toaster } from "./ui/toast";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FormBuilderPage />
      <Toaster />
    </ThemeProvider>
  );
};

export default App;
