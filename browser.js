window.items = [];
window.chapter = document.getElementById("chapter-info").textContent;

document.querySelectorAll(".carousel-item").forEach((item) => {
  if (item.children.length === 1) {
    window.items.push(item.children[0].getAttribute("data-src"));
  }
});

window.config = {
  chapter: window.chapter,
  items: window.items,
};
