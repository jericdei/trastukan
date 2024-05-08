<script setup lang="ts">
import Button from "primevue/button";
import { onMounted, onUnmounted, ref, watchEffect } from "vue";
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
const users = ref<string[]>([]);

const user = ref("");
const message = ref<string>("");
const chatbox = ref<HTMLElement>();

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
      socket.value = new WebSocket(
        `ws://api.trastukan.localhost?user=${user.value}`
      );

      socket.value.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "USERS_SET":
            users.value = data.data;
            break;
          case "MESSAGES_SET":
            messages.value = data.data;
            break;
          case "USERS_ADD":
            users.value.push(data.data);
            break;
          case "MESSAGES_ADD":
            messages.value.push(data.data);
            break;
          case "USERS_REMOVE":
            users.value.filter((user) => user !== data.data);
            break;
        }

        setTimeout(scrollToBottom, 100);
      };
    },
  });
});

watchEffect(() => {
  scrollToBottom();
});

function scrollToBottom() {
  chatbox.value?.scrollTo({
    top: chatbox.value.scrollHeight,
    behavior: "smooth",
  });
}

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

  const newMessage = {
    user: user.value,
    message: message.value,
  };

  socket.value?.send(JSON.stringify(newMessage));

  messages.value.push(newMessage);

  message.value = "";

  setTimeout(scrollToBottom, 100);
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
      <p class="text-3xl text-center">Ikaw si {{ user }}</p>

      <div class="flex gap-8">
        <div>
          <p class="font-bold">Mga nandito:</p>

          <ul class="mt-8">
            <li v-for="usr in users" :key="usr" class="list-disc ml-4">
              {{ usr }}
            </li>
          </ul>
        </div>

        <div class="flex-1 p-4 rounded-lg border-2 border-neutral-100">
          <div v-if="messages.length === 0" class="p-4">
            <p class="text-center">Mangtrashtalk ka na huy!</p>
          </div>

          <div
            v-else
            class="space-y-4 flex flex-col overflow-y-auto max-h-[45rem] max-w-[80rem]"
            ref="chatbox"
          >
            <div
              v-for="msg in messages"
              :key="JSON.stringify(msg)"
              class="bg-primary text-neutral-900 rounded-xl p-4 w-1/3 mr-2"
              :class="{ 'self-end': msg.user === user }"
            >
              <div>
                <p class="font-bold">{{ msg.user }}</p>
                <p class="text-wrap break-words">{{ msg.message }}</p>
              </div>
            </div>
          </div>

          <InputGroup class="mt-8">
            <InputText
              v-model="message"
              placeholder="Write your trastok.."
              @keyup.enter="sendMessage"
              autofocus
            />

            <Button icon="ri-send-plane-2-fill" @click="sendMessage" />
          </InputGroup>
        </div>
      </div>
    </div>
  </div>
</template>
