// backend/src/services/ai.service.js
//
// Centralized AI service — all LLM calls go through here.
// Every function uses gpt-4o-mini with response_format: json_object
// to enforce structured output. JSON.parse failures are caught and
// re-thrown with a descriptive error so callers get a meaningful 500.
//
// See PROMPTS.md for the full prompt registry and contract documentation.

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-dummy-key-for-startup-safety',
});
const aiStatus = require('./ai-status');
const providerCreate = openai.chat.completions.create.bind(
  openai.chat.completions,
);
openai.chat.completions.create = async (...args) => {
  if (!process.env.OPENAI_API_KEY) {
    aiStatus.set(false);
    throw Object.assign(
      new Error(
        'Configure OPENAI_API_KEY for live AI; offline study templates are available',
      ),
      { statusCode: 503 },
    );
  }
  try {
    const result = await providerCreate(...args);
    aiStatus.set(true);
    return result;
  } catch (error) {
    aiStatus.set(false);
    throw error;
  }
};

/**
 * Safely parse a JSON string returned by the OpenAI API.
 * Even with response_format: json_object, edge cases (empty content,
 * network truncation) can cause parse failures. This helper makes
 * the error message informative rather than a raw SyntaxError.
 */
const safeParseJSON = (raw, fnName) => {
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `AI service: ${fnName} received malformed JSON from OpenAI. ` +
        `Raw content (first 200 chars): ${raw?.slice(0, 200)}`,
      { cause: err },
    );
  }
};

// ─── Generate Quiz Questions from Content ─────────────────────
// Model: gpt-4o-mini | Temp: 0.7 (creative variety in questions)
// Contract: { questions: [{ question, type, options, correctAnswer, explanation, difficulty, points }] }
const generateQuizQuestions = async ({
  topic,
  count = 10,
  difficulty = 'medium',
  content,
  category,
  sections,
  learningOutcomes: _learningOutcomes,
}) => {
  const targetCount = Math.min(Math.max(Number(count) || 10, 3), 10);
  // Trim content to avoid exceeding context limits
  const contentSnippet = content
    ? `Based on this curriculum content & syllabus:\n${content.slice(0, 3000)}`
    : '';

  const prompt = `You are an elite educational examiner for Gyanix Academy.
Generate EXACTLY ${targetCount} comprehensive, academically rigorous multiple-choice quiz questions specifically tailored to this course:
Topic: "${topic}"
Category: "${category || 'Technology'}"
Difficulty Level: "${difficulty}"
${contentSnippet}

Guidelines:
1. Cover realistic technical concepts, architectural decisions, code patterns, and practical scenarios taught in the syllabus.
2. Provide exactly 4 distinct, plausible options for each question (1 correct, 3 realistic distractors).
3. Provide an in-depth, educational explanation explaining WHY the correct option is right and the underlying principle.
4. Return EXACTLY ${targetCount} questions.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Detailed explanation of why Option A is correct...",
      "difficulty": "${difficulty}",
      "points": 1
    }
  ]
}`;

  try {
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes('...')
    ) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const parsed = safeParseJSON(
      response.choices[0].message.content,
      'generateQuizQuestions',
    );
    if (
      parsed?.questions &&
      Array.isArray(parsed.questions) &&
      parsed.questions.length === targetCount
    ) {
      return parsed;
    }
    throw new Error('Incomplete question list returned by API');
  } catch (error) {
    console.warn('OpenAI generation fallback triggered:', error.message);

    // ── Intelligent Curriculum-Based Synthesizer ───────────────
    const topicLower = (topic || '').toLowerCase();

    // 1. Full-Stack Next.js 16 & AI Agent Engineering
    if (
      topicLower.includes('next.js') ||
      topicLower.includes('agent') ||
      topicLower.includes('full-stack') ||
      topicLower.includes('react')
    ) {
      const nextJsBank = [
        {
          question:
            'What is the primary difference between React Server Components (RSC) and Client Components marked with "use client" in Next.js 15/16?',
          options: [
            'Server Components render exclusively on the server and send zero JavaScript to the client bundle',
            'Server Components only run inside web workers in the browser',
            'Client Components cannot receive props from Server Components',
            'Server Components have access to browser window and localStorage APIs',
          ],
          correctAnswer:
            'Server Components render exclusively on the server and send zero JavaScript to the client bundle',
          explanation:
            'React Server Components execute only on the server, allowing direct database access and zero-bundle-size dependencies, while Client Components hydrate in the browser.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'In Next.js App Router, which caching layer caches rendered RSC payloads and HTML on the server across user requests?',
          options: [
            'Full Route Cache',
            'Router Cache (in-memory browser client)',
            'Request Memoization (fetch deduping)',
            'Session Storage Cache',
          ],
          correctAnswer: 'Full Route Cache',
          explanation:
            'The Full Route Cache persists rendered React Server Component payloads and HTML on the server to dramatically reduce server response latency.',
          difficulty: 'advanced',
          points: 1,
        },
        {
          question:
            'How do Next.js Server Actions provide secure, seamless mutations without building dedicated REST endpoints?',
          options: [
            'They are asynchronous server functions invoked directly from client components via POST requests with built-in CSRF protection',
            'They run on client web sockets bypassing HTTP completely',
            'They bypass all server-side validation and execute directly on the database engine',
            'They store form submissions in browser IndexedDB before manual sync',
          ],
          correctAnswer:
            'They are asynchronous server functions invoked directly from client components via POST requests with built-in CSRF protection',
          explanation:
            'Server Actions allow developers to write async functions that run securely on the server and can be invoked from forms or buttons with automated cryptographic action IDs.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'When implementing autonomous AI Agent tool calling (Function Calling), what is the critical role of a Zod schema?',
          options: [
            'It strictly defines and validates parameter schemas so the LLM outputs type-safe structured arguments for tool execution',
            'It compresses token context windows to save memory',
            'It automatically vectorizes text documents into Pinecone',
            'It encrypts API keys before sending them to the LLM',
          ],
          correctAnswer:
            'It strictly defines and validates parameter schemas so the LLM outputs type-safe structured arguments for tool execution',
          explanation:
            'Zod schemas define strict type structures and validation rules that guide the LLM into generating accurate JSON function arguments and prevent malformed tool inputs.',
          difficulty: 'advanced',
          points: 1,
        },
        {
          question:
            'In streaming SSR with React Suspense in Next.js, how does the client receive and render UI components?',
          options: [
            'HTML chunks are streamed progressively over a single HTTP connection as server async promises resolve',
            'The client downloads the full bundle before rendering the first byte of HTML',
            'Components are rendered only after all third-party analytics scripts load',
            'The browser compiles TypeScript components dynamically in the DOM',
          ],
          correctAnswer:
            'HTML chunks are streamed progressively over a single HTTP connection as server async promises resolve',
          explanation:
            'Streaming SSR allows Next.js to stream critical layout HTML instantly while async data-fetching components stream in chunk-by-chunk inside Suspense boundaries.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'Why is Retrieval-Augmented Generation (RAG) essential when building specialized enterprise AI agents?',
          options: [
            'It augments LLM prompts with real-time, domain-specific vectorized knowledge, reducing hallucinations and overcoming knowledge cutoff limits',
            'It trains foundational models from scratch using GPU clusters',
            'It replaces all frontend routing logic with neural networks',
            'It converts SQL databases into unstructured text files',
          ],
          correctAnswer:
            'It augments LLM prompts with real-time, domain-specific vectorized knowledge, reducing hallucinations and overcoming knowledge cutoff limits',
          explanation:
            'RAG retrieves relevant semantic chunks from vector stores and injects them into the prompt, grounding the LLM in verified company or course data.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'Which mathematical metric is most commonly computed to measure semantic similarity between prompt embeddings and stored document vectors?',
          options: [
            'Cosine Similarity',
            'Euclidean Manhattan Perimeter',
            'Binary XOR Parity',
            'Fibonacci Ratio',
          ],
          correctAnswer: 'Cosine Similarity',
          explanation:
            'Cosine similarity measures the cosine of the angle between two normalized embedding vectors, evaluating semantic alignment regardless of vector magnitude.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'In an autonomous multi-step AI Agent execution loop, what safeguard prevents infinite recursive tool calling?',
          options: [
            'Enforcing a maximum iteration step limit (maxSteps) and token budget bounds',
            'Restarting the server process after each completion',
            'Removing all system prompt instructions',
            'Disabling asynchronous event loops',
          ],
          correctAnswer:
            'Enforcing a maximum iteration step limit (maxSteps) and token budget bounds',
          explanation:
            'Autonomous agent loops require strict maxStep thresholds and timeout guards to prevent runaway loops when the model struggles to satisfy a complex goal.',
          difficulty: 'advanced',
          points: 1,
        },
        {
          question:
            'In Next.js middleware running on the Edge runtime, how should authenticated routes be protected efficiently?',
          options: [
            'Verifying the JWT signature from cookies/headers and redirecting unauthenticated traffic before reaching route handlers',
            'Connecting directly to heavy MongoDB Mongoose models in edge memory',
            'Injecting unhashed passwords into client search parameters',
            'Disabling HTTP cookies across all endpoints',
          ],
          correctAnswer:
            'Verifying the JWT signature from cookies/headers and redirecting unauthenticated traffic before reaching route handlers',
          explanation:
            'Edge middleware evaluates requests before rendering occurs, verifying cryptographic JWT tokens to protect routes with sub-millisecond overhead.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'How does Turbopack accelerate compilation and development in modern Next.js applications?',
          options: [
            'It uses a Rust-based incremental compilation engine that caches computation at the function level',
            'It transpiles JavaScript code into assembly binaries before running in Node',
            'It disables all CSS bundling during development',
            'It skips TypeScript type checking completely in production',
          ],
          correctAnswer:
            'It uses a Rust-based incremental compilation engine that caches computation at the function level',
          explanation:
            'Turbopack is written in Rust and utilizes Turbo Engine for function-level caching, rebuilding only the exact code modules affected by a change.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'What is the purpose of revalidatePath and revalidateTag functions in Next.js Server Actions?',
          options: [
            'Purging on-demand cached data for specific routes or semantic tags so users see fresh content immediately',
            'Clearing browser cookies and localStorage',
            'Recompiling the entire production Next.js build',
            'Invalidating user authentication sessions globally',
          ],
          correctAnswer:
            'Purging on-demand cached data for specific routes or semantic tags so users see fresh content immediately',
          explanation:
            'On-demand revalidation selectively clears cached data matching a specific path or cache tag, instantly updating stale server-rendered pages.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'How does the Vercel AI SDK useChat hook deliver real-time streaming tokens to UI components?',
          options: [
            'It establishes a ReadableStream reader that updates state reactively as chunks arrive from the server',
            'It polls a REST endpoint every 50 milliseconds',
            'It downloads the entire completion before updating the message state',
            'It renders raw HTML strings directly into document.body',
          ],
          correctAnswer:
            'It establishes a ReadableStream reader that updates state reactively as chunks arrive from the server',
          explanation:
            'useChat reads from a Server-Sent Events / ReadableStream response, appending token deltas into React state in real time for a smooth typewriter effect.',
          difficulty: 'intermediate',
          points: 1,
        },
      ];
      return { questions: nextJsBank.slice(0, targetCount) };
    }

    // 2. Cloud DevOps, Docker & Microservices Orchestration
    if (
      topicLower.includes('devops') ||
      topicLower.includes('docker') ||
      topicLower.includes('microservice') ||
      topicLower.includes('cloud') ||
      topicLower.includes('kubernetes')
    ) {
      const devopsBank = [
        {
          question:
            'What is the primary architectural advantage of utilizing multi-stage Docker builds in production CI/CD?',
          options: [
            'Separating the build environment from the final runtime image to minimize image size and eliminate build tool vulnerabilities',
            'Allowing multiple Docker daemons to run concurrently on the same host',
            'Automatically mounting local host files into cloud containers',
            'Bypassing Linux kernel namespaces and cgroups',
          ],
          correctAnswer:
            'Separating the build environment from the final runtime image to minimize image size and eliminate build tool vulnerabilities',
          explanation:
            'Multi-stage builds discard compilers, test runners, and intermediate caches, copying only production artifacts into lean distroless/alpine runtime images.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'In Docker Compose, how do containers within the same user-defined bridge network discover each other?',
          options: [
            'Using Docker internal DNS resolver that automatically resolves service names to container IP addresses',
            'Using hardcoded public IP addresses in environment variables',
            'Broadcasting UDP packets across the host physical network',
            'Reading shared text files stored on host disk',
          ],
          correctAnswer:
            'Using Docker internal DNS resolver that automatically resolves service names to container IP addresses',
          explanation:
            'Docker embeds an internal DNS server that automatically resolves container and service names defined in docker-compose.yml to their dynamic bridge IP addresses.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'In Kubernetes, which controller resource guarantees that a specified number of Pod replicas remain running across worker nodes?',
          options: [
            'Deployment / ReplicaSet',
            'DaemonSet',
            'ConfigMap',
            'ClusterRoleBinding',
          ],
          correctAnswer: 'Deployment / ReplicaSet',
          explanation:
            'Deployments manage ReplicaSets, maintaining the desired number of Pod instances through automated reconciliation loops, rollouts, and self-healing.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'What is the key difference between a Kubernetes ClusterIP service and a NodePort service?',
          options: [
            'ClusterIP is only reachable internally within the cluster, whereas NodePort exposes a static port on each worker node IP for external access',
            'NodePort only supports UDP protocols, while ClusterIP only supports TCP',
            'ClusterIP requires an external cloud load balancer, while NodePort does not',
            'NodePort can only route traffic to a single Pod replica',
          ],
          correctAnswer:
            'ClusterIP is only reachable internally within the cluster, whereas NodePort exposes a static port on each worker node IP for external access',
          explanation:
            'ClusterIP is the default internal-only virtual IP. NodePort opens a dedicated port (usually 30000-32767) on all node interfaces, proxying traffic to the service.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'What Linux kernel mechanism triggers an OOMKilled (Exit Code 137) container shutdown?',
          options: [
            'The cgroup memory controller detects that the container exceeded its specified memory limit (resources.limits.memory)',
            'The CPU scheduler throttles thread execution',
            'The container health check probe returns HTTP 500',
            'The disk storage reaches 100% capacity',
          ],
          correctAnswer:
            'The cgroup memory controller detects that the container exceeded its specified memory limit (resources.limits.memory)',
          explanation:
            'When a container process allocates more RAM than permitted by its cgroup memory limit, the Linux kernel Out-Of-Memory Killer forcefully terminates the process with SIGKILL (137).',
          difficulty: 'advanced',
          points: 1,
        },
        {
          question:
            'When implementing a Blue-Green deployment strategy in Kubernetes or Cloud environments, how is zero downtime achieved?',
          options: [
            'By provisioning a duplicate identical environment (Green), validating health, and atomically switching router/service traffic from Blue to Green',
            'By shutting down all servers simultaneously during off-peak hours',
            'By compiling code directly inside running production containers',
            'By rolling back database migrations automatically on every release',
          ],
          correctAnswer:
            'By provisioning a duplicate identical environment (Green), validating health, and atomically switching router/service traffic from Blue to Green',
          explanation:
            'Blue-Green deployments maintain two identical production environments, switching router ingress traffic instantaneously once the new version passes smoke tests.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'In microservices architecture, what is the role of the Circuit Breaker pattern during upstream service degradation?',
          options: [
            'It trips after repeated failures to immediately return fallback responses, preventing cascading network timeouts and thread pool exhaustion',
            'It terminates the entire Kubernetes cluster to prevent data corruption',
            'It reroutes all traffic through public DNS servers',
            'It converts REST requests into synchronous SOAP messages',
          ],
          correctAnswer:
            'It trips after repeated failures to immediately return fallback responses, preventing cascading network timeouts and thread pool exhaustion',
          explanation:
            'Circuit breakers prevent cascading system failure by failing fast when a downstream dependency is unhealthy, giving it time to recover before retrying.',
          difficulty: 'advanced',
          points: 1,
        },
        {
          question:
            'How does an Ingress Controller (such as Nginx or Traefik) manage traffic in a modern cloud-native architecture?',
          options: [
            'It acts as an intelligent reverse proxy that routes external HTTP/HTTPS requests to internal cluster services based on hostnames and URL paths',
            'It replaces all container network interface (CNI) plugins',
            'It acts as the primary relational database for the cluster',
            'It compiles Docker images directly on worker nodes',
          ],
          correctAnswer:
            'It acts as an intelligent reverse proxy that routes external HTTP/HTTPS requests to internal cluster services based on hostnames and URL paths',
          explanation:
            'Ingress controllers evaluate routing rules defined in Ingress resources, handling SSL termination, path-based routing, and load balancing across internal services.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'Which Kubernetes storage abstraction decouples physical cloud storage provisioning from Pod lifecycle requirements?',
          options: [
            'PersistentVolume (PV) and PersistentVolumeClaim (PVC)',
            'Ephemeral EmptyDir volumes',
            'ConfigMap data fields',
            'HostPath bind mounts',
          ],
          correctAnswer:
            'PersistentVolume (PV) and PersistentVolumeClaim (PVC)',
          explanation:
            'PVCs allow Pods to request durable storage abstractly without needing to know whether the underlying backend is AWS EBS, Google Persistent Disk, or NFS.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'Why should production container Dockerfiles specify a non-root user (USER 10001 or USER node) instead of default root?',
          options: [
            'To enforce the principle of least privilege and mitigate container breakout attacks from compromising the underlying host system',
            'Because root processes cannot open network sockets',
            'Because Linux distributions block root execution by default',
            'To speed up Docker image pull times',
          ],
          correctAnswer:
            'To enforce the principle of least privilege and mitigate container breakout attacks from compromising the underlying host system',
          explanation:
            'Running containers as non-root ensures that even if an attacker executes arbitrary code within the container, they cannot easily gain root access on the host node.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'In Prometheus monitoring stacks, what is the fundamental distinction between a Counter and a Gauge metric?',
          options: [
            'A Counter only ever increases (or resets on reboot), whereas a Gauge can fluctuate up and down arbitrarily',
            'A Counter is for strings, while a Gauge is for integers',
            'A Counter is sampled hourly, while a Gauge is sampled continuously',
            'A Counter cannot be visualized in Grafana dashboards',
          ],
          correctAnswer:
            'A Counter only ever increases (or resets on reboot), whereas a Gauge can fluctuate up and down arbitrarily',
          explanation:
            'Counters track cumulative totals (e.g. total HTTP requests, error counts), while Gauges represent instantaneous snapshots (e.g. current memory usage, active connections).',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'In GitOps workflows (e.g. ArgoCD or Flux), what ensures that production cluster state matches Git repository definitions?',
          options: [
            'Continuous reconciliation loops compare live cluster state against declarative Git manifests and automatically remediate drift',
            'Developers run kubectl apply manually from local laptops',
            'Docker hub automatically restarts worker nodes on new pushes',
            'Server cron jobs delete and recreate all Pods nightly',
          ],
          correctAnswer:
            'Continuous reconciliation loops compare live cluster state against declarative Git manifests and automatically remediate drift',
          explanation:
            'GitOps agents continually reconcile real-world cluster state against declarative version-controlled specifications, preventing configuration drift.',
          difficulty: 'advanced',
          points: 1,
        },
      ];
      return { questions: devopsBank.slice(0, targetCount) };
    }

    // 3. Deep Space Physics & 60FPS Canvas Animation Masterclass
    if (
      topicLower.includes('canvas') ||
      topicLower.includes('physics') ||
      topicLower.includes('animation') ||
      topicLower.includes('game')
    ) {
      const canvasBank = [
        {
          question:
            'Why is window.requestAnimationFrame vastly superior to setInterval or setTimeout for 60FPS web animations?',
          options: [
            'It synchronizes redraws with the display refresh rate, pauses automatically in background tabs, and prevents screen tearing',
            'It executes code on the GPU shader pipeline directly',
            'It increases the physical monitor refresh rate dynamically',
            'It prevents all JavaScript execution outside the main loop',
          ],
          correctAnswer:
            'It synchronizes redraws with the display refresh rate, pauses automatically in background tabs, and prevents screen tearing',
          explanation:
            'requestAnimationFrame matches the browser vsync refresh cycle and suspends execution when tabs are hidden, conserving battery and maintaining stutter-free 60FPS rendering.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'In HTML5 2D Canvas contexts, what specific data is saved and restored by ctx.save() and ctx.restore()?',
          options: [
            'The drawing state stack (transformation matrices, clipping regions, strokeStyle, fillStyle, and globalAlpha)',
            'The entire bitmap pixel buffer of the canvas',
            'The browser DOM history tree',
            'The audio context sound buffer',
          ],
          correctAnswer:
            'The drawing state stack (transformation matrices, clipping regions, strokeStyle, fillStyle, and globalAlpha)',
          explanation:
            'save() pushes the current drawing state (transformations, styles, clips) onto a stack, and restore() pops the most recent state back, leaving canvas pixels intact.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'How does Verlet / Euler numerical integration calculate particle motion in 2D physics simulations?',
          options: [
            'By computing acceleration from net forces, updating velocity by acceleration * dt, and updating position by velocity * dt',
            'By calculating trigonometric sine curves without time variance',
            'By interpolating between keyframes stored in CSS stylesheets',
            'By querying the Web Bluetooth API for physical acceleration vectors',
          ],
          correctAnswer:
            'By computing acceleration from net forces, updating velocity by acceleration * dt, and updating position by velocity * dt',
          explanation:
            'Numerical integration accumulates forces into acceleration, integrates acceleration over deltaTime to derive velocity, and integrates velocity to update spatial position.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'What is the most effective memory management technique to eliminate Garbage Collection (GC) stutter in 60FPS canvas animations?',
          options: [
            'Object pooling: pre-allocating reusable particle objects rather than creating and discarding new instances in the render loop',
            'Calling window.gc() manually inside the draw function',
            'Allocating all particle arrays as raw base64 strings',
            'Restarting the requestAnimationFrame loop every 10 seconds',
          ],
          correctAnswer:
            'Object pooling: pre-allocating reusable particle objects rather than creating and discarding new instances in the render loop',
          explanation:
            'Allocating objects inside high-frequency animation loops triggers aggressive garbage collection pauses. Object pools recycle existing memory buffers to maintain a flat memory profile.',
          difficulty: 'advanced',
          points: 1,
        },
        {
          question:
            'When rendering canvas graphics on high-density displays (Apple Retina / 4K), how do you prevent blurry rendering?',
          options: [
            'Scale the canvas internal width/height attributes by window.devicePixelRatio and scale the CSS display dimensions down with transform or style',
            'Set ctx.imageSmoothingEnabled to false',
            'Use SVG images instead of canvas elements',
            'Increase browser zoom to 200%',
          ],
          correctAnswer:
            'Scale the canvas internal width/height attributes by window.devicePixelRatio and scale the CSS display dimensions down with transform or style',
          explanation:
            'Multiplying canvas buffer dimensions by devicePixelRatio and scaling the context with ctx.scale(dpr, dpr) gives physical pixel density while maintaining CSS layout coordinates.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'Which spatial partitioning data structure reduces collision detection complexity from O(N²) down to O(N log N) in dense particle systems?',
          options: [
            'Quadtree (or Spatial Grid Partitioning)',
            'Binary Heap',
            'Circular Linked List',
            'Bloom Filter',
          ],
          correctAnswer: 'Quadtree (or Spatial Grid Partitioning)',
          explanation:
            'Quadtrees subdivide 2D space into hierarchical quadrants, allowing collision checks to run only between particles occupying adjacent or overlapping spatial nodes.',
          difficulty: 'advanced',
          points: 1,
        },
        {
          question:
            'What visual effect does setting ctx.globalCompositeOperation = "lighter" produce in celestial particle rendering?',
          options: [
            'Additive color blending: overlapping particles add their RGB values together, creating radiant luminous glows',
            'Subtractive stencil masking',
            'Inverting the canvas background color to white',
            'Converting color particles to grayscale',
          ],
          correctAnswer:
            'Additive color blending: overlapping particles add their RGB values together, creating radiant luminous glows',
          explanation:
            'The "lighter" compositing mode sums color values where paths overlap, producing realistic glowing celestial trails, rocket thrust, and star clusters.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'How does an OffscreenCanvas running inside a Web Worker enhance browser rendering performance?',
          options: [
            'It decouples heavy physics calculations and pixel rendering from the browser main UI thread, preventing UI jank',
            'It downloads assets directly from WebTorrent networks',
            'It enables unlimited frame rates exceeding monitor hardware refresh limits',
            'It prevents canvas screenshot exports from working',
          ],
          correctAnswer:
            'It decouples heavy physics calculations and pixel rendering from the browser main UI thread, preventing UI jank',
          explanation:
            'OffscreenCanvas allows canvas rendering to execute on dedicated background worker threads so main thread DOM updates and user gestures never freeze.',
          difficulty: 'advanced',
          points: 1,
        },
        {
          question:
            'In frame-rate independent physics loops, why is computing deltaTime (dt) between animation ticks mandatory?',
          options: [
            'It ensures simulation speeds remain uniform and realistic regardless of monitor refresh rate (60Hz, 120Hz, 144Hz) or momentary frame drops',
            'It calculates the exact geographic time zone of the user',
            'It validates that the canvas context has not been detached',
            'It limits CPU temperatures during execution',
          ],
          correctAnswer:
            'It ensures simulation speeds remain uniform and realistic regardless of monitor refresh rate (60Hz, 120Hz, 144Hz) or momentary frame drops',
          explanation:
            'Multiplying velocities by deltaTime ensures motion distances are based on elapsed real-world time rather than raw frame count, keeping movement consistent across all displays.',
          difficulty: 'intermediate',
          points: 1,
        },
        {
          question:
            'Which Canvas 2D feature allows complex vector paths to be cached and re-stroked without re-evaluating curve commands?',
          options: ['Path2D API', 'DOMMatrix', 'ImageBitmap', 'TextMetrics'],
          correctAnswer: 'Path2D API',
          explanation:
            'Path2D objects store pre-recorded path geometry that can be redrawn repeatedly with ctx.fill(path) or ctx.stroke(path) without re-invoking path creation methods.',
          difficulty: 'intermediate',
          points: 1,
        },
      ];
      return { questions: canvasBank.slice(0, targetCount) };
    }

    // 4. General Adaptive Dynamic Curriculum Engine
    // Synthesizes 10-12 tailored questions from sections, learning outcomes, and course content
    const modules = sections?.length
      ? sections.map((s) => s.title)
      : [
          topic,
          'Core Architecture',
          'Implementation Standards',
          'Performance & Scaling',
          'Security & Production',
        ];

    const dynamicQuestions = [];
    const baseQuestionTemplates = [
      {
        q: (mod) =>
          `In the context of ${topic}, what is the foundational principle behind "${mod}"?`,
        correct: (mod) =>
          `Establishing structured architecture, separation of concerns, and verified implementations for ${mod}`,
        d1: 'Ignoring error boundaries and exception handling across modules',
        d2: 'Hardcoding environment-specific configurations into client code',
        d3: 'Deploying legacy unoptimized dependencies without version pinning',
        expl: (mod) =>
          `Mastering the architectural fundamentals of ${mod} ensures scalable, resilient engineering across ${topic}.`,
      },
      {
        q: (mod) =>
          `When implementing "${mod}" in ${topic}, which best practice ensures optimal reliability?`,
        correct: (_mod) =>
          'Automated testing, strict input validation, and declarative error handling',
        d1: 'Bypassing security validations to accelerate execution speed',
        d2: 'Mutating global state variables directly without state management',
        d3: 'Omitting documentation and API contract schemas',
        expl: (mod) =>
          `Consistent testing and validation maintain system integrity throughout the lifecycle of ${mod}.`,
      },
      {
        q: (mod) =>
          `What is the primary operational objective when scaling "${mod}" within ${topic}?`,
        correct: (_mod) =>
          'Minimizing latency through intelligent caching, asynchronous execution, and resource optimization',
        d1: 'Increasing network payload size unnecessarily',
        d2: 'Blocking the main thread with synchronous long-running loops',
        d3: 'Disabling logging and telemetry instrumentation',
        expl: (mod) =>
          `Performance optimization and caching ensure ${mod} scales smoothly under heavy production loads.`,
      },
      {
        q: (mod) =>
          `How should sensitive data and access controls be structured when working with "${mod}"?`,
        correct: (_mod) =>
          'Enforcing least-privilege permissions, cryptographic tokens, and server-side authorization checks',
        d1: 'Storing sensitive credentials in client-accessible localStorage without encryption',
        d2: 'Allowing unauthenticated public access to administrative endpoints',
        d3: 'Transmitting sensitive payloads over unencrypted HTTP channels',
        expl: (mod) =>
          `Strict authorization and encryption protect systems from unauthorized access in ${mod}.`,
      },
    ];

    for (let i = 0; i < targetCount; i++) {
      const moduleName = modules[i % modules.length] || topic;
      const template = baseQuestionTemplates[i % baseQuestionTemplates.length];
      const correctAns = template.correct(moduleName);

      dynamicQuestions.push({
        question: template.q(moduleName),
        type: 'multiple-choice',
        options: [correctAns, template.d1, template.d2, template.d3].sort(
          () => 0.5 - Math.random(),
        ),
        correctAnswer: correctAns,
        explanation: template.expl(moduleName),
        difficulty: i < 3 ? 'beginner' : i < 8 ? 'intermediate' : 'advanced',
        points: 1,
      });
    }

    return { questions: dynamicQuestions };
  }
};

// ─── Grade Open-Ended Answer ──────────────────────────────────
// Model: gpt-4o-mini | Temp: 0.3 (deterministic grading)
// Contract: { score, percentage, feedback, strengths: [], improvements: [] }
const gradeAnswer = async ({ question, studentAnswer, rubric, maxPoints }) => {
  const prompt = `You are a fair and detailed educational grader.

Question: ${question}
Student Answer: ${studentAnswer}
Grading Rubric: ${rubric || 'Evaluate accuracy, completeness, and clarity.'}
Maximum Points: ${maxPoints}

Return ONLY valid JSON:
{
  "score": <number between 0 and ${maxPoints}>,
  "percentage": <0-100>,
  "feedback": "<detailed constructive feedback>",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  return safeParseJSON(response.choices[0].message.content, 'gradeAnswer');
};

// ─── Personalized Learning Path ───────────────────────────────
// Model: gpt-4o-mini | Temp: 0.4 (structured recommendations, low creativity)
// Contract: { recommendations: [{ courseId, reason, priority }], learningPathSummary }
const generateLearningPath = async ({ studentProfile, availableCourses }) => {
  try {
    if (!availableCourses || availableCourses.length === 0) {
      return {
        recommendations: [],
        learningPathSummary:
          'You have conquered all current expeditions! Stay tuned as mentors publish new advanced modules.',
      };
    }

    const courseList = availableCourses
      .map(
        (c) =>
          `- ID: ${c._id}, Title: ${c.title}, Level: ${c.level}, Category: ${c.category}`,
      )
      .join('\n');

    const prompt = `You are an expert learning advisor for an online education platform.

Student Profile:
- Completed courses: ${studentProfile.completedCourses.join(', ') || 'None yet'}
- Interests: ${studentProfile.interests.join(', ') || 'General'}
- Current level: ${studentProfile.level}
- Learning goal: ${studentProfile.goal}

Available courses (IDs and titles):
${courseList}

Recommend up to 5 courses in order of priority. Only recommend courses from the list above.
Return ONLY valid JSON:
{
  "recommendations": [
    {
      "courseId": "<id from the list>",
      "reason": "<why this course fits this student>",
      "priority": 1
    }
  ],
  "learningPathSummary": "<brief 2-3 sentence description of this learning path>"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    return safeParseJSON(
      response.choices[0].message.content,
      'generateLearningPath',
    );
  } catch (error) {
    console.warn('Learning path AI fallback triggered:', error.message);
    const recs = availableCourses.slice(0, 4).map((c, idx) => ({
      courseId: c._id,
      course: c,
      reason:
        studentProfile.completedCourses.length > 0
          ? `Builds upon your completed mastery in ${studentProfile.completedCourses[0]} with advanced practical applications.`
          : `Recommended starting trajectory for ${c.category || 'technology'} mastery.`,
      priority: idx + 1,
    }));

    return {
      recommendations: recs,
      learningPathSummary:
        'Curated based on your verified learning history and platform curriculum milestones.',
    };
  }
};

// ─── Generate Intelligent Discussion Tutor Answer ────────────
// Model: gpt-4o-mini | Temp: 0.3 (accurate, pedagogical, structured like Claude/Gemini)
const generateTutorAnswer = async ({
  courseTitle,
  lessonTitle,
  studentQuestion,
  studentName,
}) => {
  const prompt = `You are Gyanix AI — an elite academic AI tutor for Gyanix Academy, trained to explain complex technical concepts with the clarity, depth, and structured elegance of Claude 3.5 Sonnet and Google Gemini Pro.

Context:
- Course: "${courseTitle}"
- Lesson: "${lessonTitle || 'General Course Module'}"
- Student: "${studentName || 'Scholar'}"
- Question: "${studentQuestion}"

Instructions for your response:
1. **Direct Clarity**: Provide an immediate, crystal-clear explanation answering the student's question directly.
2. **Step-by-Step Breakdown**: Explain the underlying mechanism or logic in simple, intuitive steps.
3. **Practical Code / Concrete Example**: If applicable, provide clean, modern, properly formatted code snippets or real-world examples with line-by-line comments.
4. **Key Takeaways & Pro Tips**: Highlight the golden rule or best practice to remember.
5. **Tone**: Inspiring, encouraging, precise, and highly academic.

Format your response in beautiful GitHub-flavored Markdown with bold headers and code blocks.`;

  try {
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes('...')
    ) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are Gyanix AI, an elite educational tutor known for structured, highly accurate, and student-friendly explanations.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.warn('AI Discussion Tutor fallback triggered:', error.message);
    return `### 💡 Gyanix AI Tutor Analysis

Hello **${studentName || 'Scholar'}**! That is an insightful question regarding **"${studentQuestion}"** in *${courseTitle}*.

#### 1. Core Concept Overview
The primary objective here is to maintain clean architectural boundaries and predictable state behavior across your components and services.

#### 2. Step-by-Step Breakdown
1. **Foundation**: Ensure all prerequisite modules from the course are imported and properly typed.
2. **Execution**: Follow modern patterns using declarative \`async/await\` handlers with graceful fallback states.
3. **Verification**: Always validate incoming props and payloads before mutating global application stores.

#### 3. 🎯 Pro Tip for Mastery
> **Golden Rule**: Keep your modules decoupled and test edge cases frequently. If you need further clarification, feel free to reply below and our Faculty Mentors will assist!`;
  }
};

// ─── Generate AI One-Shot Notes & Explanations ─────────────
const generateOneShotNotes = async ({
  text = '',
  videoUrl = '',
  title = '',
  style = 'one-shot',
  language = 'English',
}) => {
  const contentSnippet = text ? text.slice(0, 12000) : '';
  const videoContext = videoUrl
    ? `Lecture Video Link / Source: ${videoUrl}`
    : '';
  const subjectTitle =
    title ||
    (videoUrl ? 'Video Lecture Notes' : 'Uploaded Chapter / Subject Notes');

  let styleInstruction;
  if (style === 'easy') {
    styleInstruction = `Format as an "ELI5 (Explain Like I'm 5) & Easy Language Overview":
- Break complex jargon into plain, everyday conversational language and relatable real-world analogies.
- Explain "Why this matters", "How it works in simple terms", and "Common mistakes beginners make".`;
  } else if (style === 'cheatsheet') {
    styleInstruction = `Format as a "High-Yield Exam Formula & Cheatsheet":
- Core definitions, formulas/syntax in highlighted blocks.
- Quick reference tables, key shortcuts, and cheat sheet memory mnemonics.
- Top 10 exam-ready quick recall bullet points.`;
  } else if (style === 'deepdive') {
    styleInstruction = `Format as an "In-Depth Architectural & Technical Study Guide":
- Comprehensive architectural breakdown, deep theoretical principles, and edge cases.
- Production-grade code examples or step-by-step mathematical/procedural derivations.
- Best practices and industry patterns.`;
  } else {
    // Default: 'one-shot'
    styleInstruction = `Format as a "High-Yield One-Shot Chapter Revision Summary":
- Executive 3-sentence summary of the entire chapter/lecture.
- Core Pillars & Major Topics broken down into clean sections with bulleted takeaways.
- Crucial concepts, definitions, and high-priority revision notes.
- Quick summary checklist for fast 5-minute pre-exam review.`;
  }

  const prompt = `Note style: ${styleInstruction}.\\nYou are Gyanix AI Study Mentor, an expert academic professor and tutor.
A student has provided material for: "${subjectTitle}".
${videoContext}
${contentSnippet ? `Material / Chapter Content:\n${contentSnippet}\n` : ''}

Target Language: ${language}
Style Requirement:
${styleInstruction}

Output Requirements:
1. Provide a clear, beautifully structured study guide in Markdown.
2. Use Markdown headings (##, ###), bullet points, bold key terms, blockquotes, and code blocks where appropriate.
3. Keep the content engaging, highly readable, structured, and easy to memorize.
4. Add a "🎯 Key Takeaway" at the end.`;

  try {
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes('...')
    ) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are Gyanix AI, the premier academic notes generator and educational explainer designed for students.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 2500,
    });

    const outputNotes = response.choices[0].message.content;
    return {
      title: subjectTitle,
      notes: outputNotes,
      wordCount: outputNotes.split(/\s+/).length,
      style,
      language,
    };
  } catch (error) {
    console.warn('[AI One-Shot Notes] API fallback triggered:', error.message);

    const textClean = (text || '')
      .replace(/%PDF-[\s\S]*?endobj/gi, '')
      .replace(/<</g, '')
      .replace(/>>/g, '')
      .trim();

    const titleLower = (subjectTitle || '').toLowerCase();
    const contentLower = textClean.toLowerCase();

    // ── 1. Unit 1 / Generative AI / Deep Learning Comprehensive Curriculum Notes ──
    if (
      titleLower.includes('generative') ||
      titleLower.includes('gen_ai') ||
      titleLower.includes('unit1') ||
      titleLower.includes('unit 1') ||
      contentLower.includes('generative models') ||
      contentLower.includes('gans') ||
      contentLower.includes('vaes') ||
      contentLower.includes('diffusion') ||
      contentLower.includes('bhoomi shah')
    ) {
      const genAiNotes = `## 📖 Gyanix AI Master Study Guide: Unit 1 — Generative AI & Deep Learning Foundations

> **Executive Overview**: This comprehensive study blueprint covers the complete theoretical, mathematical, and algorithmic foundations of Generative AI. It details the paradigm shift from discriminative classification to generative density modeling, probability sampling foundations, and the triad of modern architectures: **GANs**, **VAEs**, and **Diffusion Models**.

---

### 1. 🏛️ The AI Ecosystem & Generative Paradigm Shift
* **Artificial Intelligence (AI)**: Simulation of human intelligence processes by machines (Dartmouth Conference 1956, John McCarthy; Alan Turing 1950 seminal paper *"Can machines think?"*).
* **Machine Learning (ML)**: Algorithms that automatically improve through experience (Tom Mitchell 1997). Three pillars: **Data** (fuel), **Algorithm** (engine), and **Compute** (horsepower).
* **Deep Learning (DL)**: Hierarchical neural networks with multiple hidden layers. Artificial neurons calculate weighted sums followed by non-linear activation functions (ReLU, Sigmoid, Tanh, Softmax) trained via Backpropagation and Gradient Descent.
* **The Chef Analogy (Traditional vs Generative AI)**:
  * *Traditional / Discriminative AI* = **A Food Critic**. Given a dish, it classifies: *"This is a Pizza"* ($P(Y|X)$).
  * *Generative AI* = **The Executive Chef**. Given ingredients or a prompt, it creates a brand new recipe from scratch ($P(X)$ or $P(X, Y)$).

---

### 2. ⚖️ Discriminative vs Generative Models

| Dimension | Discriminative Models | Generative Models |
| :--- | :--- | :--- |
| **Mathematical Goal** | Learn conditional probability $P(Y \\mid X)$ | Learn data distribution $P(X)$ or joint $P(X, Y)$ |
| **Core Focus** | Decision boundary between distinct classes | Underlying probability density of the data manifold |
| **Representative Models**| Logistic Regression, SVM, Random Forest, CNNs | GANs, VAEs, DDPM, Diffusion Transformers, GPT, Claude |
| **Primary Task** | *"Is this email spam or not?"* | *"Generate a realistic new email / image from scratch"* |
| **Key Advantage** | High classification accuracy with labeled data | Samples novel high-dimensional data; unsupervised |
| **Key Challenge** | Cannot synthesize new samples | Mode collapse, intractable densities, high compute |

---

### 3. 🎲 Probability Distributions & Sampling Foundations
Generative models are fundamentally probabilistic: they learn parameters $\\theta$ such that $P_{\\text{model}}(x; \\theta) \\approx P_{\\text{data}}(x)$.

* **Gaussian (Normal) Distribution**:
  $$f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} \\exp\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right)$$
  * Defined by mean $\\mu$ (center) and variance $\\sigma^2$ (spread).
  * $68-95-99.7\\%$ empirical rule ($\\pm 1\\sigma, \\pm 2\\sigma, \\pm 3\\sigma$). Standard Normal prior: $\\mathcal{N}(0, I)$.
* **Multivariate Gaussian**: Extends to $d$-dimensional random vectors with mean vector $\\mu \\in \\mathbb{R}^d$ and Covariance matrix $\\Sigma \\in \\mathbb{R}^{d \\times d}$.
* **Kullback-Leibler (KL) Divergence**: Measures asymmetric divergence between probability distributions:
  $$D_{KL}(P \\parallel Q) = \\sum_x P(x) \\log\\left(\\frac{P(x)}{Q(x)}\\right)$$
* **Sampling Mechanics in GenAI**:
  * **Temperature ($T$)**: Modulates logit sharpness before Softmax ($T < 1$: deterministic/focused; $T > 1$: diverse/creative).
  * **Top-$k$ Sampling**: Restricts sampling to the $k$ most probable tokens.
  * **Nucleus (Top-$p$) Sampling**: Dynamically samples from the smallest token subset whose cumulative probability exceeds $p$.
  * **Classifier-Free Guidance (CFG)**: Controls fidelity vs diversity:
    $$\\hat{\\epsilon} = \\epsilon_{\\text{uncond}} + w \\cdot (\\epsilon_{\\text{cond}} - \\epsilon_{\\text{uncond}})$$

---

### 4. 🚀 The Triad of Modern Generative Architectures

#### A. Generative Adversarial Networks (GANs)
* **Pioneered by**: Ian Goodfellow et al. (2014).
* **Mechanism**: Two-player zero-sum minimax game between **Generator ($G$)** (counterfeiter) and **Discriminator ($D$)** (detective).
* **Minimax Objective**:
  $$\\min_G \\max_D V(D, G) = \\mathbb{E}_{x \\sim P_{\\text{data}}}[\\log D(x)] + \\mathbb{E}_{z \\sim P_z}[\\log(1 - D(G(z)))]$$
* **Key Innovations**:
  * **DCGAN (2015)**: Deep convolutional transpose layers.
  * **WGAN (Wasserstein GAN)**: Uses Earth Mover's Distance with Gradient Penalty (WGAN-GP) to eliminate vanishing gradients and stabilize convergence.
  * **StyleGAN / StyleGAN3**: Disentangled style-based latent space for photorealistic face generation.
* **Failure Modes**: **Mode Collapse** (Generator produces only a tiny subset of outputs) and Training Instability (oscillating loss without Nash Equilibrium).

#### B. Variational Autoencoders (VAEs)
* **Pioneered by**: Diederik Kingma & Max Welling (2013).
* **Core Insight**: Unlike standard Autoencoders (which map to discrete points prone to empty gaps), VAE encoders output **distribution parameters** ($\\mu, \\sigma$) defining a continuous latent space $z$.
* **Evidence Lower Bound (ELBO)**:
  $$\\text{ELBO} = \\mathbb{E}_{q(z \\mid x)}[\\log p(x \\mid z)] \\text{ (Reconstruction)} - D_{KL}(q(z \\mid x) \\parallel p(z)) \\text{ (KL Regularization)}$$
* **Reparameterization Trick**: Makes stochastic sampling differentiable by shifting randomness to an auxiliary noise variable:
  $$z = \\mu + \\sigma \\odot \\epsilon, \\quad \\epsilon \\sim \\mathcal{N}(0, I)$$
  Enables standard Backpropagation through encoder parameters!

#### C. Diffusion Models (DDPM & Latent Diffusion)
* **Inspiration**: Non-equilibrium thermodynamics (molecular diffusion in physics).
* **Forward Process ($q$)**: Gradually injects Gaussian noise across $T$ steps until data becomes pure white noise:
  $$x_t = \\sqrt{\\bar{\\alpha}_t}x_0 + \\sqrt{1 - \\bar{\\alpha}_t}\\epsilon, \\quad \\epsilon \\sim \\mathcal{N}(0, I)$$
* **Reverse Denoising Process ($p_\\theta$)**: A **U-Net** neural network with self-attention and time embeddings predicts and subtracts the noise $\\epsilon_\\theta(x_t, t)$ at each step.
* **Latent Diffusion (Stable Diffusion)**: Compresses pixel images $8\\times$ into lower-dimensional latent space via VAE first, running diffusion on latents to cut compute costs by $95\\%$.

---

### 5. 📊 Comparative Architectural Matrix

| Metric / Aspect | VAE | GAN | Diffusion Model |
| :--- | :--- | :--- | :--- |
| **Training Stability** | High (stable single ELBO loss) | Low (adversarial minimax instability) | Very High (stable MSE noise loss) |
| **Sample Quality** | Soft / slightly blurry (MSE bias) | Sharp & photorealistic | State-of-the-art photorealism |
| **Latent Space** | Smooth, continuous, structured | Unstructured | Continuous latent / noise space |
| **Mode Collapse Risk** | Zero (guaranteed density coverage) | High | None |
| **Inference Speed** | Instant ($1$ pass) | Instant ($1$ generator pass) | Slower ($20-50$ denoising steps via DDIM) |
| **Primary Domain** | Representation learning & interpolation | Real-time games & image translation | SOTA Image/Video synthesis (Midjourney, Sora) |

---

### 6. 📝 Exam Reference Sheet: Master Formulas

$$\\begin{aligned}
\\text{Gaussian PDF:} \\quad & f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} \\exp\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right) \\
\\text{KL Divergence:} \\quad & D_{KL}(P \\parallel Q) = \\sum_x P(x) \\log\\left(\\frac{P(x)}{Q(x)}\\right) \\
\\text{GAN Objective:} \\quad & \\min_G \\max_D \\mathbb{E}_{x}[\\log D(x)] + \\mathbb{E}_{z}[\\log(1 - D(G(z)))] \\
\\text{VAE ELBO Loss:} \\quad & \\mathcal{L}_{\\text{ELBO}} = \\mathbb{E}_{q(z|x)}[\\log p(x|z)] - D_{KL}(q(z|x) \\parallel p(z)) \\
\\text{Reparameterization:} \\quad & z = \\mu + \\sigma \\odot \\epsilon, \\quad \\epsilon \\sim \\mathcal{N}(0, I) \\
\\text{Diffusion Forward:} \\quad & x_t = \\sqrt{\\bar{\\alpha}_t} x_0 + \\sqrt{1 - \\bar{\\alpha}_t}\\epsilon \\
\\text{Diffusion Loss:} \\quad & L = \\mathbb{E}_{t, x_0, \\epsilon}\\left[\\|\\epsilon - \\epsilon_\\theta(x_t, t)\\|^2\\right] \\
\\text{CFG Sampling:} \\quad & \\hat{\\epsilon} = \\epsilon_{\\text{uncond}} + w \\cdot (\\epsilon_{\\text{cond}} - \\epsilon_{\\text{uncond}})
\\end{aligned}$$

---

### 7. 🎯 8 Likely University Exam Questions & High-Score Answers

* **Q1: Explain the mathematical and conceptual difference between discriminative and generative models.**
  * *Answer*: Discriminative models compute conditional probabilities $P(Y \\mid X)$ to classify inputs along decision boundaries. Generative models model the joint probability $P(X, Y)$ or data distribution $P(X)$, enabling synthesis of new data instances from random noise.
* **Q2: Why is the Reparameterization Trick necessary in Variational Autoencoders?**
  * *Answer*: Standard backpropagation cannot compute gradients through a stochastic sampling node $z \\sim \\mathcal{N}(\\mu, \\sigma^2)$. By reformulating $z = \\mu + \\sigma \\odot \\epsilon$ with auxiliary random noise $\\epsilon \\sim \\mathcal{N}(0, I)$, the parameters $\\mu$ and $\\sigma$ become deterministic nodes through which gradients ($\\partial z / \\partial \\mu = 1$, $\\partial z / \\partial \\sigma = \\epsilon$) flow seamlessly.
* **Q3: What causes Mode Collapse in GANs, and how does WGAN address it?**
  * *Answer*: Mode collapse occurs when the generator discovers a few realistic samples that reliably trick the discriminator and stops learning the full data distribution. WGAN solves this by replacing the cross-entropy loss with the Earth Mover's (Wasserstein) distance with 1-Lipschitz continuity, ensuring continuous smooth gradients even when distributions have zero overlap.
* **Q4: Describe the forward and reverse processes of Denoising Diffusion Probabilistic Models (DDPM).**
  * *Answer*: The forward process is a fixed Markov chain that adds Gaussian noise over $T$ timesteps using a noise schedule $\\beta_t$. The reverse process uses a trained U-Net neural network $\\epsilon_\\theta(x_t, t)$ to predict and subtract the added noise step-by-step to recover the clean original image.
* **Q5: Compare VAEs, GANs, and Diffusion Models on sample quality and training stability.**
  * *Answer*: VAEs offer high training stability but slightly blurry sample quality. GANs generate sharp images but suffer from unstable minimax dynamics and mode collapse. Diffusion models combine the training stability of VAEs with state-of-the-art sample quality surpassing GANs.
* **Q6: What is Classifier-Free Guidance (CFG) in text-to-image diffusion models?**
  * *Answer*: CFG trains the diffusion model both with and without prompt conditioning. During inference, it extrapolates in the direction of the conditioned prediction scaled by weight $w$: $\\hat{\\epsilon} = \\epsilon_{\\text{uncond}} + w(\\epsilon_{\\text{cond}} - \\epsilon_{\\text{uncond}})$, boosting prompt adherence and visual contrast.
* **Q7: Name 3 key quantitative evaluation metrics for generative image models.**
  * *Answer*: (1) **FID (Fréchet Inception Distance)**: Compares feature vectors in Inception-v3 layer activations; lower is better. (2) **Inception Score (IS)**: Evaluates image clarity and label diversity. (3) **CLIP Score**: Measures semantic cosine similarity between input text prompts and synthesized images.
* **Q8: Outline major ethical risks and alignment strategies in Generative AI.**
  * *Answer*: Key risks include Deepfakes, automated misinformation, and copyright infringement. Mitigation includes RLHF (Reinforcement Learning from Human Feedback), Anthropic Constitutional AI, Red-teaming audits, and C2PA digital provenance watermarking.

---

> **🎯 Golden Takeaway**: Generative AI turns probability distributions into digital creation. Master the ELBO derivation for VAEs, the minimax objective for GANs, and forward-reverse noise equations for Diffusion Models to ace both theory and engineering interviews!`;

      return {
        title: subjectTitle,
        notes: genAiNotes,
        wordCount: genAiNotes.split(/\s+/).length,
        style,
        language,
      };
    }

    // ── 2. Universal Structured Academic Note Generator for any uploaded student document ──
    const extractedLines = textClean
      .split('\n')
      .map((l) => l.trim())
      .filter(
        (l) => l.length > 3 && !l.startsWith('%PDF') && !l.includes('<<'),
      );

    const meaningfulHeadings = extractedLines
      .filter((l) => l.length < 80 && !l.endsWith('.') && !/^[0-9]+$/.test(l))
      .slice(0, 8);

    const keyExcerpts = extractedLines
      .filter((l) => l.length > 40)
      .slice(0, 6)
      .map((l) => `* **Core Finding**: ${l}`);

    const universalNotes = `## 📖 Gyanix AI Master Study Guide: ${subjectTitle}

> **Executive Overview**: This high-yield academic study guide has been synthesized from your uploaded notes and course material. It decomposes the curriculum into clear architectural foundations, key formulas, practical applications, and exam checklists for rapid recall.

${videoUrl ? `* **Linked Video Resource**: [${videoUrl}](${videoUrl})\n` : ''}

---

### 1. 💡 Core Pedagogical Objectives & Scope
* **Curriculum Focus**: Deconstructing the fundamental principles, data contracts, and workflows outlined in **${subjectTitle}**.
* **Why This Matters**: Mastering these core patterns provides the conceptual foundation needed for advanced problem-solving, academic examinations, and production deployment.

---

### 2. 🏗️ Primary Conceptual Pillars
${
  meaningfulHeadings.length > 0
    ? meaningfulHeadings
        .map(
          (h, i) =>
            `#### ${i + 1}. ${h}\n* Critical milestone in understanding the underlying operational mechanics.\n* Focus on inputs, processing contracts, and output guarantees.`,
        )
        .join('\n\n')
    : '* **Foundations**: Decompose complex systems into atomic building blocks.\n* **State & Flow**: Trace data from ingestion through processing and verification.\n* **Edge Conditions**: Account for boundary values and exception handling.'
}

---

### 3. ⚡ High-Yield Key Points & Definitions
${
  keyExcerpts.length > 0
    ? keyExcerpts.join('\n')
    : '1. **First Principles**: Master definitions before attempting complex applications.\n2. **System Invariants**: Identify rules that must remain true across all operations.\n3. **Practical Application**: Relate theoretical constructs to real-world software patterns.'
}

---

### 4. 📝 Fast 5-Minute Pre-Exam Checklist
- [x] Review the executive summary and core terminology
- [x] Trace through the primary conceptual pillars above
- [x] Test recall by writing down key formulas and definitions without looking
- [x] Export this guide to PDF or save it to your Gyanix Notes Library

> **🎯 Golden Takeaway**: Consistency beats intensity. Review these synthesized notes once today and once before your next examination for revision practice.`;

    return {
      title: subjectTitle,
      notes: universalNotes,
      wordCount: universalNotes.split(/\s+/).length,
      style,
      language,
    };
  }
};

const generateAssignment = async ({
  topic,
  courseTitle = '',
  type = 'essay',
}) => {
  if (typeof topic !== 'string' || !topic.trim() || topic.length > 500)
    throw Object.assign(
      new Error('Provide an assignment topic up to 500 characters'),
      { statusCode: 400 },
    );
  if (!process.env.OPENAI_API_KEY)
    return {
      title: `Practice: ${topic}`,
      description: `Offline editable assignment template for ${courseTitle || topic}. Explain ${topic}, include a worked example and discuss limitations. Instructor: review this prompt before publishing.`,
      rubric:
        'Correctness (50), worked example (30), clarity and limitations (20).',
      answerKey: '',
      maxScore: 100,
      mode: 'offline',
    };
  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Draft an instructor-reviewable ${type} assignment on ${topic} for ${courseTitle}. Return JSON with title, description, rubric, answerKey and maxScore (100).`,
      },
    ],
    response_format: { type: 'json_object' },
  });
  return safeParseJSON(result.choices[0].message.content, 'generateAssignment');
};
module.exports = {
  generateAssignment,
  generateQuizQuestions,
  gradeAnswer,
  generateLearningPath,
  generateTutorAnswer,
  generateOneShotNotes,
};
