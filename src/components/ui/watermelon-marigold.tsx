// GradientBackground — "Watermelon Marigold", made with the 21st.dev Gradient
// Builder and exported as live CSS.
// Zero dependencies.

export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        containerType: "size",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-0.8cqmin",
          filter: "blur(0.4cqmin)",
          backgroundColor: "#FF5F6D",
          backgroundImage:
            "linear-gradient(120deg, #FF5F6D 0%, #FFC371 100%)",
        }}
      />
    </div>
  )
}
