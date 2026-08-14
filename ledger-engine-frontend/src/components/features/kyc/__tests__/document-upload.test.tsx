import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import React from "react";
import { DocumentUpload } from "@/components/features/kyc/document-upload";

describe("DocumentUpload", () => {
  const mockOnUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnUpload.mockResolvedValue(undefined);
  });

  it("renders drop zone", () => {
    render(<DocumentUpload onUpload={mockOnUpload} isPending={false} />);
    expect(
      screen.getByText(/arrastra tus documentos aquí/i)
    ).toBeInTheDocument();
  });

  it("shows file type restrictions", () => {
    render(<DocumentUpload onUpload={mockOnUpload} isPending={false} />);
    expect(screen.getByText(/jpg o png/i)).toBeInTheDocument();
    expect(screen.getByText(/máximo 5mb/i)).toBeInTheDocument();
  });

  it("renders upload button", () => {
    render(<DocumentUpload onUpload={mockOnUpload} isPending={false} />);
    expect(
      screen.getByRole("button", { name: /subir 0 documentos/i })
    ).toBeInTheDocument();
  });

  it("disables upload button when no files selected", () => {
    render(<DocumentUpload onUpload={mockOnUpload} isPending={false} />);
    const button = screen.getByRole("button", { name: /subir 0 documentos/i });
    expect(button).toBeDisabled();
  });

  it("shows uploading state", () => {
    render(<DocumentUpload onUpload={mockOnUpload} isPending={true} />);
    expect(screen.getByText("Subiendo...")).toBeInTheDocument();
  });
});
