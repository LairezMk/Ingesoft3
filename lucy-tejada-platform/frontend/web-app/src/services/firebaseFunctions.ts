import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./firebase";

export const firebaseFunctions = firebaseApp ? getFunctions(firebaseApp) : null;

export const createCallable = <TRequest, TResponse>(name: string) => {
  if (!firebaseFunctions) {
    return null;
  }

  return httpsCallable<TRequest, TResponse>(firebaseFunctions, name);
};
