const versionLabel = document.getElementById("version");
const updateLabel = document.getElementById("update");
const installButton = document.getElementById("install");

const describe = {
  disabled: () => "Updates are off in development builds",
  idle: () => "",
  checking: () => "Checking for updates…",
  "up-to-date": () => "Up to date",
  available: (s) => `Update ${s.version} found`,
  downloading: (s) => `Downloading ${s.version} (${s.percent}%)`,
  downloaded: (s) => `Update ${s.version} is ready`,
  error: (s) => `Update failed: ${s.message}`,
};

function render(state) {
  updateLabel.textContent = describe[state.status](state);
  installButton.hidden = state.status !== "downloaded";
}

versionLabel.textContent = `Version ${window.james.version}`;
installButton.addEventListener("click", () => window.james.installUpdate());
window.james.onUpdateState(render);
window.james.getUpdateState().then(render);
