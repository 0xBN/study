#!/usr/bin/env python3
"""Build Module 3/5 scene-quiz banks from Know + marked practice samples.

sessionSize = 5 (think-hard drills).
Explains = layman claim + fully encapsulated why each tempting wrong dies.
"""

from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "decks"
SESSION = 5


def item(id_, lesson, tag, stem, correct, wrongs, explain, *, source="know"):
    choices = [{"id": "a", "text": correct, "correct": True}]
    for i, w in enumerate(wrongs[:3]):
        choices.append({"id": chr(ord("b") + i), "text": w, "correct": False})
    return {
        "id": id_,
        "lesson": lesson,
        "tag": tag,
        "source": source,
        "stem": stem,
        "choices": choices,
        "explain": explain,
    }


def pack(id_, title, week, items):
    return {
        "id": id_,
        "title": title,
        "weekId": week,
        "sessionSize": SESSION,
        "note": (
            f"Know scenes + practice-sample items (source=practice-sample). "
            f"Session draws {SESSION}. Explains are layman + why each wrong dies."
        ),
        "items": items,
    }


def build_m3():
    items = []

    # --- 3.1 ---
    items.append(
        item(
            "tpack-third-domain",
            "3.1 TPACK",
            "TPACK / Shulman",
            "A methods course already drills subject expertise and how to teach it. Faculty want a framework that also covers choosing and shaping tools. What does TPACK add to Shulman's picture?",
            "A third foundational domain — Technological Knowledge — that also creates new intersections with content and pedagogy.",
            [
                "A fourth 'classroom climate' domain that sits beside the original three.",
                "One composite teacher-skill score that replaces Pedagogical Content Knowledge.",
                "Nothing structural; it only renames Pedagogical Content Knowledge.",
            ],
            "TPACK adds Technological Knowledge as a real third base next to content and pedagogy, so tool choice is not an afterthought. Classroom climate is not that third base. A single skill score would erase the intersections, not explain them. Renaming Pedagogical Content Knowledge alone does not add technology.",
        )
    )
    items.append(
        item(
            "tpack-not-efficiency",
            "3.1 TPACK",
            "tech changes representation",
            "A chemistry unit moves from static textbook reaction diagrams to a tool where students scrub reaction time and watch bonds rearrange. Marketing calls it 'same lesson, faster drawing.' What is the stronger TPACK-aligned claim?",
            "The tool changes how the content can be represented and how instruction can be designed, not only how fast drawings appear.",
            [
                "Any live demo beats a textbook because spaced repetition is automatic.",
                "The only real gain is cutting the extraneous load of neat handwriting.",
                "Immediate feedback always outperforms delayed teacher comments, full stop.",
            ],
            "The win is a new way to see and teach the reaction, not speed alone. Spaced repetition is a different idea and is not automatic just because something is live. Handwriting load can matter, but that understates the representation change. Immediate feedback is not always better, and it is not the TPACK claim here.",
        )
    )
    items.append(
        item(
            "tck-what-gets-easy",
            "3.1 TPACK",
            "technological content knowledge",
            "A team debates a timeline animation versus a map learners can pan and filter by century. Which question most directly exercises technological content knowledge?",
            "Which option changes which aspects of the history become easy to notice and ask about?",
            [
                "Which option fits this year's media budget?",
                "Which option keeps novices inside the zone of proximal development?",
                "Which option uses fewer on-screen words?",
            ],
            "Technological content knowledge asks how the tool reshapes what parts of the subject are easy to see and question. Budget is logistics. Zone of proximal development is about help and readiness. Word count is load/layout, not how the content itself is foregrounded.",
        )
    )
    items.append(
        item(
            "tpack-design-capacity",
            "3.1 TPACK",
            "design capacity",
            "An authoring team ships a vocab trainer that only ever offers multiple-choice synonym picks. Teachers later say they 'cannot teach productive use' with it. Which TPACK framing fits?",
            "Building the tool already made pedagogical-content choices on teachers' behalf — a narrow activity type is baked in.",
            [
                "Teachers alone hold TPACK; tool authors sit outside the framework.",
                "The failure is only missing captions, so it is purely an accessibility issue.",
                "Any digital vocab drill automatically raises Technological Knowledge.",
            ],
            "When you design the tool you already chose how the content can be practiced — here, only synonym picks. Authors are inside that design capacity, not outside TPACK. Missing captions would be accessibility, not the whole problem. Digitized drills do not automatically equal good technological knowledge.",
        )
    )
    # alt face: vignette for TCK vs nearby loads
    items.append(
        item(
            "alt-tck-vs-extraneous",
            "3.1 TPACK",
            "technological content knowledge",
            "Reviewers keep arguing about font size and color contrast on a genetics sim. One person asks a different question: 'Does dragging alleles make inheritance patterns easier to notice than a static pedigree chart?' What kind of knowledge is that second question?",
            "Technological content knowledge — how the tool changes what of the science is easy to see and ask.",
            [
                "Only coherence — cutting decoration from working memory.",
                "Only pedagogical knowledge — classroom management of talk time.",
                "Only content knowledge — the Mendel facts themselves with no tool in view.",
            ],
            "That second question is about how the tool reshapes the content you can notice. Coherence is about cutting junk load. Pedagogical knowledge alone is teaching moves without the tool-content link. Bare Mendel facts are content knowledge with the tool ignored.",
        )
    )

    # --- 3.2 ---
    items.append(
        item(
            "driving-q-no-key",
            "3.2 PBL",
            "challenging driving question",
            "Two proposed unit drivers: 'List the stages of mitosis' versus 'How should our city redesign stormwater for the next decade?' On Joyner's cut, what makes the second the challenging driving question?",
            "It has no single right answer to grade against — answers can be better or worse, not keyed correct.",
            [
                "It must come from students' personal neighborhoods to count.",
                "It must require at least three academic subjects.",
                "It is challenging only if it fits neatly in one class period.",
            ],
            "Joyner's cut: a challenging driving question has no single correct key — only better and worse answers. Local community origin is nice but not his differentiator here. Multi-subject is optional. Fitting one period is logistics, not the challenge test.",
        )
    )
    items.append(
        item(
            "collab-is-zpd",
            "3.2 PBL",
            "collaboration / ZPD",
            "A studio insists every project is solo so 'everyone is accountable.' The project-based lesson would push back how?",
            "Peers are a core support source inside the zone of proximal development, not just a way to split chores.",
            [
                "Groups exist mainly so stronger students can lecture weaker ones.",
                "Groups exist so the public product looks larger to outsiders.",
                "Collaboration is optional flavor once authenticity is secured.",
            ],
            "Peers help you do what you cannot yet do alone — that zone of proximal development support is why collaboration is core. It is not mainly stronger kids lecturing. Looking impressive is not the reason. Authenticity does not make collaboration optional flavor.",
        )
    )
    items.append(
        item(
            "assess-the-make",
            "3.2 PBL",
            "assess the project",
            "A civics class spends a month building a public policy brief with critique cycles. The grade is a separate 50-item fact quiz the next week. Strongest objection from the lesson?",
            "Treat the brief and its drafts as the evidence of learning; the mismatched quiz ignores the actual work.",
            [
                "Keep the quiz but allow notes so retrieval is fairer.",
                "Keep the quiz and delay it two weeks for spacing.",
                "Add a one-paragraph reflection and keep the quiz as the main grade.",
            ],
            "If the month of making was the learning, grade that work. Open notes, spacing, or a tiny reflection still leave a mismatched quiz as the real measure.",
        )
    )

    # --- 3.3 ---
    items.append(
        item(
            "ubd-authors",
            "3.3 Curriculum",
            "backward design",
            "A design doc starts from 'learners will be able to critique a study's sampling' and only then picks activities. Which named move is that?",
            "Backward design (Wiggins and McTighe, Understanding by Design, 1998) — desired results and evidence before activities.",
            [
                "Tyler's 1949 four questions, which start from a topic inventory.",
                "Bruner's spiral, which only repeats the same lecture yearly.",
                "Bloom's taxonomy, which is itself a full curriculum design method.",
            ],
            "Starting from the end goal then building activities is backward design from Wiggins and McTighe (1998). Tyler starts from purposes too but is not the UbD package named here. Bruner's spiral revisits ideas at rising depth — not 'same lecture yearly.' Bloom's taxonomy labels thinking demand; it is not a full design method by itself.",
        )
    )
    items.append(
        item(
            "motivate-vs-ideal-order",
            "3.3 Curriculum",
            "sequence trade-off",
            "An instructor knowingly puts assessment topics after motivation and tech modules even though backward design would front-load assessment. How does Joyner frame that choice in this course?",
            "As a trade-off: a more motivating sequence accepted instead of a slightly more effective one.",
            [
                "As proof that sequence barely matters for adult learners.",
                "As evidence that backward design only applies to K-12.",
                "As an accidental leftover a future rewrite will silently fix.",
            ],
            "He names it as choosing motivation over a slightly better ideal order — not that sequence is irrelevant, not that backward design is K-12-only, and not a silent bug to patch later.",
        )
    )
    items.append(
        item(
            "inventory-not-curriculum",
            "3.3 Curriculum",
            "curriculum architecture",
            "A vendor delivers a spreadsheet of forty module titles with minute estimates and calls it 'the curriculum.' What is missing?",
            "Deliberate decisions about scope, sequence, depth, and path — a topic list is inventory, not curriculum.",
            [
                "Only a prettier slide theme for each title.",
                "A requirement that every title include a video.",
                "A rule that the most engaging titles must come first.",
            ],
            "A title list with times is inventory. Curriculum needs choices about how deep, in what order, and along what path. Themes, mandatory video, or 'fun first' do not supply that architecture.",
        )
    )

    # --- 3.4 ---
    items.append(
        item(
            "labels-beside-parts",
            "3.4 Mayer",
            "spatial contiguity",
            "A biology page shows a cell diagram on the left and a numbered legend of organelle names in a sidebar two columns away. Learners keep losing their place. Which Mayer principle is most directly violated?",
            "Spatial contiguity — corresponding words and images should sit near each other, not separated.",
            [
                "Modality — narration should replace all labels forever.",
                "Segmenting — the page must be split into separate downloads.",
                "Image principle — removing the instructor face would fix the legend gap.",
            ],
            "Related words and pictures should sit together — that is spatial contiguity. Modality is about spoken words with graphics versus on-screen text fighting the picture. Segmenting is pacing chunks. The image principle is about the talking head, not legend distance.",
        )
    )
    items.append(
        item(
            "cut-cluster-vs-pace-cluster",
            "3.4 Mayer",
            "first vs second cluster",
            "Joyner groups Mayer principles into clusters. A designer is deciding whether to delete decorative side stories versus whether to teach part names before a full system explanation. How do those cluster jobs differ?",
            "The first cluster ruthlessly cuts or reorganizes wasted load; the second paces and sequences genuinely hard material.",
            [
                "The first cluster is speculation; the second is the only empirical set.",
                "The first applies only to video; the second only to games.",
                "The first raises intrinsic load; the second only raises germane load by definition.",
            ],
            "First cluster = stop wasting working memory on junk. Second cluster = feed hard material in a learnable order and pace. Both are evidence-based guidance, not video-only or game-only, and the first is about cutting waste — not raising intrinsic load on purpose.",
        )
    )
    items.append(
        item(
            "narrate-not-caption-fight",
            "3.4 Mayer",
            "modality",
            "An interactive map highlights regions while a dense paragraph scrolls beside it; users say they cannot track both. Best Mayer-aligned change?",
            "Move the explanation into spoken narration timed with the visual highlights.",
            [
                "Keep both visual streams but enlarge the paragraph font.",
                "Force users to finish the paragraph with the map hidden, then show the map with silence.",
                "Add a third decorative animation to 'increase engagement.'",
            ],
            "Speak the explanation while the map moves so eyes are not reading and watching at once. Bigger type still leaves two visual jobs. Hide-then-silent-map loses the together timing. Extra decoration adds load.",
        )
    )
    items.append(
        item(
            "alt-spatial-vs-temporal",
            "3.4 Mayer",
            "spatial vs temporal contiguity",
            "A narrated animation plays the voiceover first, then the motion afterward with no speech. Separately, a diagram puts labels in a distant footer. Which fix matches which principle?",
            "Play voice and motion together (temporal contiguity); put labels next to the parts (spatial contiguity).",
            [
                "Both problems are only coherence — delete the animation entirely.",
                "Both problems are only segmenting — split into more downloads.",
                "Swap the fixes: put labels far away on purpose; delay narration on purpose.",
            ],
            "Temporal contiguity = matching sound and motion in time. Spatial contiguity = matching words and pictures in space. Deleting everything is coherence overkill. More downloads is segmenting. Swapping the fixes makes both problems worse.",
        )
    )

    # --- 3.5 ---
    items.append(
        item(
            "udl-from-architecture",
            "3.5 UDL",
            "Rose and Meyer / CAST",
            "Who moved Universal Design from buildings into learning design in the UDL origin story?",
            "David Rose and Anne Meyer at CAST, adapting Ron Mace's architectural Universal Design.",
            [
                "Ed Roberts founding the independent living movement alone as UDL.",
                "Mike Oliver inventing UDL as a medical-model fix.",
                "Bloom publishing UDL inside the cognitive taxonomy.",
            ],
            "Rose and Meyer at CAST adapted building Universal Design into learning. Roberts fought for curb cuts and independent living — not UDL authorship. Oliver is social-model disability theory. Bloom is taxonomy, not UDL.",
        )
    )
    items.append(
        item(
            "udl-everyone-not-sorted",
            "3.5 UDL",
            "UDL vs learning styles",
            "A product plan says: diagnose each learner as visual or auditory, then route them to one matched channel. How does UDL reject that plan?",
            "Provide multiple representations to everyone rather than sorting learners into single matched channels.",
            [
                "UDL only cares about assessment formats, never representation.",
                "UDL requires sorting once a preference quiz is validated.",
                "UDL and learning styles are identical except for branding.",
            ],
            "Universal Design for Learning gives everyone multiple ways in — it does not sort people into one 'style' pipe. Representation is central, not ignored. Preference quizzes are the learning-styles move UDL rejects. The two are not the same idea with new branding.",
        )
    )
    items.append(
        item(
            "access-helps-many",
            "3.5 UDL",
            "curb-cut effect",
            "Finance kills transcript support because 'few students list a hearing disability on the intake form.' Best lesson-backed reply?",
            "Access features often help many more people than the named disability group — the curb-cut pattern.",
            [
                "Only caption the hardest conceptual videos.",
                "Transcripts matter only under active regulation.",
                "The intake form already proves demand is negligible.",
            ],
            "Like curb cuts, transcripts help far more people than the checkbox count. Hardest-only captions and regulation-only logic miss that. The intake form undercounts everyday benefit.",
        )
    )

    # --- 3.6 ---
    items.append(
        item(
            "three-space-positions",
            "3.6 Distributed classroom",
            "space spectrum",
            "In the Distributed Classroom matrix, what are the three positions on the space spectrum?",
            "With the instructor; with a cohort but remote from the instructor; fully remote alone.",
            [
                "Main campus; satellite campus; any cafe the student picks.",
                "Proctored room; open book at home; unsupervised library.",
                "Live with instructor; watching a recording; never engaging.",
            ],
            "Space is about who you sit with: instructor, remote cohort, or alone. Campus labels, proctoring, and 'never engaging' are different axes.",
        )
    )
    items.append(
        item(
            "materials-outlive-cohort",
            "3.6 Distributed classroom",
            "invest in materials",
            "Why does the lesson argue for investing more in materials built for distributed classes?",
            "Those materials can outlive the original class and reach audiences you did not plan for.",
            [
                "Higher polish always raises course evaluations.",
                "Accreditation now scores production values directly.",
                "Distributed materials never need updates once filmed.",
            ],
            "Distributed materials travel past this semester's roster, so quality is worth it. Eval scores, accreditation polish myths, and 'never update' are not the argument.",
        )
    )
    items.append(
        item(
            "certificate-not-credit",
            "3.6 Distributed classroom",
            "certificate vs credit",
            "A professional series has weekly tasks and staff comments but never verifies who did the work and cannot put credit on a transcript. What can it honestly offer?",
            "A certificate recognizing structured completion with some accountability — not academic credit.",
            [
                "Academic credit, because staff comments equal assessment.",
                "Nothing at all beyond raw file downloads.",
                "Automatic provisional credit that converts later without new verification.",
            ],
            "Without verifying identity and meeting institutional standards you can offer a certificate, not transcript credit. Staff comments alone are not credit. You are not limited to raw downloads. Provisional auto-credit without verification is still dishonest as credit.",
        )
    )
    items.append(
        item(
            "alt-certificate-vs-credit",
            "3.6 Distributed classroom",
            "certificate vs credit",
            "A learner finishes every module and gets a PDF that says 'Completed with staff review.' No ID check happened. A friend asks if that counts like a university course on a transcript. Straight answer?",
            "No — that is certificate-style recognition, not academic credit backed by verified assessment.",
            [
                "Yes — any staff comment makes it credit.",
                "Yes — PDF completion always transfers as elective hours.",
                "No — and certificates are worthless in every context.",
            ],
            "Credit is an institutional claim with verification. This PDF is structured completion recognition. Staff comments do not mint credit. Transfer hours are not automatic. Certificates can still have real value without being credit.",
        )
    )

    # --- 3.7 ---
    items.append(
        item(
            "aug-vs-sub",
            "3.7 SAMR",
            "Augmentation",
            "Students used to handwrite lab notebooks. Now they type the same notebook structure, with search, easy reorder, and upload. Which SAMR level is that?",
            "Augmentation — same core task, with functional improvements beyond bare Substitution.",
            [
                "Substitution only — nothing functional changed.",
                "Modification — the task itself was redesigned.",
                "Redefinition — previously impossible collaboration across countries.",
            ],
            "Same notebook job with search/reorder/upload is Augmentation. Pure typing with no new function would be Substitution. Modification redesigns the task. Redefinition enables previously impossible work — not claimed here.",
        )
    )
    items.append(
        item(
            "samr-diagnoses-tpack-judges",
            "3.7 SAMR",
            "SAMR vs TPACK",
            "A team used SAMR to notice their app only replaces paper worksheets. What should TPACK add that SAMR does not?",
            "A judgment of whether pushing to a higher transformation level is pedagogically wise for this content and goal.",
            [
                "A competing account that replaces SAMR entirely.",
                "A rule that higher SAMR levels are always better.",
                "A claim that TPACK only measures how modest the tech use looks.",
            ],
            "SAMR tells you how much the task changed. TPACK asks whether going further is smart for this teaching goal. They work together. Higher is not always better. TPACK is not just another modest-use meter.",
        )
    )
    items.append(
        item(
            "hold-level-for-goal",
            "3.7 SAMR",
            "right level = goal",
            "Goal: students choose a statistical test and justify it. Software can auto-select the test; the instructor locks that feature and leaves choice to students. A colleague calls that 'wasted capability.' Evaluate.",
            "Holding integration at the level that serves the learning goal is deliberate, not a failure to climb SAMR.",
            [
                "Unused software features always mean the design is incomplete.",
                "Auto-select should always replace student choice to reach Modification.",
                "Showing only a final p-value is required by the modality principle.",
            ],
            "Match the tech level to the learning goal — here, choosing the test is the point. Unused features are not automatic failure. Climbing SAMR for its own sake can wreck the goal. Modality is about narration versus on-screen text, not p-values.",
        )
    )
    items.append(
        item(
            "alt-samr-ladder-trap",
            "3.7 SAMR",
            "SAMR levels",
            "Which pair is ordered from least to most transformative on the SAMR ladder?",
            "Substitution → Augmentation → Modification → Redefinition.",
            [
                "Redefinition → Modification → Augmentation → Substitution.",
                "Augmentation → Substitution → Redefinition → Modification.",
                "Modification → Substitution → Augmentation → Redefinition.",
            ],
            "SAMR climbs Substitution, Augmentation, Modification, Redefinition. The other orders scramble enhancement versus transformation.",
        )
    )

    # --- 3.8 ---
    items.append(
        item(
            "pim-integration",
            "3.8 CoI",
            "Practical Inquiry / integration",
            "In the Practical Inquiry Model, which phase is 'make sense of explored ideas and connect them into coherent understanding'?",
            "Integration — and it is where the community dimension matters most.",
            [
                "Triggering event — the spark that starts curiosity.",
                "Exploration — brainstorming without yet weaving.",
                "Resolution — only the final application test.",
            ],
            "Integration is the weaving phase after exploration. Triggering starts curiosity. Exploration is the open hunt. Resolution tests and applies the built understanding.",
        )
    )
    items.append(
        item(
            "social-unlocks-cognitive",
            "3.8 CoI",
            "social → cognitive presence",
            "A forum feels anonymous and chilly; few people risk half-formed ideas. Why does that hurt cognitive presence?",
            "Honest discourse needed for genuine integration is harder when people do not feel present as real people.",
            [
                "Instructors simply lack prior-knowledge dashboards in those courses.",
                "Isolated learners always skip readings by definition.",
                "Anonymity mainly adds extraneous load while scrolling.",
            ],
            "Without feeling like real people to each other, learners stop risking the talk that builds understanding. Missing dashboards, skipped readings, or scroll load are not the Community of Inquiry link named here.",
        )
    )
    items.append(
        item(
            "weave-not-answer-key",
            "3.8 CoI",
            "facilitating discourse",
            "Twenty thoughtful posts sit in parallel threads with no synthesis and the week is ending. Which teaching-presence move best fits facilitating discourse?",
            "Name which threads connect and ask the group to reconcile them.",
            [
                "Post the official correct synthesis and close comments.",
                "Only schedule a social icebreaker call and ignore the threads.",
                "Cut the required post count so fewer people write.",
            ],
            "Facilitating discourse means helping the group connect ideas while they talk — not replacing them with the answer key, not only running an icebreaker, and not just cutting volume.",
        )
    )
    items.append(
        item(
            "alt-pim-order",
            "3.8 CoI",
            "Practical Inquiry order",
            "Which order matches the Practical Inquiry Model cycle?",
            "Triggering event → exploration → integration → resolution.",
            [
                "Integration → triggering → resolution → exploration.",
                "Exploration → resolution → triggering → integration.",
                "Resolution → exploration → integration → triggering.",
            ],
            "Curiosity spark, then explore, then weave, then test/apply. The other sequences scramble the cycle.",
        )
    )

    # --- 3.9 ---
    items.append(
        item(
            "ai-be-transparent",
            "3.9 Ethics",
            "AI authorship",
            "Legal rules on AI-assisted student work are unsettled. What does the lesson call the most defensible ethical stance for now?",
            "Transparency about what was generated, by what means, and what role human judgment played.",
            [
                "Treat all AI output as public domain until courts finish.",
                "Ban any AI-touched artifact from credit automatically.",
                "Allow AI only on materials learners never encounter.",
            ],
            "For now: say what was generated, how, and what a human decided. Public-domain guesses, blanket credit bans, and 'hide AI from learners' are not the stance named.",
        )
    )
    items.append(
        item(
            "critique-while-succeeding",
            "3.9 Ethics",
            "Ladson-Billings",
            "Why is sociopolitical consciousness often the hardest of Ladson-Billings' three requirements?",
            "It asks educators to help students critique the systems they are also trying to succeed within.",
            [
                "It is simply the hardest item to put on a multiple-choice test.",
                "Teachers are assumed to have zero cultural knowledge whatsoever.",
                "It replaces academic success rather than sitting beside it.",
            ],
            "The hard part is critiquing the same systems students must also succeed in. Test format difficulty, 'zero cultural knowledge,' or replacing academic success are not the lesson's reason.",
        )
    )
    items.append(
        item(
            "format-not-construct",
            "3.9 Ethics",
            "inclusive assessment",
            "A course grades 'systems thinking' only via one high-stakes live debate. A student with strong written analyses tanks the debate format. Best ethics-aligned response?",
            "Offer multiple means of demonstrating mastery — the debate format is incidental to the stated construct.",
            [
                "Keep one format so ranking stays comparable.",
                "Only add growth-mindset comments and leave the single format.",
                "Assume more debate rehearsal always fixes a construct mismatch.",
            ],
            "If the goal is systems thinking, let people show it more than one way. One format for easy ranking can punish the format, not the thinking. Mindset comments or more rehearsal do not fix a mismatched measure.",
        )
    )

    # --- practice samples (from source) ---
    items.append(
        item(
            "src-tpack-extends-shulman",
            "3.1 TPACK",
            "TPACK / Shulman",
            "According to the TPACK lesson, how does TPACK extend Shulman's framework?",
            "It adds Technological Knowledge to Shulman's two as a third foundational domain.",
            [
                "It adds classroom context as a fourth domain alongside the original three domains.",
                "It replaces Pedagogical Content Knowledge with one unified measure of teacher skill.",
                "It separates content knowledge from subject matter expertise for the very first time.",
            ],
            "TPACK adds Technological Knowledge as a third foundation next to content and pedagogy. A fourth 'context' domain is not that move. Replacing Pedagogical Content Knowledge with one score erases the framework. Separating content from subject expertise is not what TPACK introduces.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-desmos-more-than-convenience",
            "3.1 TPACK",
            "tech changes representation",
            "Why does the TPACK lesson treat using Desmos to explore functions as more than a convenience over a chalkboard?",
            "Because technology changes how content can be represented and how instruction can be designed.",
            [
                "Because students retain more when a demonstration is repeated across spaced sessions.",
                "Because the tool reduces the extraneous load of drawing accurate graphs by hand.",
                "Because immediate feedback is more motivating than delayed feedback from a teacher.",
            ],
            "Desmos changes what you can show and how you teach — not merely speed. Spacing, handwriting load, and motivation-from-immediacy are different claims.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-tck-plate-sim",
            "3.1 TPACK",
            "technological content knowledge",
            "A design team is choosing between a narrated video about plate tectonics and a simulation in which learners drag plates and watch boundaries form. Which question in their review meeting most directly exercises technological content knowledge?",
            "Which option changes what aspects of the content are foregrounded and what questions get easy to ask.",
            [
                "Which option keeps learners inside the zone where they can succeed with a modest amount of help.",
                "Which option can be produced and maintained within the budget the team has been given this year.",
                "Which option imposes less extraneous cognitive load on a learner meeting the topic for the first time.",
            ],
            "Ask how the tool changes what of the science is easy to notice and question. Help level is zone of proximal development. Budget is logistics. Extraneous load is important but not technological content knowledge.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-driving-question",
            "3.2 PBL",
            "challenging driving question",
            "In the instructor's own stated view, what actually differentiates a challenging driving question?",
            "Whether there is a single right answer that responses can be judged against.",
            [
                "Whether the question can realistically be answered in the time available.",
                "Whether answering it requires knowledge drawn from more than one subject area.",
                "Whether the question grows out of a problem in the students' own community.",
            ],
            "Joyner: challenging driving questions have no single correct key. Time, multi-subject, and community origin are common textbook criteria he is not using as the differentiator here.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-wiggins-mctighe",
            "3.3 Curriculum",
            "backward design",
            "Who introduced the concept of backward design, and in what work?",
            "Grant Wiggins and Jay McTighe, in Understanding by Design, first published in 1998.",
            [
                "Benjamin Bloom and his colleagues, in their taxonomy of cognitive learning objectives.",
                "Ralph Tyler, in Basic Principles of Curriculum and Instruction, first published in 1949.",
                "Jerome Bruner, in The Process of Education, first published in 1960.",
            ],
            "Backward design as named here is Wiggins and McTighe 1998. Bloom labels thinking levels. Tyler is an earlier curriculum rationale. Bruner is spiral/process-of-education — not UbD.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-spatial-contiguity",
            "3.4 Mayer",
            "spatial contiguity",
            "Which of the following is the most correct statement of the spatial contiguity principle?",
            "Corresponding words and images should be near each other on the page or screen rather than separated.",
            [
                "People learn better when a complex lesson is presented in learner-paced segments than continuously.",
                "People learn better when cues highlight the organization and key ideas of the material being taught.",
                "Corresponding narration and animation should be presented simultaneously rather than in sequence.",
            ],
            "Spatial contiguity = put matching words and pictures near each other. Segments are segmenting. Cues are signaling. Narration with motion together is temporal contiguity.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-udl-rose-meyer",
            "3.5 UDL",
            "Rose and Meyer / CAST",
            "According to the Accessibility and Universal Design for Learning lesson, what did David Rose and Anne Meyer do?",
            "They adapted Universal Design from architecture to education at CAST.",
            [
                "They established the social model of disability within academic disability studies.",
                "They demonstrated that matching instruction to stated modality preferences fails.",
                "They founded the independent living movement and campaigned for curb cuts in Berkeley.",
            ],
            "Rose and Meyer brought Universal Design into learning at CAST. Social model, learning-styles myth-busting, and Berkeley curb cuts are other people/stories.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-integration-phase",
            "3.8 CoI",
            "Practical Inquiry / integration",
            "Which of the following is the most correct definition of the integration phase of the Practical Inquiry Model?",
            "Making sense of the ideas that emerged earlier and building connections between them.",
            [
                "A problem or question or situation that sparks curiosity and provides a reason for inquiry.",
                "Open-ended investigation of the problem space, where learners brainstorm and share ideas.",
                "Testing the understanding that was constructed and applying it to the original problem.",
            ],
            "Integration weaves explored ideas into coherent understanding. Sparking curiosity is triggering. Brainstorming is exploration. Testing/applying is resolution.",
            source="practice-sample",
        )
    )

    return items


def build_m5():
    items = []

    items.append(
        item(
            "ctt-equation",
            "5.1 Measurement",
            "Classical Test Theory",
            "On a practice run a learner scores 18. Classical Test Theory treats that 18 how?",
            "As Observed Score = True Score + Error — the number is never pure truth.",
            [
                "As True Score = Observed Score + Error, rearranging the same idea incorrectly.",
                "As Observed Score = Criterion Score + Norm Score.",
                "As Observed Score = True Score + Percentile Rank.",
            ],
            "The score you see is true ability plus mess — Observed = True + Error. Flipping True and Observed is the wrong equation. Criterion/norm and percentile are other ideas, not that central equation.",
        )
    )
    items.append(
        item(
            "reliability-ceiling",
            "5.1 Measurement",
            "reliability ceilings validity",
            "A dashboard swings wildly from day to day for the same learner with no real change. Why does that block validity claims?",
            "A measurement dominated by random error cannot be a trustworthy signal of any construct — reliability ceilings validity.",
            [
                "High reliability automatically proves the tool is valid for its purpose.",
                "Validity sets the maximum reliability a score can ever reach.",
                "Fairness to groups is unrelated to reliability.",
            ],
            "If the number is mostly noise, it cannot honestly point at the skill you care about. Reliable still is not automatically valid. Validity does not cap reliability that way. Fairness can still interact with reliability.",
        )
    )
    items.append(
        item(
            "consistent-still-wrong-construct",
            "5.1 Measurement",
            "reliable ≠ valid",
            "A certification exam has Cronbach alpha 0.95 across cohorts. Marketing wants to call it 'validated job readiness.' Strongest measurement objection?",
            "Consistency does not say what is being measured — highly reliable scores can still be invalid for that claim.",
            [
                "Internal consistency cannot be computed once more than one cohort exists.",
                "The claim holds if the exam is criterion-referenced instead of norm-referenced.",
                "The claim holds once standard error falls below one scale point.",
            ],
            "A steady score can still measure the wrong thing. Multi-cohort consistency is computable. Criterion vs norm referencing and tiny standard error do not by themselves prove job-readiness validity.",
        )
    )
    items.append(
        item(
            "alt-reliable-vs-valid",
            "5.1 Measurement",
            "reliable ≠ valid",
            "A scale weighs you at 182.0 every morning for a week — same number each day — but the true weight is 168 because it was never calibrated. What does that illustrate?",
            "High consistency (reliability) with the wrong target (invalid for true weight).",
            [
                "Low reliability but high validity.",
                "That reliability and validity are the same word.",
                "That calibration is irrelevant once scores stop bouncing.",
            ],
            "Same wrong number every day is reliable and still wrong. That is not low reliability. Reliability and validity are not synonyms. Calibration is exactly why the steady wrong reading fails.",
        )
    )

    items.append(
        item(
            "solo-prestructural",
            "5.2 Taxonomies",
            "SOLO Prestructural",
            "Asked to compare two sorting algorithms, a student writes a joke about laundry 'sorting' and never addresses runtime. Which SOLO stage fits?",
            "Prestructural — misses the point with irrelevant or tautological engagement.",
            [
                "Unistructural — one relevant element, narrowly connected.",
                "Multistructural — several relevant elements, unintegrated.",
                "Extended abstract — generalizes to a new domain.",
            ],
            "Prestructural = misses the point. One relevant bit would be unistructural. Several unconnected relevant bits would be multistructural. Extended abstract goes up a level of abstraction on purpose.",
        )
    )
    items.append(
        item(
            "bloom-type-problem",
            "5.2 Taxonomies",
            "Bloom type problem",
            "The lesson names Bloom's hierarchy problem and type problem. What is the type problem?",
            "Bloom handles how demanding a task is better than what kind of learning it represents.",
            [
                "Bloom cannot be used on open-ended work at all.",
                "Bloom ignores motor and attitude domains entirely by definition.",
                "Bloom handles kind of learning well but says nothing about demand.",
            ],
            "The type problem is weak on *kind* of learning while demand/hierarchy is handled better. Open-ended work is not banned. Motor/attitude domains are a different issue. The last option flips type vs demand.",
        )
    )
    items.append(
        item(
            "skill-vs-instance",
            "5.2 Taxonomies",
            "intellectual skill vs memory",
            "A final reuses the identical three troubleshooting tickets from last month's homework, then claims 'debugging mastery.' Strongest objection?",
            "Reused instances cannot separate intellectual skill from memory of those specific tickets.",
            [
                "Reuse is always best because retrieval practice prefers identical items forever.",
                "The final should open with an advance organizer naming the homework.",
                "Switching to a SOLO rubric alone fixes the reuse problem.",
            ],
            "Same tickets can be memorized as stories, not as transferable debugging skill. Identical forever is not required for retrieval practice. An advance organizer or SOLO rubric does not fix the confound.",
        )
    )

    items.append(
        item(
            "narrow-to-gradable",
            "5.3 Assessment styles",
            "auto-gradable narrowing",
            "A course adds daily auto-graded clicker items because they are cheap. Over a term, discussions and design critiques shrink. What danger does the lesson flag?",
            "Frequent cheap auto-gradable checks can quietly narrow the course toward whatever the software can grade.",
            [
                "They always raise stakes until learners hide confusion.",
                "They overload working memory by definition.",
                "They make every score stop separating learners.",
            ],
            "What the machine can score starts to become the whole course. Stakes, working memory, and separation can fail in other designs — they are not the narrowing danger named here.",
        )
    )
    items.append(
        item(
            "delayed-testing-effect",
            "5.3 Assessment styles",
            "Roediger and Karpicke",
            "Why does the lesson stress that the Roediger and Karpicke testing advantage showed on a delayed test?",
            "Durable retention, not immediate performance, is the measure that matters.",
            [
                "Immediate tests are unreliable whenever a passage is read twice.",
                "A week lets spacing replace the testing effect entirely.",
                "Learners cannot self-judge until about a week passes.",
            ],
            "They care about what sticks later, not how it looks right after study. Double reading does not make immediate tests meaningless. Spacing does not erase the testing effect. Self-judgment timing is a different claim.",
        )
    )
    items.append(
        item(
            "ecd-competencies-first",
            "5.3 Assessment styles",
            "evidence-centered design",
            "A game studio wants 'stealth assessment' of engineering reasoning from play logs alone. What should they settle first under evidence-centered design?",
            "Which competencies they intend to measure, before deciding what counts as evidence.",
            [
                "Which events are cheapest to log, then invent meanings later.",
                "Which levels feel hardest, for curve calibration first.",
                "Which playtesters match the marketing persona.",
            ],
            "Decide what skill you mean to measure first, then decide which logged actions would count as proof of that skill. Cheap logs invent meaning after the fact. Hardest levels calibrate difficulty, not the construct. Playtester personas are recruiting, not the measurement model.",
        )
    )
    items.append(
        item(
            "alt-ecd-definition",
            "5.3 Assessment styles",
            "evidence-centered design",
            "In evidence-centered design, what is the competency model versus the evidence model?",
            "Competency model = what you intend to measure; evidence model = which observable actions count as proof.",
            [
                "Competency model = the LMS gradebook columns; evidence model = the curve.",
                "Competency model = cheapest logs; evidence model = marketing claims.",
                "They are two names for the same checklist of quiz items.",
            ],
            "Competencies are the targets; evidence is what you will accept as signs of those targets. Gradebook columns, curves, cheap logs, and marketing are not those two models. They are not the same checklist under two labels.",
        )
    )

    items.append(
        item(
            "four-jobs-grade",
            "5.4 Grading",
            "four jobs",
            "According to the grading philosophies lesson, what four jobs is a grade asked to do?",
            "Communicate, sort, motivate, and give feedback.",
            [
                "Diagnose, sort, motivate, and remediate.",
                "Communicate, calibrate, rank, and certify competence.",
                "Certify, motivate, diagnose, and archive.",
            ],
            "Course voice: communicate, sort, motivate, feedback. The other lists swap in diagnose/remediate/calibrate/archive jobs the lesson is not using as the four.",
        )
    )
    items.append(
        item(
            "contract-who-decides",
            "5.4 Grading",
            "contract grading",
            "What most distinguishes contract grading from standards-based and specifications grading?",
            "It changes who decides the grade and what the grade is based on in the first place.",
            [
                "It alone uses written descriptions of acceptable quality.",
                "It alone permits reassessment.",
                "It alone reports each objective separately.",
            ],
            "Contract grading shifts who decides and on what basis. Written quality bars, reassessment, and separate objectives show up in the sibling systems too.",
        )
    )
    items.append(
        item(
            "mark-is-the-problem",
            "5.4 Grading",
            "ungrading",
            "Students chase safe projects that score well and ignore written critique beyond the letter at the top. Faculty conclude the mark itself is the problem. Which philosophy follows?",
            "Ungrading — replace the reported number with feedback and a closing conversation.",
            [
                "Standards-based grading — report each objective as a separate mastery mark.",
                "Specifications grading — judge each piece against a written bar.",
                "Contract grading — tie the grade to labor agreed in advance.",
            ],
            "If the letter/number is distorting behavior, ungrading removes that symbol. The other philosophies still center a reported mark structure.",
        )
    )
    items.append(
        item(
            "alt-grading-siblings",
            "5.4 Grading",
            "grading philosophies",
            "Match the philosophy to the move: (1) remove the score symbol, (2) agree labor/engagement up front, (3) judge each piece against a written quality bar.",
            "1 ungrading, 2 contract grading, 3 specifications grading.",
            [
                "1 specifications, 2 ungrading, 3 contract.",
                "1 contract, 2 specifications, 3 ungrading.",
                "1 standards-based, 2 ungrading, 3 contract.",
            ],
            "Ungrading drops the mark. Contract shifts the bargain of who decides. Specifications uses an explicit quality bar per piece. The other matchings scramble those.",
        )
    )

    items.append(
        item(
            "guild-knowledge",
            "5.5 Feedback",
            "Sadler guild knowledge",
            "A studio mentor can spot strong critique in seconds but struggles to write the rule for new TAs. Sadler would call that mentor's sense what?",
            "Guild knowledge — the expert's often-tacit sense of what good work looks like.",
            [
                "The published rubric criteria handed out before work begins.",
                "The shared vocabulary of a discipline's citation rules alone.",
                "Only procedures a newcomer masters by peripheral participation.",
            ],
            "Guild knowledge is the hard-to-say expert feel for quality. A printed rubric is explicit. Citation vocabulary alone is narrower. Peripheral participation is a learning path, not Sadler's name for that tacit feel.",
        )
    )
    items.append(
        item(
            "feedback-no-shared-standard",
            "5.5 Feedback",
            "why feedback bounces",
            "Carefully written comments keep bouncing. What does the lesson say is often why?",
            "Feedback presumes a shared standard of quality that teacher and student do not actually share.",
            [
                "Comments are too impersonal in register.",
                "The LMS displays poorly on phones.",
                "Comments were written before other papers were read.",
            ],
            "If teacher and student do not share what 'good' means, comments have nowhere to stick. Tone, phone layout, and grading order are lesser explanations here.",
        )
    )
    items.append(
        item(
            "show-the-aim",
            "5.5 Feedback",
            "peer review target",
            "Peer reviewers describe likes and changes but never see what the assignment was aiming at; authors call reviews arbitrary. Best fix from the lesson?",
            "Show reviewers the goal the work is aiming at before they write.",
            [
                "Let reviewers read each other before submitting their own.",
                "Require a compliment before any critique.",
                "Impose a fixed word count for depth.",
            ],
            "Without the aim, reviews cannot share a standard. Reading peers, forced compliments, or word counts do not supply the missing target.",
        )
    )

    items.append(
        item(
            "analytic-rubric",
            "5.6 Rubrics",
            "analytic rubric",
            "Which definition matches an analytic rubric?",
            "It breaks the work into separate criteria and scores each independently.",
            [
                "It compares every paper to one benchmark exemplar only.",
                "It waits until the whole stack is read before any score.",
                "It scores only against the range the cohort actually produced.",
            ],
            "Analytic = separate criteria, separate scores. One exemplar, wait-for-whole-stack, and cohort-range scoring are other rubric/grading moves.",
        )
    )
    items.append(
        item(
            "rubric-changes-construct",
            "5.6 Rubrics",
            "grain changes construct",
            "Rubric A awards points for naming each of three causes. Rubric B awards a pool for naming and describing causes without listing how many. Why can A assess a different construct?",
            "Telling students that three are wanted removes the need to recognize scope — different from recognizing and elaborating.",
            [
                "A is faster to grade, so it must measure the same thing.",
                "A uses fewer total points, so incompleteness costs less.",
                "A names the causes outright, so recall disappears entirely.",
            ],
            "Showing 'three' changes the mental work required. Speed and point totals do not prove same construct. The stem does not say A names the causes for the student.",
        )
    )
    items.append(
        item(
            "rubrics-by-course",
            "5.6 Rubrics",
            "show rubrics carefully",
            "A chair wants every course from survey to seminar to publish a full grading rubric with the syllabus. How should the lesson's argument be applied?",
            "Reject the blanket rule; set grain and visibility course by course according to the construct assessed.",
            [
                "Adopt it always — hidden criteria are always unfair.",
                "Adopt the opposite blanket ban on showing any rubric early.",
                "Adopt it only when multiple graders share a stack.",
            ],
            "Whether to show a fine-grained rubric depends on what you are measuring in that course. Always-show and never-show blankets both ignore construct. Multi-grader logistics alone is not the rule.",
        )
    )
    items.append(
        item(
            "alt-analytic-vs-holistic",
            "5.6 Rubrics",
            "analytic vs holistic",
            "A team wants one overall quality judgment per essay, not separate scores for thesis, evidence, and mechanics. What are they rejecting?",
            "An analytic rubric's separate criteria scores — they want a holistic overall judgment instead.",
            [
                "Evidence-centered design entirely.",
                "Any feedback to students.",
                "Contract grading's labor bargain.",
            ],
            "One overall mark is holistic; split criteria are analytic. That choice is not rejecting ECD, feedback, or contract grading as such.",
        )
    )

    items.append(
        item(
            "peer-errors-correlate",
            "5.7 Peer assessment",
            "averaging fails",
            "Why does averaging many peer raters often fail to remove error?",
            "Peer-rater errors are often not independent of each other.",
            [
                "Averaging needs a dozen raters before any effect begins.",
                "Peers always drift to the scale midpoint.",
                "Each extra rater adds more noise than they remove by definition.",
            ],
            "If everyone shares the same bias, the average keeps the bias. You do not need a magic dozen. Midpoint drift is one failure mode, not the general reason. Extra raters are not automatic net noise.",
        )
    )
    items.append(
        item(
            "reliable-vs-fair",
            "5.7 Peer assessment",
            "reliability vs fairness",
            "What distinguishes the reliability question from the fairness question in peer assessment?",
            "Reliability asks whether peer grades are consistent; fairness asks whether they are consistent for reasons that have nothing to do with the work.",
            [
                "Reliability asks accuracy; fairness asks whether students liked the process.",
                "Reliability asks stability over years; fairness asks rubric coverage.",
                "Reliability asks defensibility; fairness asks equal review workload.",
            ],
            "Reliability = do the marks agree. Fairness = do they agree for the wrong reasons (bias unrelated to the work). Liking the process, year-scale stability, and equal workload are different questions.",
        )
    )
    items.append(
        item(
            "meta-reviewer",
            "5.7 Peer assessment",
            "meta-reviewer design",
            "Staff write thin, slow feedback while unread peer reviews already exist on each submission. Which redesign matches the lesson?",
            "Have graders evaluate each submission alongside the peer reviews it already received.",
            [
                "Let raw peer marks stand as the final grade.",
                "Estimate ungraded papers from peer marks after sampling.",
                "Make staff write feedback before peers review so peers can copy tone.",
            ],
            "Staff become meta-reviewers: judge the work in light of the peer reviews. Raw peer marks as final, estimating the rest from peers, or staff-first modeling are not that design — and raw peer finals are warned against.",
        )
    )
    items.append(
        item(
            "alt-fair-not-reliable",
            "5.7 Peer assessment",
            "reliability vs fairness",
            "Peer scores on posters are almost identical across raters because everyone docks points for accent, not for poster quality. What passes and what fails?",
            "Reliability can look fine (they agree) while fairness fails (they agree for the wrong reason).",
            [
                "Fairness passes because agreement is high.",
                "Reliability fails because scores match.",
                "Both pass whenever scores match.",
            ],
            "Agreement from a shared irrelevant bias is reliable and unfair. High agreement is not fairness. Matching scores are exactly what reliability likes.",
        )
    )

    items.append(
        item(
            "undue-influence",
            "5.8 Research ethics",
            "undue influence",
            "What is undue influence in researching learners, as the lesson defines it?",
            "The subtler pressure of not wanting to disappoint the person who controls your academic fate.",
            [
                "An interface nudge the learner never notices.",
                "A researcher reading ambiguous results in their favor.",
                "Only the explicit threat of an academic penalty for declining.",
            ],
            "Undue influence is the quieter pull from the person who grades you. Dark-pattern nudges, motivated reading of results, and only blunt threats are different problems — the lesson separates undue influence from explicit coercion.",
        )
    )
    items.append(
        item(
            "privacy-persists",
            "5.8 Research ethics",
            "privacy over time",
            "Why is privacy in research harder than a single collection moment?",
            "Data often persists, gets shared, and gets re-analyzed for years in ways nobody foresaw.",
            [
                "Students can never object because instruments are invisible.",
                "Aggregation always strips detail so return is impossible.",
                "A legal exception always overrides student preferences.",
            ],
            "The hard part is long life and surprise reuse of the data. Invisible instruments, aggregation, and legal overrides are not the main lesson point.",
        )
    )
    items.append(
        item(
            "consent-not-forever",
            "5.8 Research ethics",
            "stewardship",
            "Consent covered a hint-system study. Years later another team wants that archive to train dropout prediction. Stewardship says?",
            "Reuse needs revisiting — one consent does not license any use forever.",
            [
                "Reuse is fine because no new collection occurs.",
                "Reuse is fine after a second de-identification pass alone.",
                "Reuse is barred because all research data must be destroyed at study end.",
            ],
            "New purpose needs a fresh look at consent. 'No new collection,' a second de-ID pass, or mandatory destroy-all are not the stewardship rule named.",
        )
    )
    items.append(
        item(
            "alt-undue-vs-coercion",
            "5.8 Research ethics",
            "undue influence vs coercion",
            "Syllabus says 'you may decline the study with no grade penalty,' but students still enroll because they do not want to disappoint the professor who grades them. Which problem is that?",
            "Undue influence — subtler pressure from the grader relationship, even without an explicit threat.",
            [
                "Only explicit coercion, because the syllabus already promised no penalty.",
                "Only a validity threat to Classical Test Theory.",
                "Only a curb-cut accessibility failure.",
            ],
            "No written penalty can still leave grader-power pressure — undue influence. That is not 'only coercion solved by syllabus text,' not Classical Test Theory, and not curb cuts.",
        )
    )

    items.append(
        item(
            "bias-at-scale",
            "5.9 Assessment ethics",
            "bias at scale",
            "What distinguishes a biased assessment deployed at scale from one used once?",
            "It harms an entire population in the same direction, all at once.",
            [
                "It becomes merely a compliance issue, not an ethical one.",
                "It becomes easier to ignore because errors average out.",
                "It harms a smaller share of learners by definition.",
            ],
            "Scale means the same skew hits many people together. It stays ethical, does not magically average away, and does not shrink the harmed share by definition.",
        )
    )
    items.append(
        item(
            "edtech-scale-fairness",
            "5.9 Assessment ethics",
            "fairness intensifies",
            "Why do fairness obligations intensify with scale, especially in educational technology?",
            "A tool that reaches many learners visits the same bias on all of them at once.",
            [
                "Only regulators care about classroom assessments.",
                "Larger populations need a separate norm table per subgroup first.",
                "Bias is only real once a sample is statistically large.",
            ],
            "Wide reach multiplies the same harm. Regulation, norm tables, and statistical detectability are not the intensifier named.",
        )
    )
    items.append(
        item(
            "capture-only-needed",
            "5.9 Assessment ethics",
            "privacy in products",
            "A quiz platform logs keystroke timing and mouse paths 'in case analytics wants them later.' Nothing affects scores; no IRB study is running. Lesson conclusion?",
            "Learners are owed the privacy interest anyway — capture only what the assessment requires.",
            [
                "Obligations begin only if findings are published later.",
                "Terms of service already satisfy the obligation.",
                "Only the licensing institution holds any duty.",
            ],
            "No live study and no score use still do not excuse vacuuming traces 'for someday.' Publication later, ToS checkboxes, and 'blame the school' do not clear the product team.",
        )
    )

    # practice samples
    items.append(
        item(
            "src-ctt-equation",
            "5.1 Measurement",
            "Classical Test Theory",
            "According to the Measurement Fundamentals lesson's on-screen text, which equation expresses the central relationship in Classical Test Theory?",
            "Observed Score = True Score + Error.",
            [
                "Observed Score = True Score + Percentile Rank.",
                "True Score = Observed Score + Error.",
                "Observed Score = Criterion Score + Norm Score.",
            ],
            "Observed = True + Error. Percentile and criterion/norm mixes are other ideas. Flipping True and Observed is the wrong equation.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-reliability-ceiling",
            "5.1 Measurement",
            "reliability ceilings validity",
            "What does the Measurement Fundamentals lesson mean when it says that reliability sets a ceiling on validity?",
            "A measurement dominated by random error cannot be a trustworthy signal of any construct.",
            [
                "A measurement that is highly reliable has thereby been shown to be valid for its purpose.",
                "A measurement's validity limits how reliable its scores are able to become in practice.",
                "A measurement can be no fairer to a group than its reliability for that group allows.",
            ],
            "Noise blocks a trustworthy signal of the thing you care about. High reliability does not prove validity. Validity does not cap reliability that way. Fairness is a related but different sentence.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-ecd-bridge",
            "5.3 Assessment styles",
            "evidence-centered design",
            "A studio is building a bridge-construction game and wants to measure engineering reasoning from play alone, with no quizzes anywhere in the product. Following evidence-centered design, what should the team settle first?",
            "Which competencies they intend to measure, before deciding what counts as evidence.",
            [
                "Which in-game actions the engine can log most cheaply, before deciding what they mean.",
                "Which levels are the hardest, so that the difficulty curve can be calibrated before launch.",
                "Which players to recruit for playtesting, so that the sample matches the target audience.",
            ],
            "Decide what skill you mean to measure first, then decide which logged actions would count as proof. Cheap logs invent meaning afterward. Hard levels calibrate difficulty. Playtester personas are recruiting.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-guild-knowledge",
            "5.5 Feedback",
            "Sadler guild knowledge",
            "According to the Feedback Frameworks lesson, what did Sadler call guild knowledge?",
            "The expert's often-tacit, hard-to-articulate sense of what good work looks like.",
            [
                "The list of criteria published in a rubric before learners begin an assignment.",
                "The body of procedures a newcomer masters, learned by working at the edge.",
                "The shared vocabulary a discipline uses to describe its standards of evidence.",
            ],
            "Guild knowledge is the expert's hard-to-say feel for quality. Rubrics are explicit. Edge procedures and shared vocabulary are neighboring ideas, not Sadler's name for that tacit sense.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-reliable-vs-fair",
            "5.7 Peer assessment",
            "reliability vs fairness",
            "What distinguishes the reliability question from the fairness question in peer assessment?",
            "Reliability asks whether peer grades are consistent, while fairness asks whether they are consistent for reasons that have nothing to do with the work.",
            [
                "Reliability asks whether peer grades are accurate, while fairness asks whether students found the process transparent.",
                "Reliability asks whether peer grades are stable over time, while fairness asks whether the rubric covered every objective.",
                "Reliability asks whether peer grades are defensible, while fairness asks whether everyone did an equal share of reviewing.",
            ],
            "Reliability = do they agree. Fairness = do they agree for irrelevant reasons. Transparency liking, long-term stability, rubric coverage, and equal workload are different tests.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-meta-reviewer",
            "5.7 Peer assessment",
            "meta-reviewer design",
            "A large online course has eight graders who each write feedback from scratch on three hundred submissions. Feedback is thin and slow. Peer review already happens before grading, and those reviews currently go unread by staff. Which redesign best matches the Peer Assessment lesson?",
            "Have graders evaluate each submission alongside the peer reviews it received.",
            [
                "Have graders mark a random sample and estimate the rest from the peer marks.",
                "Have graders read only the peer reviews and let the peer marks stand as the final grade.",
                "Have graders write their feedback before peers review, so peers have a model to imitate.",
            ],
            "Graders judge the work with the peer reviews in view — meta-review. Estimating from peers, crowning raw peer marks, or staff-first modeling are not that redesign.",
            source="practice-sample",
        )
    )
    items.append(
        item(
            "src-undue-influence",
            "5.8 Research ethics",
            "undue influence",
            "Which of the following is the most correct definition of undue influence?",
            "The subtler pressure of not wanting to disappoint the person who grades you.",
            [
                "The pull an interface exerts on a learner's choices without the learner noticing it.",
                "The tendency of a researcher to read ambiguous results in favor of their own hypothesis.",
                "The explicit threat that declining to participate will carry an academic penalty.",
            ],
            "Undue influence is quieter grader-power pressure. Dark-pattern pull, motivated interpretation, and explicit academic threats are neighboring problems — the last is coercion, not the subtler case.",
            source="practice-sample",
        )
    )

    return items


def main() -> None:
    m3 = pack("cs6460-m3-quiz", "CS6460 Module 3 · Scene quiz", "03", build_m3())
    m5 = pack("cs6460-m5-quiz", "CS6460 Module 5 · Scene quiz", "05", build_m5())
    for p in (m3, m5):
        for it in p["items"]:
            assert sum(1 for c in it["choices"] if c["correct"]) == 1
            assert len(it["choices"]) == 4
            assert it["source"] in ("know", "practice-sample")
            assert len(it["explain"]) > 80, it["id"]
        path = OUT / (
            "cs6460-module-3-quiz.json"
            if p["weekId"] == "03"
            else "cs6460-module-5-quiz.json"
        )
        path.write_text(json.dumps(p, indent=2) + "\n", encoding="utf-8")
        n_src = sum(1 for it in p["items"] if it["source"] == "practice-sample")
        n_know = len(p["items"]) - n_src
        print(
            f"{path.name}: {len(p['items'])} items "
            f"({n_know} know/alt, {n_src} from source), sessionSize={p['sessionSize']}"
        )


if __name__ == "__main__":
    main()
