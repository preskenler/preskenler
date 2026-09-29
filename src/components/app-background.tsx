/**
 * Decorative, theme-aware background shared by the home and auth pages.
 *
 * Renders behind its (positioned) parent, so the caller must be
 * `relative`/`isolate` and may layer content on top.
 */
export function AppBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-32 -top-40 size-[600px] rounded-full bg-chart-1/30 blur-[120px]" />
      <div className="absolute right-[-10%] top-[10%] size-[550px] rounded-full bg-chart-2/25 blur-[120px]" />
      <div className="absolute bottom-[-250px] left-[25%] size-[600px] rounded-full bg-chart-3/25 blur-[130px]" />
      <div className="absolute bottom-[5%] right-[10%] size-[350px] rounded-full bg-chart-4/15 blur-[100px]" />

      {/* Keeps text readable over the color layers. */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-transparent to-foreground/50" />
    </div>
  );
}
