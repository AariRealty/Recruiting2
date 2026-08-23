"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const questions = [
  {
    id: "s1",
    eyebrow: "Plan Finder",
    heading: (
      <>
        What do you <em>need</em>
        <br />
        from a brokerage?
      </>
    ),
    sub: "Pick what sounds like you.",
    bars: [true, false, false, false],
    dots: [1, 0, 0, 0],
    options: [
      {
        value: "mentorship",
        label: "Walk me through it",
        hint: "I'm new and want guidance on my first deals",
      },
      {
        value: "growth",
        label: "Support when I need it",
        hint: "I can close deals but want a broker in my corner",
      },
      {
        value: "max",
        label: "Just let me run",
        hint: "I handle everything, just give me the tools",
      },
    ],
  },
  {
    id: "s2",
    eyebrow: "Plan Finder",
    heading: (
      <>
        Do you need help with
        <br />
        <em>paperwork?</em>
      </>
    ),
    sub: "Offers, MLS input, listing docs.",
    bars: [true, true, false, false],
    dots: [2, 1, 0, 0],
    options: [
      {
        value: "yes-paperwork",
        label: "Yes, handle it for me",
        hint: "I want someone doing my offers, MLS, and listing docs",
      },
      {
        value: "some-paperwork",
        label: "Sometimes",
        hint: "I do most of it but want help on tricky ones",
      },
      {
        value: "no-paperwork",
        label: "I handle my own",
        hint: "I know the forms and do everything myself",
      },
    ],
  },
  {
    id: "s3",
    eyebrow: "Plan Finder",
    heading: (
      <>
        Do you want <em>transaction</em>
        <br />
        <em>coordination?</em>
      </>
    ),
    sub: "Someone managing your deal from contract to close.",
    bars: [true, true, true, false],
    dots: [2, 2, 1, 0],
    options: [
      {
        value: "tc-yes",
        label: "Yes, on every deal",
        hint: "I want a TC handling timelines and deadlines",
      },
      {
        value: "tc-sometimes",
        label: "Sometimes, if I need it",
        hint: "Depends on the deal",
      },
      {
        value: "tc-no",
        label: "No, I manage my own deals",
        hint: "I track my own deadlines and paperwork",
      },
    ],
  },
  {
    id: "s4",
    eyebrow: "Plan Finder",
    heading: (
      <>
        How much <em>broker</em>
        <br />
        <em>involvement</em> do you want?
      </>
    ),
    sub: "Pick what sounds right.",
    bars: [true, true, true, true],
    dots: [2, 2, 2, 1],
    options: [
      {
        value: "full",
        label: "Oversee my transactions",
        hint: "Review my work, guide me through deals",
      },
      {
        value: "some",
        label: "Available when I need help",
        hint: "I run my deals but want backup",
      },
      {
        value: "minimal",
        label: "Just let me do my thing",
        hint: "I'm experienced, just need a license to hang",
      },
    ],
  },
];

interface PlanData {
  split: string;
  name: string;
  price: string;
  eyebrow?: string;
  items: string[];
  credits?: string[];
  tagline: string | null;
  confetti?: boolean;
}

const plans: Record<string, PlanData> = {
  mentorship: {
    split: "75/25",
    name: "Mentorship Path",
    price: "$59/mo",
    items: [
      "Broker guidance on your first 3 transactions",
      "Transaction coordinator on your first 3 transactions",
      "SkySlope Suite",
      "Aari CRM",
      "Live classes with brokerage attorney",
    ],
    credits: ["Offer Preparation", "Listing Input", "Listing Paperwork"],
    tagline: null,
  },
  growth: {
    split: "85/15",
    name: "Aari Growth",
    price: "$79/mo",
    eyebrow: "This is what you’re getting",
    items: [
      "SkySlope Suite",
      "Aari CRM",
      "Broker available as needed on your transactions",
      "Live classes with brokerage attorney",
    ],
    credits: ["Offer Preparation", "Listing Input", "Listing Paperwork"],
    tagline: "You run your deals. A broker is still in your corner.",
    confetti: true,
  },
  max: {
    split: "100%",
    name: "Aari Max",
    price: "$99/mo",
    items: [
      "Keep every dollar you earn",
      "SkySlope Suite",
      "Aari CRM",
      "Broker available for questions",
    ],
    tagline: null,
  },
};

const keeps = ["SkySlope Suite", "Aari CRM"];

function SlideToConfirm({
  label,
  enabled,
  onConfirm,
}: {
  label: string;
  enabled: boolean;
  onConfirm: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [marginLeft, setMarginLeft] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const moved = useRef(false);

  const getMaxLeft = useCallback(() => {
    if (!trackRef.current) return 200;
    return trackRef.current.clientWidth - 44 - 12;
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      moved.current = true;
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      const diff = x - startX.current;
      setMarginLeft(Math.min(Math.max(0, diff), getMaxLeft()));
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      const maxLeft = getMaxLeft();
      if (!moved.current) {
        setMarginLeft(maxLeft);
        setTimeout(() => {
          setMarginLeft(0);
          onConfirm();
        }, 400);
      } else if (marginLeft > maxLeft * 0.85) {
        setMarginLeft(maxLeft);
        setTimeout(() => {
          setMarginLeft(0);
          onConfirm();
        }, 300);
      } else {
        setMarginLeft(0);
      }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
    };
  }, [marginLeft, onConfirm, getMaxLeft]);

  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!enabled) return;
    dragging.current = true;
    moved.current = false;
    startX.current =
      "touches" in e ? e.touches[0].clientX : e.clientX;
  };

  const onTap = () => {
    if (!enabled || moved.current) return;
    const maxLeft = getMaxLeft();
    setMarginLeft(maxLeft);
    setTimeout(() => {
      setMarginLeft(0);
      onConfirm();
    }, 400);
  };

  return (
    <div
      ref={trackRef}
      onClick={onTap}
      className="relative flex items-center h-14 rounded-full mt-auto"
      style={{
        background: "rgba(20,18,16,.06)",
        opacity: enabled ? 1 : 0.3,
        pointerEvents: enabled ? "auto" : "none",
        transition: "opacity .4s",
        padding: 6,
      }}
    >
      <div
        onMouseDown={onStart}
        onTouchStart={onStart}
        className="w-11 h-11 rounded-full bg-[#141210] text-white flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing relative z-[2]"
        style={{
          marginLeft,
          transition: dragging.current ? "none" : "margin-left .3s",
          touchAction: "none",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[#6b6b6b] tracking-wider pointer-events-none">
        {label}
      </span>
      <span className="absolute right-4 flex gap-0.5 pointer-events-none">
        {[0.15, 0.25, 0.35].map((o, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            fill="none"
            stroke={`rgba(0,0,0,${o})`}
            strokeWidth={2}
            strokeLinecap="round"
            className="w-3.5 h-3.5"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        ))}
      </span>
    </div>
  );
}

export default function PlanFinderQuiz({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [screen, setScreen] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [lostItems, setLostItems] = useState<Set<number>>(new Set());
  const [morphed, setMorphed] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pick = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const showResult = () => {
    const score = { mentorship: 0, growth: 0, max: 0 };
    if (answers.s1 === "mentorship") score.mentorship += 3;
    if (answers.s1 === "growth") score.growth += 3;
    if (answers.s1 === "max") score.max += 3;
    if (answers.s2 === "yes-paperwork") score.mentorship += 2;
    if (answers.s2 === "some-paperwork") score.growth += 2;
    if (answers.s2 === "no-paperwork") score.max += 2;
    if (answers.s3 === "tc-yes") score.mentorship += 2;
    if (answers.s3 === "tc-sometimes") score.growth += 2;
    if (answers.s3 === "tc-no") score.max += 2;
    if (answers.s4 === "full") score.mentorship += 2;
    if (answers.s4 === "some") score.growth += 2;
    if (answers.s4 === "minimal") score.max += 2;

    let winner = "growth";
    if (score.mentorship >= score.growth && score.mentorship >= score.max)
      winner = "mentorship";
    else if (score.max >= score.growth && score.max >= score.mentorship)
      winner = "max";

    setResult(winner);
    setMorphed(null);
    setLostItems(new Set());
    setScreen(4);
    if (plans[winner].confetti) launchConfetti();
  };

  const retake = () => {
    setAnswers({});
    setResult(null);
    setMorphed(null);
    setLostItems(new Set());
    setScreen(0);
  };

  const showWhatYouLose = () => {
    if (!result) return;
    const plan = plans[result];
    const loseIndexes: number[] = [];
    plan.items.forEach((item, i) => {
      if (!keeps.includes(item)) loseIndexes.push(i);
    });

    loseIndexes.forEach((idx, i) => {
      setTimeout(() => {
        setLostItems((prev) => new Set([...prev, idx]));
      }, i * 350);
    });

    setTimeout(() => {
      setMorphed("max");
    }, loseIndexes.length * 350 + 400);
  };

  const showMentorshipSwitch = () => {
    setMorphed("mentorship");
  };

  const launchConfetti = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const colors = [
      "#c9b492",
      "#a3865c",
      "#ded8cd",
      "#2f6b46",
      "#e2e0d8",
      "#c9b492",
    ];
    const pieces = Array.from({ length: 80 }, () => ({
      x: canvas.width * 0.5 + (Math.random() - 0.5) * 60,
      y: canvas.height * 0.3,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 12 - 4,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 6.28,
      rv: (Math.random() - 0.5) * 0.3,
      gravity: 0.25,
      opacity: 1,
    }));
    let frame = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach((p) => {
        if (p.opacity <= 0) return;
        alive = true;
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rot += p.rv;
        p.vx *= 0.99;
        if (frame > 40) p.opacity -= 0.02;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (alive) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (!open) {
      retake();
    }
  }, [open]);

  if (!open) return null;

  const currentPlan =
    morphed ? plans[morphed] : result ? plans[result] : null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="relative w-full max-w-md h-full max-h-[100dvh] overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 25% 20%, rgba(201,180,146,.12) 0%, transparent 50%), radial-gradient(ellipse at 75% 70%, rgba(222,216,205,.18) 0%, transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(163,134,92,.08) 0%, transparent 40%), #fff",
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-[60] pointer-events-none"
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[70] w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-[#141210] text-lg font-light hover:bg-white transition-colors cursor-pointer"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}
        >
          &times;
        </button>

        {/* Question screens */}
        {questions.map((q, qIdx) => (
          <div
            key={q.id}
            className="absolute inset-0 flex flex-col overflow-y-auto transition-all duration-400"
            style={{
              padding: "24px 24px 28px",
              opacity: screen === qIdx ? 1 : 0,
              transform:
                screen === qIdx
                  ? "none"
                  : qIdx < screen
                    ? "translateX(-30px)"
                    : "translateX(30px)",
              pointerEvents: screen === qIdx ? "auto" : "none",
            }}
          >
            {/* Dark header */}
            <div
              className="rounded-[20px] text-center"
              style={{
                background: "#0a0a0a",
                padding: "28px 22px 22px",
                margin: "-24px -24px 20px",
              }}
            >
              <div style={{ paddingTop: 16 }} />
              <div
                className="text-[9px] font-bold tracking-[.22em] uppercase mb-2"
                style={{ color: "rgba(255,255,255,.4)" }}
              >
                {q.eyebrow}
              </div>
              <div className="flex gap-1.5 justify-center mb-4">
                {q.dots.map((d, i) => (
                  <span
                    key={i}
                    className="h-2 rounded-full"
                    style={{
                      width: d === 1 ? 22 : 8,
                      borderRadius: d === 1 ? 4 : "50%",
                      background:
                        d === 2
                          ? "#a3865c"
                          : d === 1
                            ? "#c9b492"
                            : "rgba(255,255,255,.15)",
                    }}
                  />
                ))}
              </div>
              <h2
                className="text-[26px] font-medium leading-[1.1] mb-1"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  color: "#fff",
                  textWrap: "balance",
                }}
              >
                {q.heading}
              </h2>
              <p
                className="text-xs mb-0"
                style={{ color: "rgba(255,255,255,.45)" }}
              >
                {q.sub}
              </p>
              <div className="flex gap-1.5 mt-3.5">
                {q.bars.map((filled, i) => (
                  <div
                    key={i}
                    className="flex-1 h-[3px] rounded-sm"
                    style={{
                      background: filled
                        ? "#a3865c"
                        : "rgba(255,255,255,.1)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="text-[9px] font-bold tracking-[.22em] uppercase text-[#9b948a] mb-3.5">
              Choose one
            </div>

            <div className="flex flex-col flex-1 mb-4">
              {q.options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => pick(q.id, opt.value)}
                  className="flex items-start gap-3.5 py-3.5 cursor-pointer select-none"
                  style={{
                    borderBottom: "1px solid #e2e0d8",
                    transition: "all .25s",
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-[3px]"
                    style={{
                      border:
                        answers[q.id] === opt.value
                          ? "2px solid #a3865c"
                          : "2px solid #e2e0d8",
                      background:
                        answers[q.id] === opt.value
                          ? "#a3865c"
                          : "transparent",
                      boxShadow:
                        answers[q.id] === opt.value
                          ? "0 0 0 3px rgba(201,180,146,.2)"
                          : "none",
                      transition: "all .25s",
                    }}
                  />
                  <div className="flex-1">
                    <div
                      className="text-[13px] leading-[1.3]"
                      style={{
                        fontWeight:
                          answers[q.id] === opt.value ? 700 : 600,
                        color: "#141210",
                      }}
                    >
                      {opt.label}
                    </div>
                    <div
                      className="text-[11px] mt-[3px] leading-[1.35]"
                      style={{
                        color:
                          answers[q.id] === opt.value
                            ? "#6b6b6b"
                            : "#9b948a",
                      }}
                    >
                      {opt.hint}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SlideToConfirm
              label={qIdx === 3 ? "See my plan" : "Next"}
              enabled={!!answers[q.id]}
              onConfirm={() => {
                if (qIdx === 3) showResult();
                else setScreen(qIdx + 1);
              }}
            />
          </div>
        ))}

        {/* Result screen */}
        <div
          className="absolute inset-0 flex flex-col overflow-y-auto transition-all duration-400"
          style={{
            padding: "24px 24px 28px",
            opacity: screen === 4 ? 1 : 0,
            transform: screen === 4 ? "none" : "translateX(30px)",
            pointerEvents: screen === 4 ? "auto" : "none",
          }}
        >
          <div className="text-center">
            <div className="text-[9px] font-bold tracking-[.22em] uppercase text-[#9b948a] mt-3 mb-2.5">
              Your Plan
            </div>
            <div className="flex gap-1.5 justify-center mb-3">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#a3865c" }}
                />
              ))}
            </div>
          </div>

          {/* Retake */}
          <button
            onClick={retake}
            className="absolute top-7 right-14 text-[10px] font-medium text-[#9b948a] hover:text-[#141210] transition-colors cursor-pointer bg-transparent border-none"
            style={{ fontFamily: "inherit", letterSpacing: ".02em" }}
          >
            Retake quiz
          </button>

          {currentPlan && (
            <>
              <div
                className="rounded-[20px] p-5 text-center mb-2.5"
                style={{
                  background: "rgba(255,255,255,.45)",
                  backdropFilter: "blur(12px)",
                  boxShadow:
                    "0 1px 2px rgba(0,0,0,.04), inset 0 1px 1px rgba(255,255,255,.7)",
                }}
              >
                <div className="text-[9px] font-bold tracking-[.2em] uppercase text-[#a3865c] mb-1">
                  {morphed === "max"
                    ? "OK, you got it"
                    : currentPlan.eyebrow || "We recommend"}
                </div>
                <div
                  className="text-5xl font-extrabold text-[#141210] leading-none"
                  style={{ letterSpacing: "-.03em" }}
                >
                  {morphed === "max" ? "100%" : currentPlan.split}
                </div>
                <div className="text-sm font-bold text-[#141210] mt-1">
                  {morphed === "max" ? "Aari Max" : currentPlan.name}
                </div>
                <div className="text-xs text-[#6b6b6b] mt-0.5">
                  {morphed === "max" ? "$99/mo" : currentPlan.price}
                </div>

                <div
                  className="text-left mt-3 pt-3 flex flex-col gap-[7px]"
                  style={{ borderTop: "1px solid rgba(0,0,0,.06)" }}
                >
                  <div
                    className="text-[9px] font-bold tracking-[.18em] uppercase"
                    style={{ color: "#a3865c" }}
                  >
                    Includes
                  </div>
                  {currentPlan.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-2 items-center text-xs"
                      style={{
                        color: "#141210",
                        opacity: lostItems.has(i) ? 0.35 : 1,
                        transition: "opacity .4s",
                      }}
                    >
                      <span
                        className="font-bold flex-shrink-0"
                        style={{
                          color: lostItems.has(i)
                            ? "#e2e0d8"
                            : "#a3865c",
                        }}
                      >
                        {lostItems.has(i) ? "✗" : "✓"}
                      </span>
                      <span
                        style={{
                          textDecoration: lostItems.has(i)
                            ? "line-through"
                            : "none",
                          textDecorationColor: "rgba(0,0,0,.25)",
                          color: lostItems.has(i)
                            ? "#9b948a"
                            : "#141210",
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                  {currentPlan.credits && (
                    <div
                      style={{
                        opacity: lostItems.size > 0 ? 0.35 : 1,
                        transition: "opacity .4s",
                      }}
                    >
                      <div className="flex gap-2 items-center text-xs text-[#141210] mt-1">
                        <span
                          className="font-bold flex-shrink-0"
                          style={{
                            color:
                              lostItems.size > 0 ? "#e2e0d8" : "#a3865c",
                          }}
                        >
                          {lostItems.size > 0 ? "✗" : "✓"}
                        </span>
                        <span
                          style={{
                            textDecoration:
                              lostItems.size > 0
                                ? "line-through"
                                : "none",
                          }}
                        >
                          2 service credits / month
                        </span>
                      </div>
                      <div className="pl-6 flex flex-col gap-0.5 mt-0.5">
                        {currentPlan.credits.map((c) => (
                          <div
                            key={c}
                            className="text-[11px] text-[#9b948a] pl-2.5 relative"
                            style={{
                              textDecoration:
                                lostItems.size > 0
                                  ? "line-through"
                                  : "none",
                            }}
                          >
                            <span
                              className="absolute left-0 font-bold"
                              style={{ color: "#c9b492" }}
                            >
                              &middot;
                            </span>
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {currentPlan.tagline && !morphed && (
                  <div
                    className="text-sm italic text-center mt-2.5 leading-[1.35]"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      color: "#a3865c",
                    }}
                  >
                    {currentPlan.tagline}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {!morphed && (
                <div className="flex flex-col gap-1.5 mt-2.5 items-center">
                  {result === "growth" && (
                    <>
                      <button
                        onClick={showWhatYouLose}
                        className="w-full rounded-full py-2.5 px-4 text-[10.5px] font-semibold text-[#6b6b6b] border border-[#e2e0d8] bg-transparent hover:border-[#141210] hover:text-[#141210] transition-all cursor-pointer"
                        style={{ fontFamily: "inherit" }}
                      >
                        Give me 100%
                      </button>
                      <button
                        onClick={showMentorshipSwitch}
                        className="w-full rounded-full py-2.5 px-4 text-[10.5px] font-semibold text-[#6b6b6b] border border-[#e2e0d8] bg-transparent hover:border-[#141210] hover:text-[#141210] transition-all cursor-pointer leading-[1.35]"
                        style={{ fontFamily: "inherit" }}
                      >
                        I&apos;m brand new
                      </button>
                    </>
                  )}
                  {result === "max" && (
                    <>
                      <button
                        onClick={() => {
                          setResult("growth");
                          setMorphed(null);
                          setLostItems(new Set());
                          launchConfetti();
                        }}
                        className="w-full rounded-full py-2.5 px-4 text-[10.5px] font-semibold text-[#6b6b6b] border border-[#e2e0d8] bg-transparent hover:border-[#141210] hover:text-[#141210] transition-all cursor-pointer"
                        style={{ fontFamily: "inherit" }}
                      >
                        I want backup
                      </button>
                      <button
                        onClick={showMentorshipSwitch}
                        className="w-full rounded-full py-2.5 px-4 text-[10.5px] font-semibold text-[#6b6b6b] border border-[#e2e0d8] bg-transparent hover:border-[#141210] hover:text-[#141210] transition-all cursor-pointer leading-[1.35]"
                        style={{ fontFamily: "inherit" }}
                      >
                        I&apos;m brand new
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex-1" />
          <SlideToConfirm
            label="Start application"
            enabled={true}
            onConfirm={() =>
              window.open("https://joinaari.com", "_blank")
            }
          />
        </div>
      </div>
    </div>
  );
}
