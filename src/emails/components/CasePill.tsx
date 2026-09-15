import { BRAND_COLORS } from "@/lib/site-config";

export default function CasePill({ caseNumber }: { caseNumber: string }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={{ margin: "0 0 22px" }}>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${BRAND_COLORS.mist}`,
              borderRadius: "20px",
              padding: "8px 16px",
              fontFamily: "'IBM Plex Mono','Courier New',monospace",
              fontSize: "12.5px",
              color: BRAND_COLORS.ink,
            }}
          >
            <span style={{ color: BRAND_COLORS.green }}>●</span> Case No. {caseNumber}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
