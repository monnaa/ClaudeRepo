import { loadFont } from "@remotion/google-fonts/Poppins";

export const { fontFamily } = loadFont("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});

export const COLORS = {
  ink: "#0E0F13",
  lime: "#C6FF3D",
  coral: "#FF5C39",
  white: "#FFFFFF",
  muted: "#A3A7B3",
  card: "#1B1D24",
};
