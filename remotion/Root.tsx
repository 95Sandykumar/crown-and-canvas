import React from "react";
import { Composition } from "remotion";
import { DailyPost, dailyPostDefaults } from "./DailyPost";

// Single fixed composition. Only the input props change per post — the layout,
// motion, and audio are locked so every reel is visually on-brand.
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DailyPost"
      component={DailyPost}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={dailyPostDefaults}
    />
  );
};
