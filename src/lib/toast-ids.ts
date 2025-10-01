// src/lib/toast-keys.ts
export const toastIds = {
  create: () => `todo:create`,
  edit: (id: string) => `todo:${id}:edit`,
  complete: (id: string) => `todo:${id}:complete`,
  remove: (id: string) => `todo:${id}:remove`,
} as const;
