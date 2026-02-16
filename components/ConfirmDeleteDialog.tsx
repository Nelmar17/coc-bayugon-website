"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type ConfirmDeleteDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  destructiveLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDeleteDialog({
  open,
  title = "Delete item?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  destructiveLabel,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            {destructiveLabel && (
              <span className="block mt-2 font-medium text-slate-900 dark:text-slate-100">
                {destructiveLabel}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Deleting..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
