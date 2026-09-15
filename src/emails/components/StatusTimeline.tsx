import { BRAND_COLORS } from "@/lib/site-config";

const STEPS = [
  { label: "Submitted", sub: "Case received" },
  { label: "Verification Call", sub: "Agent confirms details" },
  { label: "Attorney Review", sub: "Firm decides next steps" },
];

/**
 * currentIndex is the step currently active/needing action. Steps before it
 * render as done (filled green), the step at it renders as current (blue
 * ring), steps after render as upcoming (mist outline). Pass 3 to show every
 * step as done — used by the final "retained" email.
 *
 * The dot-and-line node for each step is built as its own 3-cell table
 * (line-half / dot / line-half), all `valign="middle"` in the same row —
 * deliberately NOT using a shared border-top + negative-margin trick to pull
 * the dot onto the line, because Gmail strips negative margins and that
 * left the dots floating below the connector line. This version has no
 * negative margins anywhere, so the line passes through the dot centers in
 * every client.
 */
export default function StatusTimeline({ currentIndex }: { currentIndex: number }) {
  const isDone = (i: number) => i < currentIndex;
  const isCurrent = (i: number) => i === currentIndex;
  const segmentColor = (i: number) => (isDone(i) ? BRAND_COLORS.green : BRAND_COLORS.mist);

  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ margin: "22px 0 24px" }}
    >
      <tbody>
        <tr>
          {STEPS.map((step, i) => {
            const leftColor = i === 0 ? "transparent" : segmentColor(i - 1);
            const rightColor = i === STEPS.length - 1 ? "transparent" : segmentColor(i);
            const dotBorderColor = isDone(i)
              ? BRAND_COLORS.green
              : isCurrent(i)
                ? BRAND_COLORS.blue
                : BRAND_COLORS.mist;

            return (
              <td key={step.label} width="33.33%" valign="top" align="center" style={{ padding: "0 4px" }}>
                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
                  <tbody>
                    <tr>
                      <td width="50%" valign="middle" style={{ padding: 0, fontSize: 0, lineHeight: 0 }}>
                        <div style={{ height: "2px", backgroundColor: leftColor }}>&nbsp;</div>
                      </td>
                      <td width="16" valign="middle" align="center" style={{ padding: 0 }}>
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            backgroundColor: isDone(i) ? BRAND_COLORS.green : "#ffffff",
                            border: `2.5px solid ${dotBorderColor}`,
                            fontSize: 0,
                            lineHeight: 0,
                          }}
                        >
                          &nbsp;
                        </div>
                      </td>
                      <td width="50%" valign="middle" style={{ padding: 0, fontSize: 0, lineHeight: 0 }}>
                        <div style={{ height: "2px", backgroundColor: rightColor }}>&nbsp;</div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div
                  style={{
                    fontFamily: "'Inter',Helvetica,Arial,sans-serif",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: isDone(i) || isCurrent(i) ? BRAND_COLORS.ink : "#5b6478",
                    marginTop: "10px",
                  }}
                >
                  {step.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter',Helvetica,Arial,sans-serif",
                    fontSize: "10px",
                    color: "#5b6478",
                    marginTop: "2px",
                    lineHeight: 1.4,
                  }}
                >
                  {step.sub}
                </div>
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  );
}
