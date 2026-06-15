import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import memoriseLogo from "../../assets/images/memrise.png";
import avatar1 from "../../assets/images/avatar/1.jpg";
import avatar2 from "../../assets/images/avatar/2.jpg";
import avatar3 from "../../assets/images/avatar/3.jpg";
import avatar4 from "../../assets/images/avatar/4.jpg";
import "./Home.css";

const u = (id, w = 1400) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const IMG = {
    hero:      u("1464822759023-fed622ff2c3b", 2000),
    showcaseA: u("1523050854058-8df90110c9f1"),
    showcaseB: u("1461896836934-ffe607ba8211"),
    showcaseC: u("1551632811-561732d1e306"),
    svc1:      u("1567427018141-0584cfcbf1b8"),
    svc2:      u("1517245386807-bb43f82c33c4"),
    svc3:      u("1512941937669-90a1b58e7e9c"),
    svc4:      u("1451187580459-43490279c0fa"),
    step1:     u("1499750310107-5fef28a66643", 900),
    step2:     u("1454165804606-c3d57bc86b40", 900),
    step3:     u("1484480974693-6ca0a78fb36b", 900),
    step4:     u("1522202176988-66273c2fd55f", 900),
    about:     u("1517649763962-0c623066013b"),
    cta:       u("1502920917128-1aa500764cbd", 2000),
};

/* ---- Icons ----------------------------------------------------------------- */
const ArrowIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.5L10 17.5L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const I = {
    trophy: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 21h8M12 17v4M7 3h10v5a5 5 0 0 1-10 0V3Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 5H4a3 3 0 0 0 3 4.5M17 5h3a3 3 0 0 1-3 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    lock: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    ),
    globe: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M3.5 12h17M12 3.5c2.5 2.3 3.7 5.2 3.7 8.5s-1.2 6.2-3.7 8.5c-2.5-2.3-3.7-5.2-3.7-8.5s1.2-6.2 3.7-8.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
    ),
    sparkle: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3l2.1 5.6L20 11l-5.9 2.4L12 19l-2.1-5.6L4 11l5.9-2.4L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M19 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" fill="currentColor" />
        </svg>
    ),
    verified: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 12.5l4 4L18.5 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

/* ---- Atoms ------------------------------------------------------------------ */
const Eyebrow = ({ children, light, index, ...rest }) => (
    <span className={`lp-eyebrow ${light ? "is-light" : ""}`} {...rest}>
        {index ? <span className="lp-eyebrow-idx">{index}</span> : <span className="lp-eyebrow-dot" aria-hidden="true" />}
        {children}
    </span>
);

const PillButton = ({ to, href, children, variant = "ink", ...rest }) => {
    const cls = `lp-pill lp-pill-${variant}`;
    const inner = (
        <>
            <span className="lp-pill-label">{children}</span>
            <span className="lp-pill-badge" aria-hidden="true"><ArrowIcon /></span>
        </>
    );
    if (href) return <a className={cls} href={href} {...rest}>{inner}</a>;
    return <Link className={cls} to={to} {...rest}>{inner}</Link>;
};

const Media = ({ src, alt = "", tone = "neutral", className = "", ...rest }) => {
    const [failed, setFailed] = useState(false);
    return (
        <span className={`lp-media tone-${tone} ${className}`}>
            {!failed && <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />}
        </span>
    );
};

const Stars = ({ className = "" }) => (
    <span className={`lp-stars ${className}`} aria-label="5 out of 5 stars">
        {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
    </span>
);

/* Animated number that counts up the first time it scrolls into view. */
function CountUp({ value, decimals = 0, suffix = "", duration = 1700 }) {
    const ref = useRef(null);
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce || !("IntersectionObserver" in window)) {
            setDisplay(value);
            return;
        }
        let raf;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                io.disconnect();
                const t0 = performance.now();
                const tick = (now) => {
                    const p = Math.min((now - t0) / duration, 1);
                    const eased = 1 - Math.pow(1 - p, 4);
                    setDisplay(value * eased);
                    if (p < 1) raf = requestAnimationFrame(tick);
                };
                raf = requestAnimationFrame(tick);
            },
            { threshold: 0.4 }
        );
        io.observe(el);
        return () => { io.disconnect(); cancelAnimationFrame(raf); };
    }, [value, duration]);

    const text = display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return <span ref={ref}>{text}{suffix}</span>;
}

/* ---- Content ----------------------------------------------------------------- */
const STATS = [
    { value: 10000, suffix: "+",    label: "Active members" },
    { value: 50000, suffix: "+",    label: "Trophies showcased" },
    { value: 120,   suffix: "+",    label: "Achievement categories" },
    { value: 4.9,   suffix: " / 5", label: "Average rating", decimals: 1 },
];

const SHOWCASES = [
    { img: IMG.showcaseA, tone: "warm",    tag: "Academic",  title: "Maya Chen",      text: "Dean's list, two research fellowships and a published thesis — curated into one elegant profile." },
    { img: IMG.showcaseB, tone: "cool",    tag: "Athletics", title: "Daniel Okafor",  text: "Marathon finishes, regional medals and personal bests, all preserved in a single timeline." },
    { img: IMG.showcaseC, tone: "neutral", tag: "Personal",  title: "Sofia Ramos",    text: "From a first summit to a decade of milestones — a story worth sharing, beautifully told." },
];

const BAND = [
    { icon: I.trophy,  title: "100% free to start",   text: "No credit card required" },
    { icon: I.lock,    title: "Privacy first",        text: "You control every trophy" },
    { icon: I.globe,   title: "Share anywhere",       text: "One link for everything" },
    { icon: I.sparkle, title: "Beautiful by default", text: "Designed to impress" },
];

const SERVICES = [
    { n: "01", title: "Showcase achievements", text: "Display every accomplishment in one beautifully designed, share-ready profile built to be admired.", tags: ["Profiles", "Galleries", "Timelines"], img: IMG.svc1, tone: "warm" },
    { n: "02", title: "Organize by category",  text: "Sort your trophies into Academic, Sports, Leadership, Certifications and more — your story, structured.", tags: ["Categories", "Collections", "Tags"], img: IMG.svc2, tone: "neutral" },
    { n: "03", title: "Share anywhere",         text: "Publish one public link and celebrate your wins with recruiters, peers and the world — instantly.", tags: ["Public link", "Social", "Embed"], img: IMG.svc3, tone: "cool" },
    { n: "04", title: "Private & secure",       text: "You decide what stays private and what goes public. Granular control, always in your hands.", tags: ["Privacy", "Control", "Backups"], img: IMG.svc4, tone: "dark" },
];

const STEPS = [
    { n: "1", img: IMG.step1, title: "Create your profile",   text: "Sign up in seconds and claim your personal achievement space." },
    { n: "2", img: IMG.step2, title: "Add your trophies",     text: "Upload awards, certificates and milestones with photos and detail." },
    { n: "3", img: IMG.step3, title: "Organize & curate",     text: "Group accomplishments into categories that tell your story." },
    { n: "4", img: IMG.step4, title: "Share & get noticed",   text: "Publish your profile and let the world celebrate your success." },
];

const PLANS = [
    {
        name: "Free",
        price: "$0",
        per: "forever",
        tagline: "Everything you need to start showcasing.",
        features: [
            "Up to 10 trophies on your profile",
            "Public profile link to share",
            "Cover & avatar customization",
            "All achievement categories",
        ],
        cta: "Start for free",
    },
    {
        name: "Premium",
        price: "$10",
        per: "per year",
        tagline: "For collections that never stop growing.",
        badge: "Best value",
        featured: true,
        features: [
            "Unlimited trophies & posts",
            "Priority profile presentation",
            "Advanced privacy controls",
            "Early access to new features",
        ],
        cta: "Go Premium",
    },
];

const TESTIMONIALS = [
    { quote: "Trophy Hub gave my achievements a place to live. Sharing my profile felt like finally getting the recognition years of hard work deserved.", name: "Sarah Miller",  role: "Member since 2024",  avatar: avatar1 },
    { quote: "I used to keep certificates in a drawer. Now everything I've earned sits in one profile I'm genuinely proud to send to anyone.",           name: "James Carter",  role: "Product Designer",   avatar: avatar2 },
    { quote: "The presentation is unreal. My profile looks like it was designed by a studio — recruiters mention it in every interview.",                name: "Priya Nair",    role: "Engineering Lead",   avatar: avatar3 },
];

const FAQS = [
    { q: "What is Trophy Hub?",              a: "Trophy Hub is your personal digital achievement showcase — a single place to display accomplishments, celebrate victories and share your success story with the world." },
    { q: "Is Trophy Hub free to use?",       a: "Yes. You can create a profile and start showcasing your achievements for free. Premium unlocks unlimited trophies and even more ways to organize and present your collection — for just $10 a year." },
    { q: "Who is behind Trophy Hub?",        a: "Trophy Hub is powered by Memorise, a platform dedicated to recognizing and celebrating human achievement and preserving it for generations to come." },
    { q: "Can I control what others see?",   a: "Absolutely. Privacy is built in — you decide exactly which trophies are public and which stay private to you." },
    { q: "What kind of achievements can I add?", a: "Anything worth remembering — academic awards, sports titles, certifications, leadership roles, personal milestones and more." },
];

function Faq() {
    const [open, setOpen] = useState(0);
    return (
        <div className="lp-faq-list">
            {FAQS.map((item, i) => {
                const isOpen = open === i;
                return (
                    <div key={i} className={`lp-faq-item ${isOpen ? "is-open" : ""}`}>
                        <button type="button" className="lp-faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
                            <span>{item.q}</span>
                            <span className="lp-faq-sign" aria-hidden="true" />
                        </button>
                        <div className="lp-faq-a"><p>{item.a}</p></div>
                    </div>
                );
            })}
        </div>
    );
}

export default function Home() {
    const [active, setActive] = useState(0);
    const rootRef = useRef(null);
    const t = TESTIMONIALS[active];
    const move = (dir) => setActive((prev) => (prev + dir + TESTIMONIALS.length) % TESTIMONIALS.length);

    // Smooth-scroll to an in-page section. The landing scrolls inside the app's
    // nested scroll container, so scrollIntoView (which walks up to it) is more
    // reliable than native hash navigation.
    const scrollToId = (e, id) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Scroll-reveal that works inside the app's nested scroll container.
    // (AOS keys off window scroll, which never fires here, so it left every
    //  [data-aos] element stuck at opacity:0 — this uses IntersectionObserver,
    //  which observes real viewport visibility regardless of scroll parent.)
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const items = Array.from(root.querySelectorAll("[data-aos]"));
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduce || !("IntersectionObserver" in window)) {
            items.forEach((el) => el.classList.add("is-inview"));
            return;
        }

        // Hide first, then reveal — guarded by a class so content is never
        // stuck hidden if JS doesn't run.
        root.classList.add("is-reveal-ready");
        items.forEach((el) => {
            const delay = Number(el.getAttribute("data-aos-delay")) || 0;
            if (delay) el.style.transitionDelay = `${delay}ms`;
        });

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-inview");
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        );
        items.forEach((el) => io.observe(el));

        return () => io.disconnect();
    }, []);

    return (
        <div className="lp" ref={rootRef}>
            {/* ============ HERO ============ */}
            <section className="lp-hero">
                <div className="lp-hero-media" aria-hidden="true">
                    <img src={IMG.hero} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <span className="lp-hero-scrim" />
                    <span className="lp-hero-glow" />
                    <span className="lp-hero-grain" />
                </div>

                <div className="lp-container lp-hero-inner">
                    <div className="lp-hero-top">
                        <Eyebrow light>Powered by Memorise</Eyebrow>
                        <span className="lp-hero-tag">Digital Trophy Hub</span>
                    </div>

                    <div className="lp-hero-body">
                        <span className="lp-hero-badge">
                            <span className="lp-hero-badge-dot" />
                            The home of achievement — open to everyone
                        </span>
                        <h1 className="lp-hero-title">
                            Every achievement<br />
                            deserves its <em>moment.</em>
                        </h1>
                    </div>

                    <div className="lp-hero-bottom">
                        <div className="lp-hero-aside">
                            <p className="lp-hero-sub">
                                Trophy Hub is the digital home for your proudest wins — a curated, share-ready showcase of every award, milestone and moment worth remembering.
                            </p>
                            <div className="lp-hero-actions">
                                <PillButton to="/register" variant="light">Create your profile</PillButton>
                                <Link to="/login" className="lp-text-link is-light">Sign in</Link>
                            </div>
                            <div className="lp-hero-proof">
                                <div className="lp-avatars">
                                    <img src={avatar1} alt="" /><img src={avatar2} alt="" />
                                    <img src={avatar3} alt="" /><img src={avatar4} alt="" />
                                </div>
                                <div className="lp-proof-text">
                                    <Stars />
                                    <span>Trusted by 10,000+ achievers worldwide</span>
                                </div>
                            </div>
                        </div>

                        {/* In-flow glass product preview — profile card + live toast */}
                        <div className="lp-hero-float" aria-hidden="true">
                            <div className="lp-glass-card lp-float-profile">
                                <div className="lp-glass-head">
                                    <img src={avatar2} alt="" />
                                    <div className="lp-glass-id">
                                        <strong>Daniel Okafor</strong>
                                        <span>@daniel.runs</span>
                                    </div>
                                    <span className="lp-verify">{I.verified}</span>
                                </div>
                                <div className="lp-glass-shelf">
                                    <span>🏆</span><span>🥇</span><span>🎖️</span><span>⛰️</span>
                                </div>
                                <div className="lp-glass-stats">
                                    <div><strong>48</strong><span>Trophies</span></div>
                                    <div><strong>12</strong><span>Categories</span></div>
                                    <div><strong>2.4k</strong><span>Views</span></div>
                                </div>
                            </div>
                            <div className="lp-glass-card lp-float-toast">
                                <span className="lp-toast-icon">🏆</span>
                                <div>
                                    <strong>New trophy unlocked</strong>
                                    <span>Marathon Finisher · just now</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ MARQUEE TICKER ============ */}
            <div className="lp-ticker" aria-hidden="true">
                <div className="lp-ticker-track">
                    {["Academic Excellence","Sports Titles","Career Awards","Personal Milestones","Certifications","Leadership Roles","Community Service","Creative Wins","Research Fellowships","Athletic Records"].concat(["Academic Excellence","Sports Titles","Career Awards","Personal Milestones","Certifications","Leadership Roles","Community Service","Creative Wins","Research Fellowships","Athletic Records"]).map((item, i) => (
                        <span key={i} className="lp-ticker-item">{item}<span className="lp-ticker-dot" aria-hidden="true" /></span>
                    ))}
                </div>
            </div>

            {/* ============ STATS ============ */}
            <section className="lp-section lp-stats">
                <div className="lp-container">
                    <p className="lp-stats-lead" data-aos="fade-up">
                        <strong>We believe every accomplishment is worth preserving.</strong>{" "}
                        The numbers behind a fast-growing community that takes recognition seriously.
                    </p>
                    <div className="lp-stats-grid">
                        {STATS.map((s, i) => (
                            <div className="lp-stat" key={s.label} data-aos="fade-up" data-aos-delay={i * 80}>
                                <div className="lp-stat-num">
                                    <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
                                </div>
                                <div className="lp-stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ INTRO STATEMENT ============ */}
            <section className="lp-section lp-intro">
                <div className="lp-container">
                    <Eyebrow data-aos="fade-up">What is Trophy Hub</Eyebrow>
                    <p className="lp-intro-statement" data-aos="fade-up" data-aos-delay="80">
                        A <em>home</em> for everything you've worked hard to earn.{" "}
                        <span className="is-muted">Trophy Hub turns scattered certificates and forgotten medals into a living, beautiful profile you'll be proud to share — for years to come.</span>
                    </p>
                </div>
            </section>

            {/* ============ SHOWCASE ============ */}
            <section className="lp-section lp-showcase">
                <div className="lp-container">
                    <div className="lp-head" data-aos="fade-up">
                        <Eyebrow index="[01]">Showcase</Eyebrow>
                        <h2 className="lp-display">Profiles worth <em>admiring.</em></h2>
                        <p className="lp-head-sub">A glimpse at how members turn a lifetime of wins into one unforgettable page.</p>
                    </div>

                    <div className="lp-showcase-grid">
                        {SHOWCASES.map((s, i) => (
                            <article className="lp-show-card" key={s.title} data-aos="fade-up" data-aos-delay={i * 100}>
                                <Media src={s.img} alt={s.title} tone={s.tone} className="lp-show-media" />
                                <span className="lp-show-scrim" aria-hidden="true" />
                                <span className="lp-chip lp-show-tag">{s.tag}</span>
                                <div className="lp-show-meta">
                                    <h3>{s.title}</h3>
                                    <p>{s.text}</p>
                                    <Link to="/register" className="lp-link-arrow is-light">View profile <ArrowIcon /></Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ FEATURE HIGHLIGHT BAND ============ */}
            <div className="lp-band" data-aos="fade-up">
                <div className="lp-container lp-band-inner">
                    {BAND.map((b, i) => (
                        <React.Fragment key={b.title}>
                            {i > 0 && <span className="lp-band-sep" aria-hidden="true" />}
                            <div className="lp-band-item">
                                <span className="lp-band-icon">{b.icon}</span>
                                <div><strong>{b.title}</strong><p>{b.text}</p></div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ============ SERVICES (numbered rows) ============ */}
            <section className="lp-section lp-services" id="features">
                <div className="lp-container">
                    <div className="lp-head" data-aos="fade-up">
                        <Eyebrow index="[02]">Why Trophy Hub</Eyebrow>
                        <h2 className="lp-display">Built to make your wins <em>unforgettable.</em></h2>
                    </div>

                    <div className="lp-svc-list">
                        {SERVICES.map((s, i) => (
                            <article className="lp-svc-row" key={s.n} data-aos="fade-up" data-aos-delay={i * 60}>
                                <span className="lp-svc-num">{s.n}</span>
                                <div className="lp-svc-copy">
                                    <h3><span className="lp-svc-bullet" />{s.title}</h3>
                                    <p>{s.text}</p>
                                    <div className="lp-svc-tags">{s.tags.map((tg) => <span className="lp-chip" key={tg}>{tg}</span>)}</div>
                                </div>
                                <Media src={s.img} alt={s.title} tone={s.tone} className="lp-svc-media" />
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ PROCESS ============ */}
            <section className="lp-section lp-process" id="how-it-works">
                <div className="lp-container">
                    <div className="lp-head" data-aos="fade-up">
                        <Eyebrow index="[03]">How it works</Eyebrow>
                        <h2 className="lp-display">From locked away to <em>showcased</em> in four steps.</h2>
                    </div>

                    <div className="lp-process-grid">
                        {STEPS.map((s, i) => (
                            <div className="lp-step" key={s.n} data-aos="fade-up" data-aos-delay={i * 100}>
                                <Media src={s.img} alt={s.title} tone="neutral" className="lp-step-media" />
                                <span className="lp-step-num">{s.n}</span>
                                <h3>{s.title}</h3>
                                <p>{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ PRICING ============ */}
            <section className="lp-section lp-pricing">
                <div className="lp-container">
                    <div className="lp-head lp-head-center" data-aos="fade-up">
                        <Eyebrow index="[04]">Pricing</Eyebrow>
                        <h2 className="lp-display">Start free. <em>Stay</em> for everything else.</h2>
                        <p className="lp-head-sub">One simple upgrade, priced like a coffee — not a subscription trap.</p>
                    </div>

                    <div className="lp-pricing-grid">
                        {PLANS.map((p, i) => (
                            <article className={`lp-plan ${p.featured ? "is-featured" : ""}`} key={p.name} data-aos="fade-up" data-aos-delay={i * 120}>
                                {p.badge && <span className="lp-plan-badge">{p.badge}</span>}
                                <div className="lp-plan-head">
                                    <h3>{p.name}</h3>
                                    <p>{p.tagline}</p>
                                </div>
                                <div className="lp-plan-price">
                                    <strong>{p.price}</strong>
                                    <span>{p.per}</span>
                                </div>
                                <ul className="lp-plan-list">
                                    {p.features.map((f) => (
                                        <li key={f}><span className="lp-plan-check"><CheckIcon /></span>{f}</li>
                                    ))}
                                </ul>
                                <PillButton to="/register" variant={p.featured ? "light" : "ink"}>{p.cta}</PillButton>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ ABOUT MEMORISE (DARK) ============ */}
            <section className="lp-about">
                <div className="lp-container lp-about-grid">
                    <div className="lp-about-copy" data-aos="fade-right">
                        <Eyebrow light>About Memorise</Eyebrow>
                        <p className="lp-about-lead">
                            Memorise is on a mission to recognize and celebrate human achievement —{" "}
                            <span className="is-dim">building a community where accomplishments are valued, recognized and preserved for generations to come.</span>
                        </p>
                        <p className="lp-about-text">Trophy Hub is how that mission reaches your everyday milestones. Join thousands already sharing their success stories.</p>
                        <PillButton href="https://mrise.ca/" target="_blank" rel="noopener noreferrer" variant="light">Visit Memorise</PillButton>
                    </div>
                    <div className="lp-about-visual" data-aos="fade-left" data-aos-delay="120">
                        <Media src={IMG.about} alt="Celebrating achievement" tone="dark" className="lp-about-media" />
                        <div className="lp-about-logo"><img src={memoriseLogo} alt="Memorise" /></div>
                    </div>
                </div>
            </section>

            {/* ============ TESTIMONIAL ============ */}
            <section className="lp-section lp-testi">
                <div className="lp-container lp-testi-grid" data-aos="fade-up">
                    <div className="lp-testi-portrait">
                        <Media src={t.avatar} alt={t.name} tone="neutral" className="lp-testi-media" />
                        <div className="lp-testi-dots">
                            {TESTIMONIALS.map((_, i) => (
                                <button key={i} type="button" className={`lp-testi-dot ${i === active ? "is-active" : ""}`} aria-label={`Testimonial ${i + 1}`} onClick={() => setActive(i)} />
                            ))}
                        </div>
                    </div>
                    <div className="lp-testi-body">
                        <Eyebrow>Testimonials</Eyebrow>
                        <Stars className="lp-testi-stars" />
                        <blockquote key={active}>"{t.quote}"</blockquote>
                        <div className="lp-testi-foot">
                            <div className="lp-testi-author">
                                <strong>{t.name}</strong>
                                <small>{t.role}</small>
                            </div>
                            <div className="lp-testi-nav">
                                <button type="button" aria-label="Previous testimonial" onClick={() => move(-1)}>←</button>
                                <button type="button" aria-label="Next testimonial" onClick={() => move(1)}>→</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ FAQ ============ */}
            <section className="lp-section lp-faq" id="faq">
                <div className="lp-container lp-faq-wrap">
                    <div className="lp-faq-head" data-aos="fade-up">
                        <Eyebrow>FAQ</Eyebrow>
                        <h2 className="lp-display">Everything you need to <em>know.</em></h2>
                    </div>
                    <div data-aos="fade-up" data-aos-delay="100"><Faq /></div>
                </div>
            </section>

            {/* ============ CTA ============ */}
            <section className="lp-cta">
                <div className="lp-cta-media" aria-hidden="true">
                    <img src={IMG.cta} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <span className="lp-cta-scrim" />
                    <span className="lp-cta-glow" />
                </div>
                <div className="lp-container lp-cta-inner" data-aos="fade-up">
                    <Eyebrow light>Get started today</Eyebrow>
                    <h2 className="lp-cta-title">Ready to showcase<br />your <em>achievements?</em></h2>
                    <p className="lp-cta-sub">Join Trophy Hub and start celebrating every win — it only takes a minute.</p>
                    <div className="lp-cta-actions">
                        <PillButton to="/register" variant="light">Create account</PillButton>
                        <Link to="/login" className="lp-text-link is-light">Sign in</Link>
                    </div>
                </div>
            </section>

            {/* ============ FOOTER ============ */}
            <footer className="lp-footer">
                <div className="lp-container">
                    <div className="lp-footer-top">
                        <div className="lp-footer-brand">
                            <span className="lp-footer-name">Trophy Hub</span>
                            <p>Your personal digital achievement showcase. Display, celebrate and share every victory worth remembering.</p>
                            <span className="lp-footer-by">Powered by Memorise</span>
                        </div>
                        <div className="lp-footer-cols">
                            <div className="lp-footer-col">
                                <h4>Account</h4>
                                <Link to="/login">Sign in</Link>
                                <Link to="/register">Create account</Link>
                                <Link to="/forgot-password">Reset password</Link>
                            </div>
                            <div className="lp-footer-col">
                                <h4>Explore</h4>
                                <a href="#features" onClick={(e) => scrollToId(e, "features")}>Features</a>
                                <a href="#how-it-works" onClick={(e) => scrollToId(e, "how-it-works")}>How it works</a>
                                <a href="#faq" onClick={(e) => scrollToId(e, "faq")}>FAQ</a>
                            </div>
                            <div className="lp-footer-col">
                                <h4>Memorise</h4>
                                <a href="https://mrise.ca/" target="_blank" rel="noopener noreferrer">Website</a>
                                <a href="https://mrise.ca/" target="_blank" rel="noopener noreferrer">Contact</a>
                                <a href="https://mrise.ca/" target="_blank" rel="noopener noreferrer">Privacy</a>
                            </div>
                        </div>
                    </div>

                    <div className="lp-wordmark" aria-hidden="true">TROPHY HUB</div>

                    <div className="lp-footer-bottom">
                        <span>© {new Date().getFullYear()} Trophy Hub — Powered by Memorise.</span>
                        <div className="lp-footer-socials">
                            <a href="https://mrise.ca/" target="_blank" rel="noopener noreferrer">Instagram</a>
                            <a href="https://mrise.ca/" target="_blank" rel="noopener noreferrer">X</a>
                            <a href="https://mrise.ca/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
