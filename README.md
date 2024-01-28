
<link rel="stylesheet" href="./styles/style.css">
<link rel="stylesheet" href="./styles/hero-section.css">

<style>
    :root {
    --clr-dark: #070a13;
    --clr-light: #f1f5f9;
    --clr-slate400: #94a3b8;
    --clr-slate600: #475569;
    --clr-slate800: #1e293b;
    --clr-rose: #e11d48;
    --clr-indigo: #4f46e5;
    --clr-sky: #67e8f9;
    --clr-yellow: #f1dc1d;

    /* rose rgb(225, 29, 72) */
    /* indigo rgb(79, 70, 229) */

    /* sizes */
    --size-xxs: 0.5rem;
    --size-xs: 0.75rem;
    --size-sm: 0.875rem;
    --size-base: 1rem;
    --size-lg: 1.125rem;
    --size-xl: 1.25rem;
    --size-2xl: 1.5rem;
    --size-3xl: 1.875rem;
    --size-4xl: 2.25rem;
    --size-5xl: 3rem;
    --size-6xl: 3.75rem;
    --size-7xl: 4.5rem;
    --size-8xl: 6rem;
    --size-9xl: 8rem;
    --size-10xl: 10rem;
    }

    .container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    }

    a {
    color: var(--clr-rose);
    }
    strong {
    color: var(--clr-indigo);
    }
    .hero {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    }
    .hero-img {
    border-radius: 50%;
    width: 6rem;
    height: 6rem;
    }
    .hero-subtitle {
    color: var(--clr-indigo);
    font-size: var(--size-base);
    line-height: 0.9;
    text-transform: capitalize;
    }
    .hero-title {
    color: var(--clr-slate400);
    text-transform: uppercase;
    font-size: var(--size-8xl);
    letter-spacing: -0.05em;
    line-height: 0.9;
    }
    .hero-description {
    color: var(--clr-slate600);
    font-size: var(--size-sm);
    max-width: 60ch;
    }
</style>

<div style="background-color: black;">
    <main class="container">
        <section class="hero">
            <img src='./assets/me2.jpg' alt='profile' class='hero-img'>
            <h2 class="hero-subtitle">hi, i'm chris 👋</h2>
            <h1 class="hero-title">front-end <br>web developer.</h1>
            <p class="hero-description"> A passionate <strong>Frontend</strong> web developer and some <strong>Backend</strong> knowledge , also a <strong>UI/UX </strong> enthusiast specialized in building stunning pixel-perfect interactive websites/applications. </p>
        </section>
    </main>
</div>
