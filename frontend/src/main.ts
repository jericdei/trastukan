import "./style.css";
import "remixicon/fonts/remixicon.css";

import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Aura from "./presets/Aura";
import DialogService from "primevue/dialogservice";
import ToastService from "primevue/toastservice";

createApp(App)
  .use(PrimeVue, {
    unstyled: true,
    pt: Aura,
  })
  .use(DialogService)
  .use(ToastService)
  .mount("#app");
