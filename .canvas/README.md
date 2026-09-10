# Design canvas sources

Working files for the Corelith v1 design-system canvas. Each `*.dc.html` is one
artboard; `canvas.json` lays them out. The published canvas is seeded from these
files — edit these, re-seed, republish. Never edit the seeded output.

- `_kit.css`   — the approved v1 tokens and component CSS. Every artboard inlines
                 it verbatim into its `<helmet><style>`. Change it here first.
- `_faces.html`— inline SVG face avatars (`f1`–`f8` adults, `c1`–`c3` learners).
                 Artboards paste it in; published artifacts cannot load remote images.
- `_brief.md`  — the authoring brief the artboards were written against.

The seeded `corelith-system.html` is a build artifact and is gitignored.
