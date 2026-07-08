import type { SVGProps } from "react";
import { profileFor, type Profile } from "@/constants/profiles";

/**
 * Blueprint-style body elevations. Geometry lives in constants/profiles.ts
 * (shared with the Design Studio); this file owns the RENDERING: body ink,
 * a lighter glass band, half-tone seams and marks, tire/rim/hub wheels —
 * all currentColor, so context sets the ink.
 *
 * <ProfileSvg> renders any Profile with optional studio transforms (wheel
 * scale, ride height, extra author strokes); <Silhouette> keeps the classic
 * body-style API on top of it.
 */

export function ProfileSvg({
  profile,
  strokeWidth = 1.3,
  wheelScale = 1,
  rideHeight = 0,
  extraStrokes = [],
  className,
  ...rest
}: SVGProps<SVGSVGElement> & {
  profile: Profile;
  strokeWidth?: number;
  /** multiplies tire/rim radius (studio knob) */
  wheelScale?: number;
  /** raises the body off the axles by this many canvas units (studio knob) */
  rideHeight?: number;
  /** author-drawn strokes (already validated M/L/Q path data) */
  extraStrokes?: string[];
}) {
  const p = profile;
  return (
    <svg
      viewBox="0 0 96 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      {...rest}
    >
      {/* the body (and the author's pen) lift together; wheels keep the road */}
      <g transform={rideHeight ? `translate(0 ${-rideHeight})` : undefined}>
        <path d={p.body} />
        {p.dlo ? (
          /* glass band a touch lighter than the body — a draftsman's ink */
          <path d={p.dlo} strokeWidth={strokeWidth * 0.72} opacity={0.75} />
        ) : null}
        {[...p.seams, ...p.accents].map((d) => (
          <path key={d} d={d} strokeWidth={strokeWidth * 0.7} opacity={0.5} />
        ))}
        {extraStrokes.map((d, i) => (
          <path key={`x-${i}`} d={d} strokeWidth={strokeWidth * 0.85} />
        ))}
      </g>
      {p.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={31.5} r={p.wheelR * wheelScale} />
          <circle
            cx={cx}
            cy={31.5}
            r={p.wheelR * wheelScale * 0.58}
            strokeWidth={strokeWidth * 0.77}
          />
          <circle cx={cx} cy={31.5} r={1} fill="currentColor" stroke="none" />
        </g>
      ))}
    </svg>
  );
}

export function Silhouette({
  bodyStyle,
  strokeWidth = 1.3,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { bodyStyle: string; strokeWidth?: number }) {
  return (
    <ProfileSvg
      profile={profileFor(bodyStyle)}
      strokeWidth={strokeWidth}
      className={className}
      {...rest}
    />
  );
}

export default Silhouette;
