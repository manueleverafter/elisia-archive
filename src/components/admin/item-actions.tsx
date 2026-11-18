"use client";

import { purgeItem, restoreItem, trashItem } from "@/app/admin/actions";
import { ActionButton } from "./ui";

export function TrashButton({ resource, id }: { resource: string; id: string }) {
  return (
    <ActionButton action={() => trashItem(resource, id)} confirm="Move to trash?" tone="danger">
      Delete
    </ActionButton>
  );
}

export function RestoreButton({ resource, id }: { resource: string; id: string }) {
  return <ActionButton action={() => restoreItem(resource, id)}>Restore</ActionButton>;
}

export function PurgeButton({ resource, id }: { resource: string; id: string }) {
  return (
    <ActionButton action={() => purgeItem(resource, id)} confirm="Delete forever? This can't be undone." tone="danger">
      Delete forever
    </ActionButton>
  );
}
