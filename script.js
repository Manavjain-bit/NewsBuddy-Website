(function () {

  const API_KEY = "0ff4df498512690a15d5f03b302386d8";

  const CATEGORY_MAP = {
    "Top Stories": "general",
    "World": "world",
    "Business": "business",
    "Technology": "technology",
    "Science": "science",
    "Sports": "sports",
    "Entertainment": "entertainment",
    "Health": "health"
  };

  const tabsEl = document.getElementById("nb-tabs");
  const gridEl = document.getElementById("nb-grid");
  const statusEl = document.getElementById("nb-status");
  const searchInput = document.getElementById("nb-search");

  let currentCategory = "Top Stories";
  let cache = {};
  let allArticles = [];

  // Create Tabs
  Object.keys(CATEGORY_MAP).forEach(cat => {
    const tab = document.createElement("div");

    tab.className =
      "nb-tab" + (cat === currentCategory ? " active" : "");

    tab.textContent = cat;

    tab.onclick = () => {

      currentCategory = cat;

      document
        .querySelectorAll(".nb-tab")
        .forEach(t => t.classList.remove("active"));

      tab.classList.add("active");

      loadCategory(cat);
    };

    tabsEl.appendChild(tab);
  });

  async function fetchNews(category) {

    try {

      const url =
        `https://gnews.io/api/v4/top-headlines?` +
        `category=${category}` +
        `&lang=en` +
        `&country=in` +
        `&max=20` +
        `&apikey=${API_KEY}`;

      const response = await fetch(url);

      const data = await response.json();

      if (!data.articles) return [];

      return data.articles.map(article => ({
        title: article.title,
        desc: article.description || "",
        link: article.url,
        img: article.image,
        source: article.source.name,
        pubDate: article.publishedAt
      }));

    } catch (err) {

      console.error(err);
      return [];
    }
  }

  async function loadCategory(cat) {

    if (cache[cat]) {
      renderArticles(cache[cat]);
      return;
    }

    statusEl.textContent = "Loading news...";
    gridEl.innerHTML = "";

    const articles =
      await fetchNews(CATEGORY_MAP[cat]);

    if (!articles.length) {

      statusEl.textContent =
        "Unable to load news.";

      return;
    }

    cache[cat] = articles;

    allArticles = [
      ...allArticles,
      ...articles
    ];

    statusEl.textContent =
      `${articles.length} articles loaded`;

    renderArticles(articles);
  }

  function renderArticles(articles) {

    gridEl.innerHTML = "";

    articles.forEach(article => {

      const card = document.createElement("div");

      card.className = "nb-card";

      card.innerHTML = `
        <img src="${article.img || ""}"
             onerror="this.style.display='none'">

        <span class="nb-src">
          ${article.source}
        </span>

        <h3>${article.title}</h3>

        <div class="nb-meta">
          ${new Date(article.pubDate)
            .toLocaleDateString()}
        </div>

        <p>${article.desc}</p>

        <div class="nb-card-actions">
          <a class="nb-link-btn"
             href="${article.link}"
             target="_blank">
             Read Full →
          </a>
        </div>
      `;

      gridEl.appendChild(card);
    });
  }

  document
    .getElementById("nb-search-btn")
    .onclick = searchNews;

  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter")
      searchNews();
  });

  function searchNews() {

    const query =
      searchInput.value
      .trim()
      .toLowerCase();

    if (!query) {

      renderArticles(
        cache[currentCategory] || []
      );

      return;
    }

    const filtered =
      allArticles.filter(article =>
        article.title
          .toLowerCase()
          .includes(query) ||

        article.desc
          .toLowerCase()
          .includes(query)
      );

    statusEl.textContent =
      `${filtered.length} results found`;

    renderArticles(filtered);
  }

  document
    .getElementById("nb-refresh-btn")
    .onclick = () => {

      cache = {};
      allArticles = [];

      loadCategory(currentCategory);
    };

  loadCategory(currentCategory);

})();