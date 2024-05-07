import { DynamicDialogInstance } from "primevue/dynamicdialogoptions";
import { ComputedRef, inject } from "vue";

/**
 * Composable to get the dialog ref from within the component.
 */
export function useDialogRef() {
  return inject<ComputedRef<DynamicDialogInstance>>(
    "dialogRef"
  ) as ComputedRef<DynamicDialogInstance>;
}
