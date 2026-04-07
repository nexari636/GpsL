import Toast from "react-native-toast-message";

export function ToastSuccess(title: string, message: string) {
  fun_Toast("success", title, message);
}

export function ToastInfo(title: string, message: string) {
  fun_Toast("info", title, message);
}

export function ToastError(title: string, message: string) {
  fun_Toast("error", title, message);
}

function fun_Toast(type: string, title: string, message: string) {
  Toast.show({
    type: type,
    text1: title,
    text2: message,
  });
}
