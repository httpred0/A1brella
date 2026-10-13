export type Project = {
  number: string;
  category: string;
  title: string;
  description: string;
  image: string;
  ratio: string;
  href?: string; // external project link
};

/* Desktop composition: one line per word; `left` is the editorial
   indent, `gapTop` adds extra space above lines that sit tight
   against the previous one. */
export const heroWords: { text: string; left: string; gapTop?: string }[] = [
  { text: "AI-Studio", left: "3.5%" },
  { text: "Building", left: "56.5%" },
  // pushed down slightly from "Building"
  { text: "Products", left: "14.5%", gapTop: "0.18em" },
  { text: "for", left: "63.5%" },
  // pulled up slightly towards "for"
  { text: "Humans", left: "9.5%", gapTop: "-0.1em" },
  // extra breathing room: this line sits directly under "mans"
  { text: "& Machines", left: "38.5%", gapTop: "0.36em" },
];

/* Mobile composition: "Humans &" / "Machines" split across two lines
   frees the width for much larger type. */
export const heroWordsMobile: { text: string; left: string }[] = [
  { text: "AI-Studio", left: "0%" },
  { text: "Building", left: "22%" },
  { text: "Products", left: "5%" },
  { text: "for", left: "55%" },
  { text: "Humans &", left: "1%" },
  { text: "Machines", left: "14%" },
];

/* Code streams behind the hero type — three pools of pseudo-code that
   endlessly type, erase, and rewrite themselves. Lines stay short so
   nothing wraps inside a column. */
export const codeStreams: string[][] = [
  [
    `const studio = await a1brella.init({ region: "eu-west", seed: 42 })`,
    `const agent = studio.spawn({ role: "planner", model: "orakel-v2" })`,
    `agent.observe(worldState, { channels: ["sensor", "ops", "human"] })`,
    `const plan = agent.plan({ horizon: 12, budget: tokens(80_000) })`,
    `for (const step of plan.steps) await step.execute({ dryRun: false })`,
    `if (plan.confidence < 0.92) agent.replan({ strategy: "beam", k: 5 })`,
    `telemetry.trace("plan.settled", { id: plan.id, latencyMs: 142 })`,
    `const memory = new VectorStore({ dim: 1536, metric: "cosine" })`,
    `await memory.upsert(chunk.embedding, { ttl: "7d", src: "journal" })`,
    `const recall = await memory.query(intent, { k: 8, minScore: 0.72 })`,
    `ctx.inject(recall.map(r => r.text).join("\\n"), { role: "system" })`,
    `export default pipeline(observe, plan, act, reflect, checkpoint)`,
    `const critic = studio.spawn({ role: "critic", temperature: 0.2 })`,
    `critic.review(plan).then(patch => merge(patch, { atomic: true }))`,
    `await handoff(agent, human, { reason: "edge_case", urgency: "low" })`,
    `studio.on("drift", metrics => recalibrate(metrics, { decay: 0.9 }))`,
    `const guard = compose(piiFilter, jailbreakProbe, toxicityGate)`,
    `router.route(intent, { fallback: human, timeoutMs: 30_000 })`,
    `await journal.append({ actor: agent.id, action: plan.summary })`,
    `scheduler.every("5m", () => agent.sync({ source: "worldState" }))`,
  ],
  [
    `def train(model, corpus, epochs=64, lr=3e-4, warmup_steps=500):`,
    `    for batch in loader(corpus, shuffle=True, batch_size=128):`,
    `        loss = mse(model(batch.x), batch.y) + l2_penalty(w, 1e-5)`,
    `        opt.apply(tape.gradient(loss, w), clip_norm=1.0, lr=lr)`,
    `    if loss < 1e-3: checkpoint(model, tag=f"epoch_{epoch:03d}")`,
    `sampler = TopK(k=40, temperature=0.8, repetition_penalty=1.1)`,
    `tokens = model.generate(prompt, max_len=256, stream=True)`,
    `yield from stream(tokens, on_token=lambda t: emit("delta", t))`,
    `suite = EvalSuite.load("humans_and_machines", split="holdout")`,
    `report = suite.run(model, seed=1337, workers=8, verbose=False)`,
    `assert report.pass_rate > 0.99, f"regression: {report.failures}"`,
    `embed = encoder(text, normalize=True, pooling="mean", dim=1536)`,
    `index.add(embed, meta={"src": "journal", "ts": now().isoformat()})`,
    `df = df.dropna().pipe(tokenize).pipe(dedupe).cache("corpus_v3")`,
    `wandb.log({"loss": loss, "step": step, "lr": sched.get_last_lr()})`,
    `model.push("a1brella/orakel-v2", private=True, card=MODEL_CARD)`,
    `probe = LinearProbe(layer=-2).fit(activations, labels, l1=1e-4)`,
    `attention = rollout(attn_maps, discard_ratio=0.9, head="mean")`,
    `dataset = interleave(synthetic(0.3), curated(0.7), seed=1337)`,
    `distill(teacher=orakel_xl, student=orakel_mini, kl_weight=0.5)`,
  ],
  [
    `POST /v1/agents/run -> 202 accepted (trace 8f3a..c21, 142ms)`,
    `queue depth 17 -> 4 | in-flight 12 | dead-letter 0 | lag 8ms`,
    `gpu[0] util 94% mem 61% temp 71c | gpu[1] util 88% mem 57%`,
    `retry backoff 250ms -> 1s -> settled after 2 attempts (node-4)`,
    `deploy canary 5% -> 25% -> 100% | error budget burn 0.02%/h`,
    `guardrail pii_filter: passed (0 redactions, 34.1k tokens scanned)`,
    `guardrail jailbreak_probe: passed | toxicity_gate: passed (p=0.01)`,
    `eval suite 312/312 green | latency p50 88ms p95 1210ms p99 2.4s`,
    `cache hit ratio 0.87 | embeddings served 1.2m/day | evictions 3%`,
    `tokens/s 1840 sustained | burst 4200 | throttle events (24h): 0`,
    `autoscale replicas 3 -> 5 (cpu 78%, target 60%, cooldown 300s)`,
    `heartbeat agent.planner ok | agent.critic ok | agent.router ok`,
    `snapshot memory.vec (1.2gb) saved to s3://a1brella-prod/snap/`,
    `rollout paused: human approval required (policy: two_person)`,
    `approval granted by operator@a1brella | audit id 44c1..9e02`,
    `rollout resumed -> 100% | uptime 99.98% (30d) | mttr 4m12s`,
    `drift detector: embedding shift 0.03 (threshold 0.10) nominal`,
    `billing: 41.2m tokens today | forecast 1.24b/mo | cap 2.00b/mo`,
    `incident #0 open | last page 27d ago | on-call rotation: nika`,
    `cron nightly_distill ok (38m) | cron eval_sweep ok (12m)`,
  ],
];

export const categories = ["ON", "DESIGNING", "INTELLIGENT", "SYSTEMS"];

export const galleryProjects: Project[] = [
  {
    number: "(02)",
    category: "AGENTIC DESIGN SYSTEM",
    title: "Scadufax",
    description: "Generative identity for an ML research lab.",
    image: "/projects/scadufax.svg",
    ratio: "aspect-[4/3]",
    href: "https://www.scadufax.online",
  },
  {
    number: "(03)",
    category: "AI PERSONAL ASSISTANT",
    title: "Zappelin",
    description: "Editorial system for a prompt-engineering handbook.",
    image: "/projects/zappelin.svg",
    ratio: "aspect-[3/4]",
    href: "https://zappelin.com.br",
  },
  {
    number: "(04)",
    category: "PRODUCTS",
    title: "Mono Synth",
    description: "Interface for a latent-audio instrument.",
    image: "/projects/thumb-3.svg",
    ratio: "aspect-[4/3]",
  },
  {
    number: "(05)",
    category: "RESEARCH",
    title: "SC Papers",
    description: "Publication design for a scaling-laws series.",
    image: "/projects/thumb-4.svg",
    ratio: "aspect-[3/4]",
  },
  {
    number: "(06)",
    category: "AUTOMATION",
    title: "Relay Ops",
    description: "Control surface for autonomous pipelines.",
    image: "/projects/thumb-5.svg",
    ratio: "aspect-[4/3]",
  },
  {
    number: "(07)",
    category: "AI",
    title: "Petal Vision",
    description: "Computer-vision identity for a botanics startup.",
    image: "/projects/thumb-6.svg",
    ratio: "aspect-square",
  },
];

export const editorialProject = {
  number: "(08)",
  title: "About",
  description:
    "A1BRELLA is an AI-driven creative studio building intelligent products, autonomous agents, and generative brand systems. We work where design meets machine intelligence — treating models, data, and interaction as raw creative material. Our approach combines strategy, design systems, and applied research to ship clear, scalable, human-centred AI experiences.",
};
