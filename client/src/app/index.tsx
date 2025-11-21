import { AppProviders } from "./providers/app-providers";
import { AppLayout } from "./layout/app-layout";
import { AppRouter } from "./router/app-router";

function App() {
  return (
    <AppProviders>
      <AppLayout>
        <AppRouter />
      </AppLayout>
    </AppProviders>
  );
}

export default App;

