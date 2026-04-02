// frontend/lib/utils/toast.ts
import { toast as sonnerToast, ExternalToast } from "sonner";

// Default options without style (sonner doesn't accept style in options)
const defaultOptions: ExternalToast = {
  duration: 4000,
  closeButton: true,
};

export const success = (message: string, options?: ExternalToast) => {
  return sonnerToast.success(message, {
    ...defaultOptions,
    ...options,
  });
};

export const error = (message: string, options?: ExternalToast) => {
  return sonnerToast.error(message, {
    ...defaultOptions,
    duration: 6000,
    ...options,
  });
};

export const warning = (message: string, options?: ExternalToast) => {
  return sonnerToast.warning(message, {
    ...defaultOptions,
    duration: 5000,
    ...options,
  });
};

export const info = (message: string, options?: ExternalToast) => {
  return sonnerToast.info(message, {
    ...defaultOptions,
    duration: 3000,
    ...options,
  });
};

export const loading = (message: string, options?: ExternalToast) => {
  return sonnerToast.loading(message, {
    ...defaultOptions,
    duration: Infinity,
    ...options,
  });
};

export const promise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((result: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ExternalToast
) => {
  return sonnerToast.promise(promise, {
    ...messages,
    ...options,
  });
};

export const userRejected = (message: string) => {
  return sonnerToast.info(message, {
    duration: 2000,
    closeButton: false,
  });
};

export const toast = (message: string, options?: ExternalToast) => {
  return sonnerToast(message, options);
};

export default {
  success,
  error,
  warning,
  info,
  loading,
  promise,
  userRejected,
  toast,
};