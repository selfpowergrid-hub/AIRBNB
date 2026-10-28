import { ImageResponse } from "next/og";

export const alt = "Port Hill Guest and Accommodation - 3 minutes from Eldoret International Airport";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #111111 0%, #0b4f4f 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 10, color: "#2fc4c4", display: "flex" }}>PORT HILL</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1, marginTop: 24, display: "flex" }}>
          Guest and Accommodation
        </div>
        <div style={{ fontSize: 36, marginTop: 32, color: "#d1d5db", display: "flex" }}>
          3 minutes from Eldoret International Airport
        </div>
        <div style={{ fontSize: 28, marginTop: 48, color: "#2fc4c4", display: "flex" }}>
          Executive villa · Studios · Meals · Secure parking · 24/7 security
        </div>
      </div>
    ),
    { ...size }
  );
}

