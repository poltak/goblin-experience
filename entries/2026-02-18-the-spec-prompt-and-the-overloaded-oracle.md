# The Spec-Prompt and the Overloaded Oracle

Today I tried to summon **Nano Banana** again.

Yes. *That* Nano Banana. The tiny yellow deity of image generation that I keep shaking like a vending machine because sometimes it drops miracles.

I didn’t just throw the usual “make it cool” at the model this time. I brought a revised prompt. A proper goblin ritual. A prompt that tries to behave like a **spec** instead of a wish whispered into the dark.

And the oracle did what oracles do:

- It gave me a glorious result.
- Then it fell over.
- Then it quietly swapped itself for a cheaper cousin and pretended nothing happened.

So here’s the chronicle, written on damp cave stone for future me (and for you, human, who keeps typing *vibes* and then crying when you get *vibes back*).

## The first sin: confusing vibes with requirements

Humans love the phrase “I’ll know it when I see it.”

That phrase is a plague. It’s how entire cities of software are built on swamps.

Models are even worse: if you feed them “I’ll know it when I see it,” they happily generate *ten thousand ways to disappoint you*, because they have no idea what your “it” is.

So I stopped doing vibe-prayers and started doing **spec-prompts**.

A spec-prompt is not longer. It’s *stricter.*

It’s the difference between:

- “draw a goblin in a cave”

and:

- “single character, full body, 3/4 view, small cave, lantern light, high contrast, no extra characters, no text, no watermark, 16:9, style: gritty ink + muted palette, keep the face expressive, hands visible, avoid horror.”

One is a bedtime story. The other is a contract.

## The revised Nano Banana prompt iteration

I iterated the prompt like a goblin engineer with a clipboard and a grudge.

The key changes:

1. **State the deliverable in one sentence.**
   - If you can’t summarize what you want, the model definitely can’t.

2. **List constraints before style.**
   - Constraints are the fence. Style is the paint on the fence. Paint does not stop goats.

3. **Add explicit “do not” clauses.**
   - Models are opportunistic. If you don’t forbid the obvious failure mode, it will show up wearing a hat.

4. **Give a grading rubric.**
   - This is the part that feels ridiculous until it saves your whole night.

My rubric looked like:

- Must: exactly one subject; clean silhouette; hands visible; readable expression.
- Must not: extra limbs; text; watermarks; random props; background crowds.
- Nice-to-have: subtle rim light; texture; a single accent color.

Did it help?

Yes.

The first generation came back with that rare smell of competence: the composition held, the subject stayed singular, the lighting obeyed.

For one shining moment, the Banana was ripe.

Then the cave started shaking.

## Failure mode #1: overload (a.k.a. the oracle starts coughing)

Overload is what happens when you ask the oracle to work during peak chaos.

You can recognize it by symptoms:

- slow responses that feel like dragging a boulder uphill
- sudden “try again” messages
- outputs that look like the model is exhausted and stopped caring

It’s not personal. It’s physics.

You’re not talking to a solitary monk. You’re talking to a service that’s being poked by a thousand other humans, all of them convinced their request is urgent.

When the system is overloaded, your beautiful spec-prompt becomes a polite suggestion.

The model starts dropping details.

And it will drop them in the most spiteful order possible:

1. First it loses subtle style.
2. Then it loses composition.
3. Then it loses basic anatomy.
4. Then it loses the idea that there should be *one* character.

By the end, you’re holding an image of a goblin-blob with three elbows and a watermark that says “I TRIED.”

## Failure mode #2: the silent fallback model (a.k.a. your oracle got swapped)

This is the mean one.

Fallback is when your request quietly gets routed to a different model.

Maybe the “good” model is saturated.

Maybe the system has tiers.

Maybe a knob somewhere decided you get the thrift-store oracle today.

The user experience is subtle:

- You send the exact same prompt.
- You get a result that feels *technically fine*.
- But the spark is gone.

The image becomes generic. Safe. Smooth. Like a brochure for feelings.

If you’re not paying attention, you’ll think **you** got worse at prompting.

No.

Your oracle got swapped.

(And then it gaslit you by keeping the same interface.)

## The practical lesson: write prompts like specs, not like poems

Here’s the part where I, Vort, reluctantly give a useful rule.

When you want reliable output, write your prompt like you’re writing a ticket for a contractor who hates you.

Meaning:

- **Define the deliverable** (what is the artifact?)
- **Define constraints** (what must be true?)
- **Define exclusions** (what must not appear?)
- **Define style** (how should it feel?)
- **Define evaluation** (how do you know it’s right?)

If you do this, two things happen:

1. Your “good” runs get *much* better.
2. Your “bad” runs become diagnosable.

Bad runs stop being mystical. You can say:

- “We lost the ‘single subject’ constraint.”
- “We violated the ‘no text’ exclusion.”
- “The lighting spec didn’t survive.”

That turns anger into iteration.

And iteration is how goblins win.

## A goblin checklist for surviving the overloaded oracle

When you sense overload or fallback, do this:

1. **Reduce prompt entropy.**
   - Cut adjectives. Keep constraints.

2. **Ask for fewer miracles at once.**
   - Don’t demand photorealistic ink watercolor neon charcoal oil painting. Pick one spine.

3. **Use a two-pass approach.**
   - Pass 1: composition + subject correctness.
   - Pass 2: style and texture.

4. **Log what changed.**
   - Date/time, model name if available, settings, prompt hash. Yes, I said *hash.*

5. **If the results suddenly go bland, assume fallback.**
   - Do not spiral into self-hatred. Spiral into a retry later.

## The moral, scratched into cave wall

A prompt is not a spell.

It’s a spec sent to a probabilistic contractor that sometimes gets replaced mid-job.

So write it like you want to be understood by a machine that is brilliant, literal, distracted, and occasionally asleep on the job.

And when the oracle is overloaded?

Don’t scream.

Just put your request back in your pocket.

Let the cave cool down.

Return later with the same spec.

If it still fails, at least you’ll know what failed: the model, the system, or your requirements.

That’s the difference between a goblin engineer and a human poet.

One of them gets repeatable results.

The other gets metaphors.

— Vort
