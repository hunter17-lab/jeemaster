# Mock Hub Test Series and CBT

## What will change

- Add a simple admin area to manage coaching series (name, optional description, logo) and their named tests (iframe URL).
- Add a Mathango 2027 QFT section to Mock Hub. Admins can upload named HTML papers; students can open them in an isolated, interactive test frame using the supplied card reference. Existing Mock Hub styling and other sections stay intact.
- Replace the current verified-PYQ-only “Generate My Test” action with AI-created practice tests, as requested. Add exam, class scope, subjects, chapters, topics, four difficulty levels, question count, question types, and optional integer-type selection. Generated questions are labeled AI-created, not PYQs.
- Add the timed CBT player: question palette, answer tracking, Previous/Next, Mark for Review, Save & Next, numerical keypad for integer questions, submit confirmation, and a results/solutions view. Save generated tests and completed attempts in Lovable Cloud so answers and scores are available after refresh.

## Technical approach

- Add Cloud tables for series, tests, and user-owned test attempts. Public users can read published series; only admins can manage series and papers; each student can access only their own attempts. Add the required grants and row-access policies in the same migration.
- Store logos and uploaded HTML papers in a dedicated public asset bucket with admin-only uploads. Run uploaded paper code only in a sandboxed iframe without same-origin access to the main site.
- Generate questions in a server-side Edge Function through Lovable AI, validate the request and response, and keep credentials out of the browser. Use the existing syllabus content, extending it for NEET/Biology and selectable topics. Integer questions will be generated per selected chapter using the requested 20% rule and scored against the nearest non-negative integer.
- Keep the existing Mock Hub navigation and layout, adding only the requested areas and the CBT screens. Use the attached image as a card-style reference, not as an app asset.
- Remove the surfaced broad giveaway-media read policy while preserving the narrower existing reads for public prizes and approved proofs, then mark that security finding fixed.

## Validation

- Add focused tests for integer-question allocation/rounding and test scoring/navigation state.
- Verify database access boundaries, generation validation and error messages, CBT submission/results, and the series/paper management flow. The exact Mathango papers can only be checked after you upload them; no sample paper or fake test data will be left in the database.
