# Konva create-tool hit testing (missed clicks)

## Symptom

While drawing a chart annotation with **click-create** tools (bounding box, polygon, point), the first corner/vertex usually registered, but the next click often did nothing. A second click in the same place would then work. Drawing felt unreliable / “not acute.”

## Cause

Two Konva behaviors stacked:

1. **`click` requires the same hit target for mousedown and mouseup.**  
   Konva only fires `click` when the shape under the pointer at mousedown is the *same instance* as at mouseup (`Stage` click-start vs click-end shape).

2. **Rubber-band previews sit under the cursor and are rebuilt on mousemove.**  
   After the first point, `useVisualEffect` draws a preview rect/polyline on `layerInteraction` and destroys/recreates those nodes whenever the mouse moves (Vue-Konva reactivity workaround). That preview covers the drag region, so the second press often hits the preview. A tiny move between down and up replaces the preview node → mousedown shape ≠ mouseup shape → **no `click`**.

So the stage’s `@click` handler simply never ran for many “valid” second corners.

## Fix

In `chart/BaseOverlay/index.vue` (and preview configs in shape `useVisualEffect`):

1. **Record create points on `@mousedown`**, not `@click` — points commit on press, independent of Konva’s click pairing.
2. **Treat the interaction layer as preview-only:** `listening: false` on `layerInteraction` (and on preview rect/line configs) so rubber-band graphics never steal hit targets from the stage.

Selection of existing annotations is unchanged: the shapes layer still listens when no create points are in progress (`isLayerShapesListening`), and create still ignores presses whose target is an existing shape until at least one create point exists.

## Do not regress

- Do not switch create recording back to `@click` without solving preview hit stealing another way.
- Do not re-enable listening on `layerInteraction` or on active-rect / active-polygon preview nodes.
- If preview drawing moves to a different layer, keep that layer (or those nodes) non-listening.
