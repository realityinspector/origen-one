import React from "react";
import { useToast } from "../../hooks/use-toast";
import { X } from "react-feather";

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function Toast({ id, title, description, variant = "default" }: ToastProps) {
  const { dismiss } = useToast();

  return (
    <div
      className={`toast ${variant === "destructive" ? "toast-destructive" : "toast-default"}`}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "1rem",
        borderRadius: "0.5rem",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        marginBottom: "0.5rem",
        backgroundColor: variant === "destructive" ? "#f8d7da" : "#f8f9fa",
        borderLeft: `4px solid ${variant === "destructive" ? "#dc3545" : "#20c997"}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: variant === "destructive" ? "#842029" : "#212529" }}>
          {title}
        </h3>
        <button
          onClick={() => dismiss(id)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>
      </div>
      {description && (
        <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: variant === "destructive" ? "#842029" : "#6c757d" }}>
          {description}
        </p>
      )}
    </div>
  );
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        maxWidth: "350px",
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
