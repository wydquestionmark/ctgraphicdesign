/*
  GitHub Pages gallery setup:
  1. Put images in /student-work
  2. In the CONFIG below, set owner and repo to your GitHub username/org and repository name.
  3. Commit/push. The gallery reads the folder through the public GitHub Contents API.

  Example:
  const CONFIG = { owner: "wordslikerad", repo: "owts-graphic-design", branch: "main", folder: "student-work" };
*/
const CONFIG = {
  owner: "YOUR-GITHUB-USERNAME",
  repo: "YOUR-REPO-NAME",
  branch: "main",
  folder: "student-work"
};

const fallbackImages = [
  "student-work/placeholder-1.svg",
  "student-work/placeholder-2.svg",
  "student-work/placeholder-3.svg",
  "student-work/placeholder-4.svg",
  "student-work/placeholder-5.svg",
  "student-work/placeholder-6.svg"
];

const allowed = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
const gallery = document.querySelector("#gallery");
const status = document.querySelector("#gallery-status");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const closeButton = document.querySelector("#close-lightbox");

function prettyName(path) {
  return path.split("/").pop().replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

function renderGallery(images) {
  gallery.innerHTML = "";
  images.forEach((src) => {
    const caption = prettyName(src);
    const button = document.createElement("button");
    button.className = "gallery-item";
    button.type = "button";
    button.setAttribute("aria-label", `Open ${caption}`);
    button.innerHTML = `<img src="${src}" alt="${caption}" loading="lazy"><span class="gallery-caption">${caption}</span>`;
    button.addEventListener("click", () => openLightbox(src, caption));
    gallery.appendChild(button);
  });
  status.textContent = `${images.length} image${images.length === 1 ? "" : "s"} in Student work.`;
}

async function getGithubFolderImages() {
  if (CONFIG.owner.includes("YOUR-") || CONFIG.repo.includes("YOUR-")) return fallbackImages;

  const api = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.folder}?ref=${CONFIG.branch}`;
  const response = await fetch(api);
  if (!response.ok) throw new Error("Could not load GitHub folder contents.");
  const files = await response.json();
  return files
    .filter((file) => file.type === "file" && allowed.test(file.name))
    .map((file) => file.download_url)
    .sort((a, b) => a.localeCompare(b));
}

function openLightbox(src, caption) {
  lightboxImage.src = src;
  lightboxImage.alt = caption;
  lightboxCaption.textContent = caption;
  lightbox.showModal();
}

closeButton.addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.open) lightbox.close();
});

getGithubFolderImages()
  .then((images) => renderGallery(images.length ? images : fallbackImages))
  .catch(() => {
    status.textContent = "Using sample images. Check your GitHub owner/repo/folder settings in script.js.";
    renderGallery(fallbackImages);
  });
