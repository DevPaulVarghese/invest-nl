"use client";

export function Forest({ colors }: { colors: string[] }) {
  const total = colors.length;
  const cols = Math.ceil(Math.sqrt(total * 1.4));

  return (
    <div
      className="grid gap-[3px]"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
    >
      {colors.map((c, i) => (
        <span
          key={i}
          className="aspect-square w-full rounded-[2px] transition-colors duration-300"
          style={{
            backgroundColor: c,
            opacity: 0.85,
            animationDelay: `${i * 4}ms`,
          }}
          title={`Tree ${i + 1}`}
        />
      ))}
    </div>
  );
}
