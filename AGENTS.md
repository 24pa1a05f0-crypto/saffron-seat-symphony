<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Booking rules (hours, seats, slot length) live in `src/lib/restaurant.ts` AND the `validate_reservation` DB trigger; keep both in sync — the trigger is the real enforcement.
- Roles live in `user_roles`; the first account to sign up becomes admin via the signup trigger.
