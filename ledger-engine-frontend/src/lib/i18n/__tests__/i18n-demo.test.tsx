import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import esMessages from "../../../../messages/es.json";
import { I18nDemo } from "../i18n-demo";

function renderWithI18n(
  component: React.ReactNode,
  locale = "es"
) {
  return render(
    <NextIntlClientProvider locale={locale} messages={esMessages}>
      {component}
    </NextIntlClientProvider>
  );
}

describe("I18nDemo", () => {
  it("renders the demo heading using translated string", () => {
    renderWithI18n(<I18nDemo />);
    expect(
      screen.getByRole("heading", { name: /i18n demo/i })
    ).toBeInTheDocument();
  });

  it("displays navigation items from translations", () => {
    renderWithI18n(<I18nDemo />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Billeteras")).toBeInTheDocument();
    expect(screen.getByText("Transferir")).toBeInTheDocument();
  });

  it("displays error strings from translations", () => {
    renderWithI18n(<I18nDemo />);
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    expect(screen.getByText("Reintentar")).toBeInTheDocument();
  });

  it("displays common action strings from translations", () => {
    renderWithI18n(<I18nDemo />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
  });

  it("displays status badges from translations", () => {
    renderWithI18n(<I18nDemo />);
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText("FAILED")).toBeInTheDocument();
    expect(screen.getByText("PROCESSING")).toBeInTheDocument();
  });
});
