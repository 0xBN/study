#!/usr/bin/env python3
"""Build Module 3/5 scene-quiz banks from Know + marked practice samples."""

from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "decks"


def item(id_, lesson, tag, stem, correct, wrongs, explain, *, source="know"):
    choices = [{"id": "a", "text": correct, "correct": True}]
    for i, w in enumerate(wrongs[:3]):
        choices.append({"id": chr(ord("b") + i), "text": w, "correct": False})
    return {
        "id": id_,
        "lesson": lesson,
        "tag": tag,
        "source": source,  # "know" | "practice-sample"
        "stem": stem,
        "choices": choices,
        "explain": explain,
    }


def pack(id_, title, week, items):
    return {
        "id": id_,
        "title": title,
        "weekId": week,
        "sessionSize": 27,
        "note": (
            "Know-generated scenes + practice-sample items marked "
            'source="practice-sample" (format calib from Canvas practice; '
            "not graded-quiz stems). Choices are paraphrases, not vocab titles."
        ),
        "items": items,
    }


def build_m3():
    items = []

    # --- Know-generated (original scenes) ---
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
            "TPACK (Mishra and Koehler) extends Shulman by adding Technological Knowledge as a third base domain.",
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
            "Joyner's TPACK point: technology can qualitatively change representation and pedagogy, not mere efficiency.",
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
            "TCK = how a tool reshapes what content is foregrounded / askable. Budget and load are nearby, not TCK.",
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
            "Angeli and Valanides: TPACK as design capacity — tools encode pedagogy and content moves.",
        )
    )
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
            "Joyner: challenging driving questions lack a single correct key.",
        )
    )
    items.append(
        item(
            "collab-is-zpd",
            "3.2 PBL",
            "collaboration / ZPD",
            "A studio insists every project is solo so 'everyone is accountable.' The PBL lesson would push back how?",
            "Peers are a core support source inside the zone of proximal development, not just a way to split chores.",
            [
                "Groups exist mainly so stronger students can lecture weaker ones.",
                "Groups exist so the public product looks larger to outsiders.",
                "Collaboration is optional flavor once authenticity is secured.",
            ],
            "Vygotsky framing in the lesson: peers supply ZPD support; collaboration is structural.",
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
            "If the project is the learning, assess that artifact — not a later MC proxy.",
        )
    )
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
            "Wiggins & McTighe 1998 UbD introduced backward design as a practical package.",
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
            "Joyner names the assessment-last order as a motivation/effectiveness trade-off.",
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
            "Joyner: curriculum is architecture, not inventory.",
        )
    )
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
            "Spatial contiguity = nearness of related words and pictures.",
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
            "Joyner: cluster 1 = protect WM from waste; cluster 2 = structure complex content arrival.",
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
            "Modality: graphics + spoken words beat graphics + competing on-screen text.",
        )
    )
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
            "Mace = architecture; Rose & Meyer at CAST = UDL.",
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
            "Joyner's most important contrast: multiple means for all, not style sorting.",
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
            "Curb-cut effect: design for edge cases improves the default experience.",
        )
    )
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
            "Joyner and Isbell space axis: co-located with instructor; cohort-remote; fully remote alone.",
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
            "Content outlives the cohort — design and invest accordingly.",
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
            "Certificate ≠ institutional credit claim without verification rigor.",
        )
    )
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
            "Typing alone ≈ Substitution; spell/search/reorder/submit gains ≈ Augmentation.",
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
            "Complementary: SAMR diagnoses degree of change; TPACK evaluates design wisdom.",
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
            "Higher on SAMR is not always better; match level to the goal.",
        )
    )
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
            "Triggering → exploration → integration → resolution. Integration needs discourse.",
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
            "Weak social presence → less intellectual risk → weaker cognitive presence.",
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
            "Facilitating discourse guides interaction; it does not replace it with the key.",
        )
    )
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
            "For now: disclose generation, means, and human judgment.",
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
            "Academic success + cultural competence + sociopolitical consciousness; the third critiques the success system.",
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
            "Separate knowledge from format; can't-show-it-this-way ≠ doesn't-know-it.",
        )
    )

    # --- Practice-sample items (from Brian's Canvas practice paste; format calib) ---
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
            "Practice-sample shape: definition stem. Claim = TK as third foundational domain.",
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
            "Practice-sample scene (Desmos). Same claim as Know tech-changes-representation card.",
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
            "Practice-sample TCK vignette. Correct choice = content foregrounding, not ZPD/budget/load.",
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
            "Practice-sample with Joyner feedback: no single right answer to judge against.",
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
            "Practice-sample who/what stem. Tyler/Bruner/Bloom are sibling curriculum names.",
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
            "Practice-sample definition stem. Segmenting / signaling / temporal contiguity are siblings.",
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
            "Practice-sample who-did-what. Roberts/Oliver/learning-styles myth are distractors.",
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
            "Practice-sample PIM definition. Community matters most at integration.",
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
            "CTT: Observed = True + Error.",
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
            "Noise-dominated scores cannot validly indicate a construct.",
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
            "Reliability ≠ validity; know what construct you hit.",
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
            "SOLO Prestructural = off-point / irrelevant.",
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
            "Type problem ≈ weak on kind of learning; hierarchy problem is the other critique.",
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
            "Same items confound skill with instance memory.",
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
            "What you can grade automatically starts to define the curriculum.",
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
            "Testing effect claim targets lasting retention.",
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
            "ECD: competency model → evidence model; do not invert from cheap logs.",
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
            "Course voice: communicate / sort / motivate / feedback.",
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
            "Contract grading shifts decision rights and basis, not only the rubric text.",
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
            "If the symbol is the distortion, ungrading targets the symbol.",
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
            "Guild knowledge = tacit expert quality sense; it travels poorly.",
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
            "Without a shared standard, feedback has nowhere to land.",
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
            "Without the target, reviews cannot share a standard.",
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
            "Analytic = separate criteria, separate scores.",
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
            "Visible grain can change what cognitive work is required.",
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
            "Construct assessed drives whether and how to show rubrics.",
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
            "Correlated bias survives the average.",
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
            "Same consistency word; fairness checks the wrong reasons for consistency.",
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
            "Meta-reviewer: staff grade in context of peer reviews; do not crown raw peer marks.",
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
            "Undue influence ≠ only blunt coercion; it includes grader-power pressure.",
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
            "Persistence and unforeseen reuse make privacy ongoing.",
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
            "Stewardship: revisit purpose; consent is not a blank check.",
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
            "Scale multiplies same-direction harm.",
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
            "Reach multiplies identical bias exposure.",
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
            "No research waiver for needless capture.",
        )
    )

    # Practice-sample items
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
            "Practice-sample definition stem for CTT equation.",
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
            "Practice-sample: reliability ceilings validity (noise blocks construct signal).",
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
            "Practice-sample ECD vignette: competency model before evidence model.",
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
            "Practice-sample with Sadler quote in feedback.",
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
            "Practice-sample wording of reliability vs fairness.",
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
            "Practice-sample meta-reviewer design; raw peer marks as final is warned against.",
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
            "Practice-sample: undue influence vs explicit coercion.",
            source="practice-sample",
        )
    )

    return items


def main() -> None:
    m3 = pack(
        "cs6460-m3-quiz",
        "CS6460 Module 3 · Scene quiz",
        "03",
        build_m3(),
    )
    m5 = pack(
        "cs6460-m5-quiz",
        "CS6460 Module 5 · Scene quiz",
        "05",
        build_m5(),
    )
    for p in (m3, m5):
        for it in p["items"]:
            assert sum(1 for c in it["choices"] if c["correct"]) == 1
            assert len(it["choices"]) == 4
            assert it["source"] in ("know", "practice-sample")
        path = OUT / f"cs6460-module-{p['weekId'].lstrip('0') or '0'}-quiz.json"
        # week 03 -> module-3, week 05 -> module-5
        path = OUT / (
            "cs6460-module-3-quiz.json"
            if p["weekId"] == "03"
            else "cs6460-module-5-quiz.json"
        )
        path.write_text(json.dumps(p, indent=2) + "\n", encoding="utf-8")
        n_src = sum(1 for it in p["items"] if it["source"] == "practice-sample")
        n_know = sum(1 for it in p["items"] if it["source"] == "know")
        print(f"{path.name}: {len(p['items'])} items ({n_know} know, {n_src} from source)")


if __name__ == "__main__":
    main()
