# What you need to know — Week 5

Master study file for **2026-09-21 → 09-27**. Clerical: use that week’s Trello card when Active.

**Honorlock Quiz 5 (CS6460, Module 5) is due end of Week 6 — Sun 10/04 AOE.** Grind this CS6460 section on [0xbn.github.io/study](https://0xbn.github.io/study). Practice quiz is open; practice stems do not appear on the graded quiz.

**Rebuilt from the lessons (2026-09-29).** Module 5 raw lessons are filed at `cs6460-educational-technology/raw/week-05-ed-lesson-*.md` (11 lessons). Every card below now comes from those transcripts instead of practice-pool snippets. Title is a filing label; what the quiz keys on is the **claim sentence**.

**How to read this.** Card = **term + who**, then the claim he must recognize even when the options never say the title, plus a short picture of what it means. Acronyms are spelled out on the card line. Drill on [0xbn.github.io/study](https://0xbn.github.io/study).

**Still missing:** CS6795 weeks 5–7 terms (Quiz 4/5/6 are open notes and are not distilled in this file yet); Trello cards for weeks 5–7; no quiz stems filed anywhere, by design.

---

## CS6460 — Module 5 (Honorlock)

### Honorlock
- **Format:** 27 multiple choice, four options, 45 minutes, two attempts keep higher, different draw each time. Closed book, no notes, no internet, no scratch, no breaks, Chrome. Practice lives on the Honorlock tab.
- **Quiz shape:** one item per **pool** — what is this term, what did this person or paper actually claim, which story *is* that claim. Options are paraphrases of claims, not vocabulary words.

### 5.1 Measurement Fundamentals
- **Operationalization**: turning an abstract construct into concrete, observable, measurable indicators. “Critical thinking” is not a property in a student’s head the way temperature is in a gas — you decide what it means, then design a task that elicits it.
- **Criterion validity vs construct validity** (Lee Cronbach and Paul Meehl, “Construct Validity in Psychological Tests,” 1955): criterion validity asks whether scores predict an outside outcome (does the admissions test predict college GPA?); construct validity asks the deeper question — does the test measure the underlying thing at all?
- **Reliability**: would you get the same result if you measured again under the same circumstances? **Cronbach’s alpha** (Lee Cronbach, 1951, *Psychometrika*) is the most widely used way to quantify it.
- **Reliability ceilings validity**: a score drowned in random error cannot be a trustworthy signal of any construct. High reliability does not prove validity — a bootcamp exam with internal consistency 0.94 can still fail as a measure of job readiness.
- **Standard error of measurement (SEM)**: a 74 is a true score somewhere in a range around 74. Reporting “knows 74% of the material” is false precision, and that matters most when the score drives a high-stakes decision.
- **Norm-referenced vs criterion-referenced** (Robert Glaser, 1963, *American Psychologist*): norm means “compared to others, you are at the 80th percentile,” which only exists relative to that reference group; criterion means “relative to the standard, you did this.” Glaser’s complaint was that assessments were defaulting to norm-referencing when the learning goal needed a criterion — the bridge to Bloom’s mastery learning.
- **Fairness is a measurement property**: an unfair measurement is by definition an invalid one, not a separate ethical add-on. A half-ESL geometry class scoring lower can mean the test is measuring math plus second-language reading load.
- **Stereotype threat** (Claude Steele and Joshua Aronson, 1995, *Journal of Personality and Social Psychology*): simply reminding students of a negatively stereotyped identity before a test can suppress their performance. Steele’s later book is *Whistling Vivaldi* (2010).
- **Differential item functioning (DIF)**: students with equivalent ability perform differently on an item because of group membership. The fix is design work up front — the demographic questions moved to the end of standardized tests in the last 15 years because of exactly this research.
- **Standards for Educational and Psychological Testing** (AERA, APA, and NCME, 2014 edition): the field’s constitution for how tests are developed, validated, and used. Fairness has to be built in from the beginning, not reviewed at the end.

### 5.2 Taxonomies of Learning
- **Bloom’s original taxonomy** (Benjamin Bloom and colleagues, 1956, *Taxonomy of Educational Objectives: Handbook I, Cognitive Domain*): six categories of cognitive objectives — Knowledge, Comprehension, Application, Analysis, Synthesis, Evaluation — with the claim that they form a hierarchy.
- **Bloom’s as an audit tool**: the diagnostic question is “where does this task sit?” A test of nothing but recall measures only the bottom level, no matter how hard the content is.
- **Revised taxonomy** (Lorin Anderson and David Krathwohl, 2001): the version everyone means today. Verbs instead of nouns, plus a separate knowledge dimension (factual, conceptual, procedural, metacognitive) that turns the list into a grid for aligning objectives with assessments.
- **Hierarchy critique**: “you must know before you can comprehend” does not hold cleanly, and some tasks are demanding at a low level. **Webb’s Depth of Knowledge** asks the different question — how deeply does a student have to think to complete this task — without asserting a ladder.
- **SOLO taxonomy** (John Biggs and Kevin Collis, 1982, *Evaluating the Quality of Learning*): judges the structure of the **response** rather than the type of question. Prestructural (misses the point, responds irrelevantly or tautologically), Unistructural (one relevant element), Multistructural (several, unconnected), Relational (integrated), Extended Abstract (goes beyond the given, transfer).
- **Gagné’s conditions of learning**: nine events of instruction plus five learning outcome categories that answer a different question than Bloom — declarative fact, intellectual skill, cognitive strategy, attitude, motor skill. Assessing an intellectual skill requires novel problems; reusing the practice examples measures memory of those instances.
- **Choosing a taxonomy** (Joyner’s split): Bloom’s 2001 for shared language and a cognitive audit, SOLO for how structured the response is, Gagné to ask what *kind* of learning a task represents.

### 5.3 Assessment Styles
- **Diagnostic assessment** (David Ausubel, 1968): measuring the starting point before you design the path — his opening line is that the most important single factor influencing learning is what the learner already knows. Classic instrument: the **Force Concept Inventory** (David Hestenes and colleagues, 1992). Temptation: a diagnosis nobody acts on.
- **Formative vs summative** (Michael Scriven, 1967, “The Methodology of Evaluation,” carried to student learning by Bloom and colleagues, 1971): formative informs and changes what happens next; summative is a verdict on learning that already happened. It is a property of the **use**, not of the instrument — the same quiz is formative if its results change the next move.
- **Black and Wiliam** (1998, “Inside the Black Box”): the influential articulation that assessment is formative only if its results change what happens next.
- **Trap of routine assessment** (Justin Reich): chasing formative assessment through whatever is cheap and auto-gradable quietly narrows the course toward what the software can score.
- **Testing effect / retrieval practice** (Henry Roediger and Jeffrey Karpicke, 2006): students who tested themselves beat students who reread the passage — but only on a **delayed** test a week later, and the rereaders predicted they had done better. Spaced-repetition tools like SuperMemo are this engine.
- **Adaptive assessment**: every question is chosen to be maximally informative about this learner, so the test converges on their level instead of administering one fixed form. It rests on **item response theory (IRT)**, formalized in Frederic Lord’s 1980 book. **Bayesian knowledge tracing** (Albert Corbett and John Anderson, 1995) is the Module 2 cousin for modeling a knowledge state.
- **Stealth assessment** (Valerie Shute, 2011): measurement so embedded in the activity that it disappears, usually inside a game or simulation. Its computing engine is **evidence-centered design** (Robert Mislevy, Linda Steinberg, and Russell Almond, around 2003): competency model → evidence model → task model.
- **Measuring changes what it measures**: measuring learning is like a quantum measurement — the act of measuring moves the value.
- **Five takeaways framing** (Joyner): you never measure learning directly, only proxies; validity comes before reliability; reliability ceilings validity and every score carries error; know whether you compare students to each other or to a standard; and fairness is part of measurement quality.

### 5.4 Grading Philosophies
- **Four jobs of a grade**: communicate, sort, motivate, give feedback. One number is being asked to do all four at once.
- **Point-based grading**: accumulate points, average into a percentage, map to a letter — and it is trivially automatable, which is why so many tools assume it.
- **Starch and Elliott** (Daniel Starch and Edward Elliott, 1912 and 1913): the same English paper handed to different teachers, or to the same teacher on different days, drew wildly different marks.
- **Douglas Reeves** (2004, “The Case Against the Zero,” *Phi Delta Kappan*): the arithmetic case against averaging a zero into a course grade.
- **Ruth Butler** (1988): comments-only feedback beat grades-only and grades-plus-comments for later performance — the mark can crowd out the message.
- **Standards-based grading** (Thomas Guskey, Ken O’Connor, Robert Marzano): report what the student knows against standards instead of an accumulated point total; O’Connor’s 2007 book reads as a direct reply to point grading. Motivation trap: knowing the grade can be recovered later makes students stop trying now, then fall too far behind to catch up.
- **Specifications grading** (Linda Nilson, 2015, *Specifications Grading*): work is judged pass/fail against a clearly written standard and bundled into sets; blunt and high-stakes per bundle, but nothing gets averaged away.
- **Contract grading** (Peter Elbow and Jane Danielewicz, 2009, “A Unilateral Grading Contract to Improve Learning and Teaching”): the most distinct philosophy, because it changes who decides the grade and what the grade is based on. Equity pushed furthest by Asao Inoue, *Labor-Based Grading Contracts* (2019). Its response to bias is to take the unreliable quality judgment out of the grade.
- **Ungrading** (Alfie Kohn, 2011, “The Case Against Grades”; Susan Blum, 2020, *Ungrading*): maximize feedback and minimize or eliminate grades when the mark itself causes the harm — safe projects, ignored critique text — and replace the reported number with feedback plus a closing conversation.

### 5.5 Feedback Frameworks
- **Feedback defined**: usable information about the gap between where a learner is and where they are going.
- **Kluger and DeNisi** (Avraham Kluger and Angelo DeNisi, 1996, *Psychological Bulletin*): landmark meta-analysis of hundreds of studies. Feedback improved performance on average, but in roughly a third of cases it made performance **worse** — not neutral, worse.
- **Hattie and Timperley** (John Hattie and Helen Timperley, 2007, “The Power of Feedback”): four levels — task, process, self-regulation, self. Task-level verdicts carry the least; self-level praise carries no task information and points attention at the ego.
- **Sadler’s three conditions**: the learner must know the standard, compare their performance to it, and act to close the gap.
- **Guild knowledge** (Royce Sadler): the expert’s often-tacit, hard-to-articulate sense of what good work looks like. It does not travel to the student through a margin comment.
- **Why feedback bounces**: it assumes a shared concept of quality that the novice does not yet have.
- **Dialogic feedback** (David Nicol and Debra Macfarlane-Dick, 2006, “Formative assessment and self-regulated learning”): a two-way conversation in which meaning is negotiated, not delivered.
- **New paradigm** (David Boud and Elizabeth Molloy, 2013): feedback is a process learners drive, not a product teachers deliver. **Feedback literacy** (David Carless and David Boud, 2018): appreciating feedback, judging quality, managing emotion, taking action.
- **Technology drifts toward the weakest feedback**: what it does well — immediate, scalable, continuous — is also instant, one-way, task-level. Valerie Shute (2008) and Georgia Tech’s Socratic Mind tutor are the conversation-side counterexamples.
- **Feedback in the platform**: an automated hint engine can give comments without ever holding a dialogue, which is the dialogic feedback gap at scale.

### 5.6 Alignment and Rubric Design
- **Constructive alignment** (John Biggs, 1996): outcomes, activities, and assessment all aimed at the same target, designed in that order. Close cousin of Wiggins and McTighe’s backward design from Module 3.
- **A rubric’s first job is reliability**: pulling many graders toward the same judgment, which is the inconsistency Starch and Elliott documented.
- **Analytic vs holistic rubrics**: analytic rubrics score the parts separately; holistic rubrics judge the whole. Choosing between them is a validity decision, not a style preference.
- **Granularity trap**: “2 points each for describing the three causes of World War II” tells students that three are wanted, so recognizing scope stops being part of the task. The rubric’s grain has quietly changed the construct.
- **Criteria compliance** (Harry Torrance, 2007): the detailed transparency meant to support learning can shift effort from learning the material to satisfying the checklist — his name for it is “assessment as learning” bottoming out into criteria compliance.
- **Transparency tension** (Joyner): more transparency is not automatically better. The rubric that makes grading consistent should be detailed and private; the rubric students see should be high-level enough to preserve judgment — detailed for intro courses, high-level for advanced ones where judgment *is* the construct.
- **Jonsson and Svingby** (2007 review): well-designed rubrics improve scoring reliability, and the gain shows up when the rubric comes with exemplars and grader training.

### 5.7 Peer Assessment
- **The giver learns more** (Nancy Falchikov and colleagues): peer assessment earns its place as a learning activity, not just a scaling convenience.
- **Falchikov and Goldfinch** (48 pooled studies): peer and teacher marks correlate reasonably well on average — students in aggregate are not wildly unreliable graders.
- **Holistic criteria beat checklists**: peer marks track expert marks best when students make a global judgment against well-understood criteria rather than scoring many separate dimensions.
- **Averaging cancels random error, not shared bias**: more peer raters do not save you from a systematic bias, which is why multiple raters did not deliver the improvement classical test theory predicts.
- **Reliability vs fairness**: peer grades can be consistent for reasons that have nothing to do with the work.
- **Meta-reviewers** (Joyner’s OMSCS experiment): graders evaluate the work in the context of the peer reviews it already received, so expert feedback gets better without slowing down. Peer, expert, and self review are composable, each with a comparative advantage.

### 5.8 Ethical Considerations in Researching Learners
- **Belmont Report** (1979): the document that anchors U.S. human-subjects ethics, from Nuremberg Code (1947) through the Tuskegee study (1932–1972) to the National Research Act (1974). Three principles: respect for persons, beneficence, justice.
- **IRB and the Common Rule**: the review board must approve research with human subjects before it begins, and the Common Rule adds a subpart of extra protections for children.
- **What counts as human-subjects research**: generality, participation, and voluntary agreement — a clue that people are participants, a way for them to agree, and an agreement that is not coerced.
- **Undue influence**: the subtler pressure of not wanting to disappoint the person who controls your grade, not just “participate or else.”
- **Captive population**: students are not free-floating volunteers — they are embedded in the class, which is why researchers insulate the teacher role from the study role.
- **FERPA** (Family Educational Rights and Privacy Act, passed 1974): governs who may access a student’s education records and under what conditions, which shapes what researchers can do with grades and transcripts.
- **Data stewardship over time**: research data persists, gets shared, and gets re-analyzed years later — one consent for a hint study does not license training a dropout model later.
- **inBloom** (collapsed in 2014): the cautionary tale for centralizing student data for personalized learning — the collapse came from parent and public concern about exactly these privacy risks.
- **Equipoise**: experimentation is justified when you genuinely do not know which condition is better. “We already believe our change improves things” is why randomized controlled trials are rare in education.
- **Facebook emotional contagion study** (2014): optimization plus intent to publish is research, and research has rules. The A/B illusion is that we condemn the experiment more than the untested rollout it replaced.
- **Responsible practice is a disposition**: distrust your own neutrality, minimize data, honor equipoise, respect students as people.

### 5.9 Ethical Considerations in Assessment
- **Campbell’s Law** (Donald Campbell, 1976): the more a quantitative indicator is used for high-stakes decisions, the more it is subject to corruption pressures and the more it distorts the process it was meant to monitor. **Goodhart’s Law** is the economist cousin: attach high stakes to a proxy and people optimize the proxy, not the learning.
- **Bias at scale**: a biased assessment deployed widely harms an entire population in the same direction at once, which is why fairness gets more urgent, not less, as the tool reaches more learners.
- **Algorithmic scoring is opaque and gameable**: a scorer trained on past human judgments learns those judgments’ biases and applies them with a veneer of objectivity, and it rewards surface features that correlate with quality without being quality.
- **Perelman’s gibberish** (Les Perelman): machine-generated, syntactically elaborate, meaningless essays that earn top scores — the gameability warning for automated essay scoring.
- **2020 UK exam-grading episode**: the grading algorithm downgraded disadvantaged students at scale — bias laundered as objectivity.
- **Keep machine judgment accountable**: interrogable, audited, appealable, and answerable to a human. Letting a machine judge a learner heightens the obligation, it does not reduce it.
- **Assessment data stewardship**: collect only what the assessment requires, be transparent with learners about what is captured and why, secure it, and do not repurpose it. No IRB is required to owe learners that.
- **Humility as a stance**: hold scores lightly even while acting on them.

---

## CS6795 (open notes)
**Quiz 4 closed Sun 9/27.** This file previously recorded Quiz 4 as covering lessons 11–12; the staff rule (Ed #15: quizzes test the *previous* week, and its own example is “quiz 5 → week 5 material”) implies Quiz 4 covered lessons 9–10 (Thagard Ch. 11–14) and that lessons 11–12 are the **Quiz 5** core due 10/04. Brian sat the quiz, so Canvas settles it. Terms for lessons 11–12 are distilled in [Week 6 Know](week-06-know.md).
