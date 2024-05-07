<script setup lang="ts">
import Button from "primevue/button";
import { onMounted, onUnmounted, ref } from "vue";
import DynamicDialog from "primevue/dynamicdialog";
import { useDialog } from "primevue/usedialog";
import NameModal from "./components/NameModal.vue";
import Toast from "primevue/toast";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import { useToast } from "primevue/usetoast";

interface Message {
  user: string;
  message: string;
}

const dialog = useDialog();
const toast = useToast();

const socket = ref<WebSocket | null>(null);

const messages = ref<Message[]>([]);
const user = ref("");

const message = ref<string>("");

onMounted(() => {
  if (user.value !== "") {
    return;
  }

  dialog.open(NameModal, {
    props: {
      modal: true,
      draggable: false,
      closable: false,
      header: "cnu k",
    },
    data: {
      name: user,
    },
    onClose: async () => {
      await fetch("http://localhost:3000", {
        method: "POST",
        body: JSON.stringify({ user: user.value }),
      });

      socket.value = new WebSocket("ws://localhost:3000");

      socket.value.onopen = () => {
        console.log("websocket connected");
      };

      socket.value.onmessage = (event) => {
        const data = JSON.parse(event.data);

        console.log("message received", data);

        messages.value = data;
      };
    },
  });
});

function sendMessage() {
  if (message.value === "") {
    toast.add({
      severity: "error",
      summary: "bobo ka ba",
      detail: "walang laman yung message ulol",
      life: 3000,
    });

    return;
  }

  socket.value?.send(
    JSON.stringify({
      user: user.value,
      message: message.value,
    })
  );

  message.value = "";
}

onUnmounted(() => socket.value?.close());
</script>

<template>
  <DynamicDialog />
  <Toast />

  <div
    class="grid place-items-center min-h-screen bg-neutral-900 text-neutral-100"
  >
    <div class="flex flex-col gap-8 w-3/4">
      <p class="text-3xl">Pambobong pangalan: {{ user }}</p>

      <div class="p-4 rounded-lg border-2 border-neutral-100">
        <div v-if="messages.length === 0" class="p-4">
          <p>Mangtrashtalk ka na huy</p>
        </div>

        <div v-else class="space-y-4 flex flex-col">
          <div
            v-for="msg in messages"
            :key="JSON.stringify(msg)"
            class="bg-cyan-800 rounded-xl p-4 w-1/3"
            :class="{ 'self-end': msg.user === user }"
          >
            <div>
              <p class="font-bold">{{ msg.user }}</p>
              <p>{{ msg.message }}</p>
            </div>
          </div>
        </div>
      </div>

      <InputGroup>
        <InputText
          v-model="message"
          placeholder="Write your trastok.."
          @keyup.enter="sendMessage"
        />
        <Button icon="ri-send-plane-2-fill" @click="sendMessage" />
      </InputGroup>
    </div>
  </div>
</template>
