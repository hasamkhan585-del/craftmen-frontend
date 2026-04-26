export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div
        className="w-10 h-10 border-4 rounded-full animate-spin"
        style={{ borderColor: "var(--leather-100)", borderTopColor: "var(--leather-500)" }}
      />
    </div>
  );
}
