import { readdir, readFile, writeFile } from 'node:fs/promises'

const dataDir = new URL('../src/data/', import.meta.url)

const lenses = [
  ['mechanics', 'middle', 'Explain how {topic} works internally and which details matter in production.', 'Explain the execution model, lifecycle, guarantees, and boundaries. Distinguish specified behavior from implementation detail.'],
  ['design', 'middle', 'Design a production approach for {topic}. What decisions must be explicit?', 'Start from requirements and constraints. Define ownership, contracts, failure behavior, and operational responsibilities before selecting tools.'],
  ['tradeoffs', 'senior', 'What are the main trade-offs and alternatives around {topic}?', 'Compare options using correctness, latency, throughput, complexity, cost, and team capability. State when your preferred option stops being appropriate.'],
  ['debugging', 'senior', 'A production issue appears around {topic}. How do you investigate it?', 'Begin with impact and evidence. Reproduce or correlate the issue, narrow hypotheses with measurements, mitigate safely, then verify the root cause.'],
  ['performance', 'senior', 'How can {topic} become a performance bottleneck, and how would you improve it?', 'Measure before optimizing. Separate latency, throughput, resource use, contention, and tail behavior. Validate improvements against realistic load.'],
  ['reliability', 'senior', 'What failure modes should a Senior engineer anticipate when using {topic}?', 'Cover partial failure, retries, duplication, timeouts, overload, recovery, and degraded operation. Make assumptions and guarantees observable.'],
  ['security', 'senior', 'What security risks and trust boundaries exist around {topic}?', 'Identify assets, actors, inputs, privileges, and abuse cases. Apply least privilege, validation, safe defaults, auditability, and tested recovery.'],
  ['migration', 'senior', 'How would you introduce or migrate {topic} safely in an existing system?', 'Use incremental, reversible steps with compatibility periods, controlled rollout, metrics, and an explicit rollback path.'],
  ['testing', 'middle', 'How would you test and validate a system that relies on {topic}?', 'Test contracts, edge cases, concurrency, failures, and recovery. Combine focused tests with production-like integration and observability.'],
  ['scenario', 'senior', 'You must make an architectural decision involving {topic}. Walk through your reasoning.', 'Clarify goals and constraints, propose alternatives, choose deliberately, identify risks, and define how success and failure will be measured.']
]

const common = {
  'algorithms-data-structures': [
    ['complexity analysis and amortized cost', 'Algorithm analysis must define inputs, bounds, amortization, memory use, and the machine or workload assumptions that affect real performance.'],
    ['arrays, linked structures, stacks, and queues', 'Sequential structures differ in indexing, mutation cost, memory layout, locality, and the operations they make easy or expensive.'],
    ['hash tables, sets, and key design', 'Hash-based structures provide expected constant-time operations when hashing, equality, capacity, and collision behavior are well designed.'],
    ['trees, balanced search trees, heaps, and tries', 'Tree structures encode hierarchy or order; balance, branching, augmentation, and traversal determine their guarantees and use cases.'],
    ['graphs, traversal, and shortest paths', 'Graph algorithms depend on representation, direction, weights, cycles, connectivity, visited state, and the exact path or reachability guarantee required.'],
    ['sorting, selection, and binary search', 'Ordering and selection algorithms trade comparisons, memory, stability, adaptiveness, and key assumptions; binary search relies on precise invariants.'],
    ['recursion, backtracking, greedy algorithms, and dynamic programming', 'These problem-solving strategies differ in state exploration, repeated work, proof of correctness, pruning, and resource requirements.']
  ],
  javascript: [
    ['the event loop and task queues', 'JavaScript runs work to completion; microtasks are drained at defined checkpoints and can starve rendering or I/O when abused.'],
    ['closures and lexical environments', 'Closures retain access to lexical state; they enable encapsulation but can extend object lifetimes and create accidental memory retention.'],
    ['prototypes and property lookup', 'Property access follows the prototype chain; descriptors, inheritance, and mutation influence correctness, performance, and security.'],
    ['Promises and async control flow', 'Promises model eventual results; composition, cancellation strategy, bounded concurrency, and rejection handling determine production behavior.'],
    ['memory management and garbage collection', 'Reachability drives collection; leaks commonly come from retained listeners, caches, closures, timers, and detached objects.'],
    ['modules and package boundaries', 'ES modules have static structure and live bindings; package exports, cycles, side effects, and tree shaking shape maintainability and delivery.'],
    ['object identity, equality, and immutability', 'Reference identity affects comparison, caching, memoization, and state updates; copying does not automatically provide deep immutability.'],
    ['iterators, generators, and lazy processing', 'Iterator protocols enable pull-based lazy sequences; generators simplify stateful iteration but require clear error and cleanup semantics.'],
    ['browser concurrency and Web Workers', 'Workers provide isolated execution contexts and message passing; transferables and structured cloning affect throughput and ownership.'],
    ['JavaScript API and library design', 'Stable APIs require clear contracts, compatibility, error semantics, cancellation, and careful control of side effects.']
  ],
  promises: [
    ['Promise lifecycle, chaining, and composition', 'Promises model eventual outcomes; resolution, chaining, combinators, and error propagation determine control flow correctness.'],
    ['Promise microtasks and asynchronous errors', 'Promise reactions run through microtasks; scheduling, unhandled rejections, stack context, and ownership shape production behavior.'],
    ['Node.js Promise concurrency, cancellation, and integration', 'Node.js Promise code must respect downstream capacity, AbortSignal cancellation, callback boundaries, resources, and graceful shutdown.']
  ],
  typescript: [
    ['control-flow narrowing and type guards', 'TypeScript narrows through runtime checks and reachability; custom predicates and assertions must remain truthful.'],
    ['generics, constraints, and inference', 'Generics should preserve useful relationships between inputs and outputs while constraints expose only required capabilities.'],
    ['conditional and mapped types', 'Conditional and mapped types transform type relationships; distributivity and complexity can surprise callers and slow tooling.'],
    ['structural typing and variance', 'Structural compatibility enables flexibility but can admit unintended assignments; variance matters most for producers, consumers, and callbacks.'],
    ['discriminated unions and exhaustive checks', 'Discriminated unions model closed state machines and pair well with never-based exhaustiveness checks.'],
    ['runtime validation at boundaries', 'Static types disappear at runtime; external input must be parsed and validated before becoming trusted domain data.'],
    ['declaration files and module augmentation', 'Declarations describe runtime APIs; inaccurate declarations and broad augmentation create false confidence and global coupling.'],
    ['compiler configuration and project references', 'Strictness, module resolution, emit settings, and project references shape correctness, build speed, and package boundaries.'],
    ['public contracts and package versioning', 'Shared types reduce duplication but can couple releases; wire compatibility and runtime behavior remain the real contract.'],
    ['type-system complexity and developer experience', 'Advanced typing has a maintenance cost; useful safety must be balanced against readable errors, inference, and build performance.']
  ],
  vue: [
    ['Vue reactivity and dependency tracking', 'Vue tracks reactive reads and triggers dependent effects on writes; identity, destructuring, and deep reactivity affect behavior.'],
    ['computed values, watchers, and effects', 'Computed values are cached derivations; watchers coordinate side effects and require cleanup and scheduling awareness.'],
    ['component boundaries and data flow', 'Props down and events up keep ownership clear; provide/inject and stores should not hide domain boundaries.'],
    ['composables and reusable stateful logic', 'Composables package reactive logic; lifecycle, shared state, cleanup, and API shape determine whether they remain safe and reusable.'],
    ['Vue rendering and update performance', 'Stable props, code splitting, list virtualization, computed stability, and limited reactive depth reduce unnecessary work.'],
    ['SSR and hydration', 'SSR improves time-to-content but introduces request isolation, hydration matching, server-only constraints, and deployment complexity.'],
    ['state management and server state', 'Local UI state, URL state, server cache, and cross-cutting client state have different ownership and invalidation needs.'],
    ['forms and validation architecture', 'Production forms require accessible errors, async validation, dirty state, submission idempotency, and server-side validation.'],
    ['Vue application testing', 'Test behavior and contracts across composables, components, routing, and critical end-to-end flows without coupling to implementation details.'],
    ['Vue security and trusted rendering', 'Template escaping is safe by default, but HTML injection, URLs, SSR state, dependencies, and authorization boundaries still require care.']
  ],
  nodejs: [
    ['the Node.js event loop and libuv', 'Node coordinates non-blocking I/O through event-loop phases and libuv; blocking CPU work and callback starvation damage tail latency.'],
    ['streams and backpressure', 'Streams process data incrementally; backpressure, error propagation, cleanup, and pipeline composition prevent memory growth and corruption.'],
    ['worker threads and process scaling', 'Workers help CPU-bound tasks while processes isolate failures; serialization, shared memory, pools, and operational cost guide the choice.'],
    ['AsyncLocalStorage and request context', 'Async context can propagate tracing and request metadata, but lifecycle mistakes and unsupported boundaries can lose or leak context.'],
    ['Node.js memory and garbage collection', 'Heap limits, buffers, native memory, retained objects, and GC pauses require different diagnostics and mitigations.'],
    ['HTTP servers, timeouts, and connection management', 'Production HTTP requires explicit timeouts, keep-alive policy, body limits, graceful shutdown, and overload protection.'],
    ['modules, packages, and dependency loading', 'ESM and CommonJS differ in resolution and execution; exports, cycles, dual packages, and side effects affect compatibility.'],
    ['errors, cancellation, and graceful shutdown', 'Errors need ownership; cancellation and shutdown must stop new work, drain in-flight operations, and release resources predictably.'],
    ['Node.js diagnostics and observability', 'Profiles, heap snapshots, event-loop delay, async traces, metrics, and structured logs help distinguish CPU, memory, and I/O failures.'],
    ['secure Node.js service design', 'Input limits, dependency risk, secrets, unsafe APIs, authorization, and denial-of-service resistance belong in the service design.']
  ],
  docker: [
    ['image layers and build cache', 'Docker builds create content-addressed layers; instruction order, build context, and cache invalidation determine speed and image history.'],
    ['multi-stage and reproducible builds', 'Multi-stage builds separate toolchains from runtime artifacts; pinned inputs and deterministic steps improve reproducibility and supply-chain trust.'],
    ['container isolation and Linux primitives', 'Containers combine namespaces, cgroups, capabilities, and filesystem isolation; they are not equivalent to virtual machines.'],
    ['container networking and service discovery', 'Bridge networks, DNS, port publishing, ingress, and egress rules determine connectivity and exposure.'],
    ['volumes and persistent data', 'Volumes outlive containers; ownership, backup, consistency, migration, and host coupling matter more than the mount syntax.'],
    ['container resource limits and signals', 'CPU, memory, PID limits, OOM behavior, and signal handling determine reliability under pressure and during shutdown.'],
    ['image and runtime security', 'Minimal trusted images, non-root users, read-only filesystems, capability reduction, scanning, signing, and secrets handling reduce risk.'],
    ['Docker Compose development environments', 'Compose improves local orchestration but health, dependency readiness, data lifecycle, and parity with production require explicit design.'],
    ['container logging and observability', 'Containers should emit structured stdout/stderr and expose health and metrics; log drivers and rotation prevent node exhaustion.'],
    ['container debugging and incident response', 'Effective debugging distinguishes image, runtime, network, storage, resource, and application failures while preserving evidence.']
  ],
  git: [
    ['Git objects, refs, and the commit graph', 'Git stores content-addressed blobs, trees, commits, and annotated tags; refs name commits and the graph drives history operations.'],
    ['merge, rebase, and history strategy', 'Merge preserves topology while rebase rewrites commits; the right policy balances collaboration, auditability, and readability.'],
    ['reflog and recovery', 'Reflogs record local ref movement and often recover lost commits, but retention and remote visibility are limited.'],
    ['bisect and regression debugging', 'Bisect uses the commit graph to narrow regressions; reliable tests and handling skipped commits determine effectiveness.'],
    ['cherry-pick, revert, and backports', 'Cherry-pick copies changes, revert records inverse changes, and backports require compatibility and release discipline.'],
    ['worktrees, sparse checkout, and large repositories', 'Worktrees support parallel branches; sparse checkout and repository design reduce local cost without changing history semantics.'],
    ['submodules, monorepos, and repository boundaries', 'Repository structure affects ownership, atomic changes, tooling, dependency versioning, and operational complexity.'],
    ['hooks, signing, and repository security', 'Hooks automate local or server policy; signed commits and protected workflows strengthen provenance but require key and policy management.'],
    ['conflict resolution and rerere', 'Conflicts represent competing intent, not textual inconvenience; rerere can reuse resolutions but still requires semantic verification.'],
    ['collaborative Git workflows', 'A workflow should optimize review, release, recovery, and team autonomy rather than enforce history aesthetics alone.']
  ],
  'system-design': [
    ['requirements and capacity estimation', 'Useful design starts with functional requirements, SLOs, scale, data volume, peak behavior, and explicit assumptions.'],
    ['load balancing and traffic management', 'Traffic systems distribute load, perform health checks, shift regions, apply limits, and must avoid amplifying failures.'],
    ['caching and invalidation', 'Caches trade freshness and complexity for latency and capacity; key design, eviction, stampedes, and fallback define correctness.'],
    ['queues and asynchronous processing', 'Queues decouple work and absorb bursts; delivery semantics, idempotency, ordering, retries, and DLQs shape reliability.'],
    ['partitioning and replication', 'Partitioning distributes data and load while replication improves availability and reads; both add coordination and recovery complexity.'],
    ['consistency and distributed coordination', 'Consistency choices must protect business invariants while acknowledging latency, availability, clocks, and partial failure.'],
    ['multi-region architecture and disaster recovery', 'Regional designs require explicit RTO/RPO, data replication, traffic failover, fencing, and regularly tested evacuation.'],
    ['API gateways and service communication', 'Gateways centralize edge concerns; internal communication choices affect coupling, latency, retries, discovery, and observability.'],
    ['resilience and overload control', 'Timeouts, budgets, backoff, jitter, circuit breakers, bulkheads, admission control, and degradation prevent cascading failure.'],
    ['system evolution and architectural decisions', 'Strong architecture supports incremental change, explicit ownership, measurable trade-offs, and reversible decisions.']
  ],
  databases: [
    ['transaction isolation and concurrency control', 'Isolation levels expose different anomalies; locks, MVCC, constraints, and retries protect explicit business invariants.'],
    ['indexes and query planning', 'Indexes accelerate selected access paths at storage and write cost; statistics and cardinality estimates guide the planner.'],
    ['EXPLAIN and query performance', 'Execution plans, buffers, actual rows, lock waits, and representative parameters reveal why a query is slow.'],
    ['schema design and constraints', 'Schemas should encode durable invariants with appropriate normalization, constraints, types, and ownership boundaries.'],
    ['zero-downtime schema migrations', 'Expand-contract migrations preserve compatibility through phased rollout, backfill, validation, and delayed cleanup.'],
    ['partitioning and sharding', 'Partitioning helps lifecycle and pruning; sharding distributes ownership but complicates queries, transactions, and rebalancing.'],
    ['replication and failover', 'Replication improves availability and reads but introduces lag, stale reads, failover coordination, and split-brain risk.'],
    ['connection pooling and database capacity', 'Connections consume resources; pool sizing, queueing, timeouts, and workload isolation protect database capacity.'],
    ['backup, restore, and data recovery', 'A backup is useful only when restoration, point-in-time recovery, integrity, RPO, and RTO are regularly verified.'],
    ['data modeling across SQL and NoSQL systems', 'Choose models from access patterns, invariants, consistency, evolution, and operations rather than labels or fashion.']
  ],
  'backend-architecture': [
    ['API contracts and versioning', 'APIs need explicit semantics, compatibility, validation, pagination, errors, deprecation, and ownership.'],
    ['idempotency and retry-safe operations', 'Idempotency keys, durable operation state, request fingerprints, and concurrency control make retries safe.'],
    ['authentication and authorization architecture', 'Identity establishment, credential lifecycle, policy enforcement, tenant context, and auditability are distinct concerns.'],
    ['modular monoliths and service boundaries', 'Boundaries should align with business capability and ownership; distribution adds network and operational failure modes.'],
    ['event-driven architecture and the outbox pattern', 'Events decouple producers and consumers; schemas, ordering, idempotency, outbox delivery, and replay govern correctness.'],
    ['background jobs and workflow orchestration', 'Long-running work needs durable state, retries, cancellation, compensation, concurrency limits, and operator visibility.'],
    ['caching and data consistency', 'Cache strategy must define staleness, invalidation, stampede protection, fallback, and source-of-truth behavior.'],
    ['dependency resilience and external integrations', 'External calls require timeouts, budgets, retries, circuit breaking, reconciliation, and explicit degraded behavior.'],
    ['multi-tenant backend design', 'Tenant isolation spans identity, data, caches, jobs, logs, quotas, billing, and support tooling.'],
    ['backend observability and operability', 'Services need user-centered SLIs, structured events, traces, runbooks, safe controls, and explainable failure behavior.']
  ],
  'frontend-architecture': [
    ['frontend state ownership', 'Server cache, URL state, local UI state, forms, and durable preferences have different owners and lifecycles.'],
    ['rendering strategy: CSR, SSR, static, and islands', 'Rendering choices trade server cost, JavaScript delivery, freshness, personalization, resilience, and time-to-content.'],
    ['web performance and Core Web Vitals', 'Field data, loading, rendering, responsiveness, layout stability, and business outcomes guide performance work.'],
    ['design systems and component APIs', 'Design systems combine accessible primitives, tokens, governance, versioning, documentation, and adoption strategy.'],
    ['frontend data fetching and caching', 'Client data layers coordinate requests, stale data, cancellation, optimistic updates, pagination, and error recovery.'],
    ['accessibility architecture', 'Semantic HTML, keyboard interaction, focus, names, states, contrast, and assistive-technology testing are system requirements.'],
    ['micro-frontends and team boundaries', 'Micro-frontends buy release autonomy at the cost of performance, consistency, integration, and platform complexity.'],
    ['frontend security and browser trust boundaries', 'XSS, CSRF, CSP, dependency risk, token handling, navigation, and untrusted content shape browser security.'],
    ['frontend testing strategy', 'A balanced strategy validates pure logic, component contracts, integration behavior, accessibility, visuals, and critical journeys.'],
    ['frontend observability and release safety', 'Real-user monitoring, errors, traces, feature flags, source maps, and release correlation make client failures actionable.']
  ],
  security: [
    ['authentication and credential lifecycle', 'Secure authentication includes enrollment, storage, MFA, recovery, rotation, revocation, and abuse resistance.'],
    ['authorization and access-control models', 'Authorization must enforce resource and action policy at trusted boundaries and prevent horizontal and vertical escalation.'],
    ['session and token security', 'Sessions and tokens require secure transport, storage, expiry, rotation, revocation, CSRF strategy, and leakage response.'],
    ['input validation, injection, and output encoding', 'Treat external input as untrusted; validate shape and intent, use safe interpreters, and encode for the output context.'],
    ['secrets and key management', 'Secrets need least privilege, controlled distribution, rotation, audit, short lifetimes, and incident-ready revocation.'],
    ['web security headers and browser controls', 'CSP, HSTS, cookie attributes, framing policy, and resource controls reduce browser attack surface when correctly deployed.'],
    ['SSRF and server-side trust boundaries', 'Server-side fetches can reach privileged networks and metadata; allowlists, parsing, DNS behavior, and egress controls matter.'],
    ['software supply-chain security', 'Dependencies, build systems, artifacts, provenance, signing, scanning, and update policy form the software supply chain.'],
    ['security logging and incident response', 'Audit events must be useful, protected, privacy-aware, correlated, and connected to detection and response playbooks.'],
    ['threat modeling and secure design review', 'Threat models identify assets, actors, trust boundaries, abuse paths, mitigations, and verification before incidents occur.']
  ],
  'devops-observability': [
    ['SLIs, SLOs, and error budgets', 'User-centered indicators and objectives guide alerting, reliability investment, and the acceptable pace of change.'],
    ['metrics, logs, traces, and profiles', 'Telemetry signals answer different questions; correlation, schemas, cardinality, sampling, retention, and cost require design.'],
    ['distributed tracing and context propagation', 'Trace context connects work across process and queue boundaries; sampling and sensitive baggage need deliberate policy.'],
    ['alerting and incident response', 'Actionable symptom-based alerts, burn rates, ownership, communication, mitigation, and learning reduce incident impact.'],
    ['safe deployment and release strategies', 'Immutable artifacts, compatibility, canaries, feature flags, health criteria, and rollback make releases safer.'],
    ['Kubernetes workloads and controllers', 'Deployments, StatefulSets, Jobs, scheduling, reconciliation, and disruption behavior must match workload semantics.'],
    ['Kubernetes probes and resource management', 'Startup, readiness, and liveness have different purposes; requests, limits, throttling, and OOM behavior affect reliability.'],
    ['infrastructure as code and configuration management', 'Declarative infrastructure needs review, state protection, drift detection, modularity, and controlled change.'],
    ['capacity planning and autoscaling', 'Scaling decisions require demand signals, bottlenecks, startup time, headroom, quotas, and protection from oscillation.'],
    ['disaster recovery and operational readiness', 'Runbooks, backups, restore tests, failover exercises, access, communication, and ownership determine real recoverability.']
  ],
  leadership: [
    ['architectural decision-making', 'Senior engineers make constraints and trade-offs visible, seek challenge, document decisions, and revisit them as evidence changes.'],
    ['technical strategy and roadmap', 'A technical roadmap connects business outcomes, risk reduction, platform investment, sequencing, and measurable checkpoints.'],
    ['mentoring and delegation', 'Effective mentoring sets growth goals, provides context and feedback, transfers ownership, and avoids creating dependency.'],
    ['code review and engineering standards', 'Reviews prioritize correctness, security, operability, maintainability, and shared understanding while automation handles style.'],
    ['technical debt and modernization', 'Debt should be expressed through delivery, reliability, security, or cost impact and addressed with measurable incremental work.'],
    ['incident leadership and blameless learning', 'Incident leaders coordinate mitigation and communication; postmortems improve systems without hiding accountability.'],
    ['cross-functional communication', 'Strong communication adapts technical detail to audience, clarifies decisions and uncertainty, and ties work to product outcomes.'],
    ['project execution under ambiguity', 'Senior engineers reduce uncertainty through discovery, assumptions, experiments, thin slices, risk tracking, and decision points.'],
    ['conflict, disagreement, and influence', 'Healthy disagreement focuses on goals and evidence, surfaces trade-offs, and supports the final decision after debate.'],
    ['team effectiveness and engineering culture', 'Sustainable teams need clear ownership, feedback, quality practices, psychological safety, operational health, and continuous improvement.']
  ]
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function buildQuestion(category, topic, lens) {
  const [lensId, level, prompt, guidance] = lens
  const [topicName, topicInfo] = topic
  return {
    id: `${category}-${slugify(topicName)}-${lensId}`,
    type: lensId === 'scenario' ? 'scenario' : lensId,
    level,
    tags: [category, slugify(topicName), lensId],
    question: prompt.replace('{topic}', topicName),
    answer: `${topicInfo}\n\n**Strong Senior answer:** ${guidance}\n\nConnect the answer to a real production example. State assumptions, identify the most dangerous failure mode, and explain what telemetry or test would prove the decision works.`
  }
}

for (const file of (await readdir(dataDir)).filter(name => name.endsWith('.json'))) {
  const slug = file.replace(/\.json$/, '')
  const data = JSON.parse(await readFile(new URL(file, dataDir), 'utf8'))
  const topics = common[slug]
  if (!topics) throw new Error(`Missing topic matrix for ${slug}`)

  data.questions = data.questions.map(question => ({
    ...question,
    type: question.type || 'knowledge',
    level: question.level || 'middle',
    tags: Array.isArray(question.tags) && question.tags.length ? question.tags : [slug]
  }))
  const existingIds = new Set(data.questions.map(question => question.id))
  const generated = topics.flatMap(topic => lenses.map(lens => buildQuestion(slug, topic, lens)))
  const generatedById = new Map(generated.map(question => [question.id, question]))
  data.questions = data.questions.map(question => generatedById.has(question.id)
    ? { ...question, level: generatedById.get(question.id).level }
    : question
  )
  const additions = generated.filter(question => !existingIds.has(question.id))
  const targetCount = data.targetCount || 100
  data.questions = [...data.questions, ...additions].slice(0, targetCount)
  await writeFile(new URL(file, dataDir), `${JSON.stringify(data, null, 2)}\n`)
  console.log(`${file}: ${data.questions.length}`)
}
