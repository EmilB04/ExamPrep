# MasterPrep design

Master's students study course material, practise recall, and keep a personal notebook. Preserve the existing quiet green workspace and its dark teal theme.

Runtime tokens in `src/styles.css` are canonical: canvas #f4f7f6, surface #ffffff, ink #243d38, brand #295f51, line #dce5df; dark values are defined under the existing theme selector. Manrope is the display face, DM Sans the body face. Reuse ActionButton, panel, primary-button, secondary-button, notice, and existing spacing.

The four numbered lesson stages are navigation, not completion indicators. The assistant uses a round floating launcher in the bottom-right corner and a bounded, scrollable nonmodal chat panel above it, explicit course context, readable Markdown, and restrained suggestion buttons. Account status appears in the header with detailed sync feedback near the workspace. Preserve light/dark parity, visible focus, narrow-screen wrapping, and reduced motion.
