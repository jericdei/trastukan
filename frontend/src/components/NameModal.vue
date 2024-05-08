<script setup lang="ts">
import InputText from "primevue/inputtext";
import { useDialogRef } from "../composables/dialog";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";

const dialogRef = useDialogRef();
const toast = useToast();

function closeModal() {
  if (dialogRef.value.data.name === "") {
    toast.add({
      severity: "error",
      summary: "bobo ka ba",
      detail: "maglagay ka name tanga",
      life: 3000,
    });

    return;
  }

  dialogRef.value.close();
}
</script>

<template>
  <div class="flex flex-col gap-8 mt-4">
    <InputText
      v-model="dialogRef.data.name"
      placeholder="ex. budoy"
      @keyup.enter="closeModal"
      autofocus
    />

    <Button label="oks na" @click="closeModal" />
  </div>
</template>
