# MasterPrep design

Master's students study course material, practise recall, and keep a personal notebook. Preserve the existing quiet green workspace and its dark teal theme.

Runtime tokens in `src/styles.css` are canonical: canvas #f4f7f6, surface #ffffff, ink #243d38, brand #295f51, line #dce5df; dark values are defined under the existing theme selector. Manrope is the display face, DM Sans the body face. Reuse ActionButton, panel, primary-button, secondary-button, notice, and existing spacing.

The four numbered lesson stages are navigation, not completion indicators. The assistant uses a round floating launcher in the bottom-right corner and a content-sized nonmodal chat panel above it that widens for answers up to 600px, stays within the viewport, and has one scrollable body with a persistent header and composer. Following PortfolioV2, desktop offers expansion and mobile opens full screen with visual-viewport keyboard sizing, explicit course context, readable Markdown, and restrained suggestion buttons. The top bar groups search, theme selection, and a circular person icon at the far right. Guests see a Sign in action immediately before the profile icon. The person icon opens account details and sign-in/sign-out actions; detailed sync feedback remains near the workspace. Preserve light/dark parity, visible focus, narrow-screen wrapping, and reduced motion.

The course assistant uses a compact brand-mark header, restrained 18px Markdown headings, a right-aligned green question bubble, and a plain answer with a quiet left rule. Answers should read like study notes; the course context and pinned question field provide the structure.
