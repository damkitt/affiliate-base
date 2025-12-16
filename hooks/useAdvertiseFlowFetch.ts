import { Program } from "@/types";

export const useAdvertiseFlowFetch = (selectedProgram: Program | null) => {
  const handleConfirm = async (): Promise<void> => {
    if (!selectedProgram) return;

    try {
      const res = await fetch("/api/programs/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId: selectedProgram.id }),
      });

      if (!res.ok) throw new Error("Failed to create checkout session");

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return { handleConfirm };
};
