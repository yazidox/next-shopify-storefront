---
version: alpha
name: ChronoStrap Custom Studio
description: Premium product configurator system for the custom strap experience.
colors:
  primary: "#0A0A0A"
  secondary: "#6C6A63"
  tertiary: "#FF3B30"
  neutral: "#F4EFE6"
  surface: "#FFFFFF"
  canvas: "#E9EDF0"
  border: "#DDD6CB"
  on-primary: "#F4EFE6"
  on-tertiary: "#0A0A0A"
typography:
  display:
    fontFamily: Archivo Black
    fontSize: 4.5rem
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: 0
  title:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0
  body:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: 0
  label-caps:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0.18em
rounded:
  sm: 4px
  md: 8px
spacing:
  xs: 6px
  sm: 10px
  md: 16px
  lg: 24px
  xl: 32px
components:
  configurator-panel:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    padding: 32px
  texture-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 12px
  canvas-stage:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  label-muted:
    textColor: "{colors.secondary}"
  tag-custom:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.sm}"
    padding: 6px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 16px
---

## Overview

ChronoStrap Custom Studio is a focused luxury configurator. The interface should feel quiet, exact, and editorial: the
3D strap is the product moment, while the controls behave like a premium checkout flow.

## Colors

Use warm neutral foundations, deep ink for hierarchy, and Chrono red only for interaction and selected accents. The
panel should not compete with the model canvas.

## Typography

Headlines use heavy display type only in the product viewport. Controls use compact Inter labels and calm body text so
the right panel stays functional.

## Layout & Spacing

The configurator panel is intentionally wider than a drawer. Texture choices need enough width for readable names, clear
OFFICIAL/CUSTOM tags, and consistent preview swatches.

## Shapes

Use 8px rectangles for cards and primary controls. Circular shapes are reserved for color swatches, icons, and selection
marks.

## Components

Texture cards must make source clear: OFFICIAL swaps a complete GLB package; CUSTOM applies a generated or uploaded
surface to the active model. Primary actions should be full width and anchored near the bottom of the panel.

## Do's and Don'ts

Do keep the customization path short: texture, color, initials, review.

Do preserve the live model as the dominant visual object.

Don't add explanatory blocks inside the app when labels or tags can carry the meaning.
