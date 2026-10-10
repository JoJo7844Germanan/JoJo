const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const progress = document.querySelector(".scroll-progress");
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(el);
});

const filterTabs = document.querySelectorAll(".filter-tab");
const projectCards = document.querySelectorAll(".project-card");
filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter;
    filterTabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-selected", String(selected));
    });
    projectCards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !show);
      if (show) {
        card.animate(
          [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 260, easing: "ease-out" }
        );
      }
    });
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  nav.classList.toggle("open", open);
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Menü öffnen");
}));

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-link");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach((section) => sectionObserver.observe(section));


// Theme: automatic system preference until the visitor makes a choice.
const themeButton = document.querySelector(".theme-toggle");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
const getSavedTheme = () => {
  try { return localStorage.getItem("jojo-theme"); } catch { return null; }
};
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.setAttribute("aria-pressed", String(theme === "dark"));
  themeButton.setAttribute("aria-label", theme === "dark" ? "Zum Tagmodus wechseln" : "Zum Nachtmodus wechseln");
  themeButton.title = theme === "dark" ? "Tagmodus einschalten" : "Nachtmodus einschalten";
  if (themeMeta) themeMeta.content = theme === "dark" ? "#10151a" : "#f6f8f5";
}
applyTheme(document.documentElement.dataset.theme || "light");
themeButton.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("jojo-theme", next); } catch {}
});
systemTheme.addEventListener("change", (event) => {
  if (!["light", "dark"].includes(getSavedTheme())) applyTheme(event.matches ? "dark" : "light");
});

// Public blog: data is loaded from a static JSON file (GitHub Pages compatible).
const blogGrid = document.getElementById('blog-grid');
const blogReader = document.getElementById('blog-reader');
const blogArticle = document.getElementById('blog-article');
const blogBack = document.getElementById('blog-back');
let publishedPosts = [];
const safeDate = (date) => { const d = new Date(date + 'T12:00:00'); return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('de-DE', {day:'2-digit',month:'long',year:'numeric'}); };
function renderBlog() {
  blogGrid.replaceChildren();
  if (!publishedPosts.length) {
    const empty = document.createElement('p'); empty.className='blog-empty';
    empty.textContent='Hier erscheinen bald meine ersten Blogbeiträge. Schau später wieder vorbei! ✨';
    blogGrid.append(empty); return;
  }
  publishedPosts.forEach(post => {
    const card=document.createElement('article');card.className='blog-card';
    const cover=document.createElement('div');cover.className='blog-cover';
    if (post.image) { const img=document.createElement('img');img.src=post.image;img.alt=post.title;img.loading='lazy';cover.append(img); }
    else cover.textContent='✦';
    const content=document.createElement('div');content.className='blog-content';
    const meta=document.createElement('div');meta.className='blog-meta';meta.textContent=`${post.category || 'Allgemein'} · ${safeDate(post.date)}`;
    const title=document.createElement('h3');title.textContent=post.title;
    const excerpt=document.createElement('p');excerpt.textContent=post.excerpt || post.body.slice(0,140)+'…';
    const button=document.createElement('button');button.type='button';button.className='blog-open';button.textContent='Weiterlesen ↗';button.addEventListener('click',()=>openBlog(post));
    content.append(meta,title,excerpt,button);card.append(cover,content);blogGrid.append(card);
  });
}
function openBlog(post) {
  blogArticle.replaceChildren();
  const meta=document.createElement('div');meta.className='blog-meta';meta.textContent=`${post.category || 'Allgemein'} · ${safeDate(post.date)}`;
  const title=document.createElement('h2');title.textContent=post.title;
  blogArticle.append(meta,title);
  if(post.image) { const img=document.createElement('img');img.src=post.image;img.alt=post.title;blogArticle.append(img); }
  const body=document.createElement('div');body.className='blog-body';body.textContent=post.body;blogArticle.append(body);
  blogGrid.hidden=true;blogReader.hidden=false;document.getElementById('blog').scrollIntoView({behavior:'smooth'});
}
blogBack.addEventListener('click',()=>{blogReader.hidden=true;blogGrid.hidden=false;document.getElementById('blog').scrollIntoView({behavior:'smooth'});});
fetch('blog-posts.json', {cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Blog unavailable');return r.json();}).then(posts=>{
  if(!Array.isArray(posts))throw Error('Invalid blog');
  publishedPosts=posts.filter(p=>p && p.published===true && typeof p.title==='string' && typeof p.body==='string').sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  renderBlog();
}).catch(()=>{blogGrid.replaceChildren();const p=document.createElement('p');p.className='blog-empty';p.textContent='Blogbeiträge konnten nicht geladen werden. Bitte die Website über einen Webserver öffnen.';blogGrid.append(p);});
