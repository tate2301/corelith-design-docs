# Email kit · `kits/email/`

Six token-mapped transactional email templates, plus a gallery and a documented base shell. Paste-into-Postmark-or-Resend friendly.

## What's here

| File                    | Purpose                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| `index.html`            | Gallery — six iframe previews, variable lists, how-to-use, swatches.   |
| `_base.html`            | Documented skeleton every template extends. Reference only, not sent.  |
| `welcome.html`          | First sign-in. "Welcome to Corelith" + dashboard CTA + 3 starter tips. |
| `sign-in-code.html`     | Magic-link / OTP. Large 6-digit code in a monospace cell.              |
| `reset-password.html`   | Password reset link, expiry note, "ignore if not you" warning.         |
| `approval-request.html` | To a manager — summary card + Approve / Decline side-by-side CTAs.     |
| `receipt.html`          | Sale confirmation — line items table, totals, payment line.            |
| `owner-digest.html`     | Daily owner roll-up — 3 KPI tiles, alerts, "tomorrow" preview.         |

## Token lift

Hex values were copied **by hand** out of `tokens.css` and pinned in a header comment block at the top of every template, so a reviewer can diff what each template depends on without resolving CSS custom properties. CSS custom properties are deliberately avoided in the email bodies — Gmail webmail and Outlook strip-style passes drop them.

Lifted from `:root` in `/tokens.css`:

```
--canvas         #F7F8FA
--surface        #FFFFFF
--surface-muted  #F1F3F6
--text-strong    #16181D
--text-body      #262A33
--text-muted     #565C69
--brand          #0B5DF0
--brand-strong   #0944C2   (hover only, inside <style>)
--brand-soft     #E8EFFE
--border         #E5E8EE
--tone-success     #5E8E54   --tone-success-bg  #E7EFE0
--tone-warn        #B07626   --tone-warn-bg     #F4E6C5
--tone-danger      #B83A2A   --tone-danger-bg   #F6E2DD
```

If the design system rebrands, find-replace the hex in each template — that is the maintenance contract.

## How to use in Postmark / Resend / SES

1. Open the template, copy the HTML.
2. Paste into your provider's template editor.
3. Placeholders use `{{snake_case}}`. Postmark and Mustache-style engines accept this as-is. For Mailgun (`%recipient.var%`) or others, find-replace.
4. Send a test to your own Gmail and iOS Mail before publishing the template.

## Email-client compatibility

Targeted: Gmail webmail, iOS Mail, Outlook 365 web, Yahoo Mail.

- **Layout**: tables only. No flexbox, no grid.
- **Styles**: inline on every rendered element. `<style>` carries only the mobile `@media` collapse and CTA hover.
- **Fonts**: system stack only (`-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`). No webfont.
- **Width**: 600px outer table, collapses to 100% at `(max-width: 620px)`.
- **No CSS custom properties** in email bodies.

### What I punted on

- **Outlook desktop (Word renderer) dark mode**. Outlook on Windows runs an automatic color-inversion pass that mangles selectively-styled emails. The fix is `mso-hide`, conditional comments, and a duplicate dark palette — not in scope for P3·04. Light palette renders acceptably under inversion; if a customer complains, add the conditional block then.
- **MJML or Foundation for Emails source**. Hand-written HTML was the brief. If we end up maintaining ten more templates, revisit and compile from MJML.
- **Image hero / logo PNG**. Used a 28×28 colored `div` as the logo mark instead of an `<img>`. Trade-off: no asset to host, no Gmail "images off" failure mode, but no real logo either. Replace the div with an `<img width="28" height="28" alt="Corelith" src="…">` when the brand wordmark PNG lands.

## Gallery

Open `kits/email/index.html` in a browser. It loads the design-system stylesheets (`../../tokens.css`, etc.) for its own chrome, and renders each template inside a 320×360 iframe.
