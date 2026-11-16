/* Abdikhaliq's portfolio — JavaScript
   Everything here runs only in the browser. Nothing is saved or sent,
   except the light/dark theme choice, which is kept in localStorage. */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Theme toggle ---------- */
  var root = document.documentElement;
  var themeButton = $("#theme-toggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeButton.setAttribute("aria-pressed", String(theme === "dark"));
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) { /* storage blocked */ }
  applyTheme(savedTheme === "dark" ? "dark" : "light");

  themeButton.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
  });

  /* ---------- 2. Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- 3. Portrait: try common file names, then show a placeholder ---------- */
  var portrait = $("#portrait");
  var portraitFiles = [
    "images/portrait.jpg", "images/portrait.jpeg", "images/portrait.png", "images/portrait.webp",
    "images/abdikhaliq.jpg", "images/abdikhaliq.png", "images/profile.jpg", "images/profile.png"
  ];
  var portraitIndex = 0;

  function placeholderPortrait() {
    var svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='480' height='560' viewBox='0 0 480 560'>" +
      "<rect width='480' height='560' fill='#e7ece8'/>" +
      "<circle cx='240' cy='215' r='85' fill='#172d46'/>" +
      "<path d='M70 560c0-115 75-190 170-190s170 75 170 190z' fill='#172d46'/>" +
      "<text x='240' y='240' font-family='Arial' font-size='64' font-weight='bold' fill='#f2c66d' text-anchor='middle'>AMA</text>" +
      "</svg>";
    portrait.onerror = null;
    portrait.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function tryNextPortrait() {
    portraitIndex += 1;
    if (portraitIndex < portraitFiles.length) portrait.src = portraitFiles[portraitIndex];
    else placeholderPortrait();
  }

  portrait.onerror = tryNextPortrait;
  // The image may already have failed before this script ran
  if (portrait.complete && portrait.naturalWidth === 0) tryNextPortrait();

  /* ---------- 4. Active navigation link ---------- */
  var navLinks = $$("nav a");
  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + entry.target.id) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    navLinks.forEach(function (link) {
      var target = $(link.getAttribute("href"));
      if (target) sectionObserver.observe(target);
    });
  }

  /* ---------- 5. Count-up numbers + skill bars when they scroll into view ---------- */
  function countUp(el) {
    var target = Number(el.getAttribute("data-target"));
    if (reduceMotion || !target) { el.textContent = target; return; }
    var start = null;
    var duration = 900;
    function step(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(progress * target);
      if (progress < 1) window.requestAnimationFrame(step);
    }
    el.textContent = "0";
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains("stat-num")) countUp(entry.target);
        if (entry.target.classList.contains("skill")) entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    $$(".stat-num, .skill").forEach(function (el) { revealObserver.observe(el); });
  } else {
    $$(".skill").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 6. Project filter ---------- */
  var filterButtons = $$(".filter");
  var projectCards = $$(".project");
  var filterStatus = $("#filter-status");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      var shown = 0;

      filterButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === button)); });
      projectCards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.hidden = !match;
        if (match) shown += 1;
      });
      filterStatus.textContent = "Showing " + shown + (shown === 1 ? " project" : " projects");
    });
  });

  /* ---------- helpers for the prototypes ---------- */
  function setMessage(el, text, ok) {
    el.textContent = text;
    el.classList.toggle("ok", Boolean(ok));
  }

  function markInvalid(field, invalid) {
    if (invalid) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }

  /* ---------- 7. Kaabe: admission inquiry form (demo only) ---------- */
  var inquiryForm = $("#inquiry-form");
  var inquiryMessage = $("#inquiry-message");
  var parentName = $("#parent-name");
  var campus = $("#campus");
  var question = $("#question");

  inquiryForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = parentName.value.trim();
    var text = question.value.trim();

    markInvalid(parentName, !name);
    markInvalid(question, text.length < 5);

    if (!name) {
      setMessage(inquiryMessage, "Enter the parent name.", false);
      parentName.focus();
      return;
    }
    if (text.length < 5) {
      setMessage(inquiryMessage, "Write a question of at least 5 characters.", false);
      question.focus();
      return;
    }

    setMessage(
      inquiryMessage,
      "Thank you, " + name + ". This is a demo, so your question for " + campus.value + " was not sent.",
      true
    );
    inquiryForm.reset();
  });

  /* ---------- 8. Student Budget Tracker (demo only) ---------- */
  var expenseForm = $("#expense-form");
  var expenseMessage = $("#expense-message");
  var amountInput = $("#amount");
  var categorySelect = $("#category");
  var totalEl = $("#weekly-total");
  var budgetRows = $$(".budget-row");
  var expenses = { Food: 0, Transport: 0, Study: 0 };

  function renderBudget() {
    var total = expenses.Food + expenses.Transport + expenses.Study;

    budgetRows.forEach(function (row) {
      var amount = expenses[row.getAttribute("data-cat")];
      var percent = total ? Math.round((amount / total) * 100) : 0;
      $(".fill", row).style.width = percent + "%";
      $("output", row).textContent = percent + "%";
    });

    totalEl.textContent = total.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var amount = parseFloat(amountInput.value);

    if (!isFinite(amount) || amount <= 0) {
      markInvalid(amountInput, true);
      setMessage(expenseMessage, "Enter an amount greater than 0.", false);
      amountInput.focus();
      return;
    }

    markInvalid(amountInput, false);
    expenses[categorySelect.value] += amount;
    setMessage(expenseMessage, "Added " + amount + " to " + categorySelect.value + ".", true);
    amountInput.value = "";
    renderBudget();
  });

  $("#expense-reset").addEventListener("click", function () {
    expenses = { Food: 0, Transport: 0, Study: 0 };
    markInvalid(amountInput, false);
    amountInput.value = "";
    setMessage(expenseMessage, "Expenses cleared.", true);
    renderBudget();
  });

  renderBudget();

  /* ---------- 9. Campus Book Exchange (demo only) ---------- */
  var bookForm = $("#book-form");
  var bookMessage = $("#book-message");
  var bookTitle = $("#book-title");
  var bookCourse = $("#book-course");
  var bookCondition = $("#book-condition");
  var bookList = $("#book-list");

  var books = [
    { title: "Introduction to Algorithms", course: "Computer Science", condition: "Good" },
    { title: "Basic Statistics", course: "Statistics", condition: "Like new" }
  ];

  function renderBooks() {
    bookList.textContent = "";

    if (!books.length) {
      var empty = document.createElement("li");
      var emptyText = document.createElement("span");
      emptyText.className = "empty";
      emptyText.textContent = "No books listed yet. Add one above.";
      empty.appendChild(emptyText);
      bookList.appendChild(empty);
      return;
    }

    books.forEach(function (book, index) {
      var item = document.createElement("li");
      var info = document.createElement("span");
      var title = document.createElement("strong");
      var meta = document.createElement("small");
      var remove = document.createElement("button");

      title.textContent = book.title;
      meta.textContent = book.course + " · " + book.condition;
      info.appendChild(title);
      info.appendChild(meta);

      remove.type = "button";
      remove.className = "remove";
      remove.textContent = "×";
      remove.setAttribute("aria-label", "Remove " + book.title);
      remove.addEventListener("click", function () {
        books.splice(index, 1);
        renderBooks();
        setMessage(bookMessage, "Removed " + book.title + ".", true);
      });

      item.appendChild(info);
      item.appendChild(remove);
      bookList.appendChild(item);
    });
  }

  bookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var title = bookTitle.value.trim();

    if (!title) {
      markInvalid(bookTitle, true);
      setMessage(bookMessage, "Enter the book title.", false);
      bookTitle.focus();
      return;
    }

    markInvalid(bookTitle, false);
    books.unshift({
      title: title,
      course: bookCourse.value.trim() || "General",
      condition: bookCondition.value
    });
    renderBooks();
    setMessage(bookMessage, "Listed " + title + ".", true);
    bookForm.reset();
  });

  renderBooks();

  /* ---------- 10. Copy email ---------- */
  var copyButton = $("#copy-email");
  var copyStatus = $("#copy-status");
  var emailText = $("#email-link").textContent.trim();
  var copyTimer;

  function showCopied(success) {
    copyStatus.textContent = success ? "Email copied." : "Could not copy. Select the email and copy it.";
    copyButton.textContent = success ? "Copied" : "Copy email";
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(function () {
      copyButton.textContent = "Copy email";
      copyStatus.textContent = "";
    }, 2500);
  }

  function fallbackCopy(text) {
    var temp = document.createElement("textarea");
    temp.value = text;
    temp.setAttribute("readonly", "");
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(temp);
    showCopied(ok);
  }

  copyButton.addEventListener("click", function () {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(emailText).then(
        function () { showCopied(true); },
        function () { fallbackCopy(emailText); }
      );
    } else {
      fallbackCopy(emailText);
    }
  });
})();
