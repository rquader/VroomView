import { LoadingAnimation } from "@/components/animations";

// Route-level loading UI (Next.js convention). Uses the Lottie LoadingAnimation,
// which falls back to a CSS spinner when no JSON is present.
export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <LoadingAnimation label="Loading VroomView…" />
    </div>
  );
}
