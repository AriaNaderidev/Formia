import { createElement, type ReactNode } from "react";
import {
  FormBuilderContext,
  type FormBuilderContextType,
} from "./formBuilderContext";

type ProviderProps = {
  children: ReactNode;
  value: FormBuilderContextType;
};

export const FormBuilderProvider = ({ children, value }: ProviderProps) =>
  createElement(FormBuilderContext.Provider, { value }, children);
