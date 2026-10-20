import React from "react";
import type { components } from "@/schemas/dweos";

type FeatureSupport = components["schemas"]["FeatureSupport"];

// Relative global State
const FeaturesContext = React.createContext<FeatureSupport | undefined>(
  undefined
);

export default FeaturesContext;
